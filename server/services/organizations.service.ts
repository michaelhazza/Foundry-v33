import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { eq, and, isNull, sql } from 'drizzle-orm';
import { db } from '../db/index.js';
import { organizations, users } from '../db/schema/index.js';
import { NotFoundError, ConflictError } from '../errors/index.js';

const BCRYPT_ROUNDS = 10;

export async function getOrganization(organizationId: number) {
  const [org] = await db
    .select()
    .from(organizations)
    .where(eq(organizations.id, organizationId))
    .limit(1);

  if (!org) {
    throw new NotFoundError('Organization');
  }

  return org;
}

export async function listUsers(
  organizationId: number,
  options: { page?: number; limit?: number } = {}
) {
  const page = options.page || 1;
  const limit = options.limit || 20;
  const offset = (page - 1) * limit;

  const conditions = and(
    eq(users.organizationId, organizationId),
    isNull(users.deletedAt)
  );

  const [countResult] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(users)
    .where(conditions);

  const total = countResult.count;

  const items = await db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      role: users.role,
      organizationId: users.organizationId,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
    })
    .from(users)
    .where(conditions)
    .orderBy(users.createdAt)
    .limit(limit)
    .offset(offset);

  return {
    items,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function addUser(
  organizationId: number,
  data: { email: string; name: string; role?: 'owner' | 'admin' | 'member' }
) {
  const existingUser = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, data.email))
    .limit(1);

  if (existingUser.length > 0) {
    throw new ConflictError('A user with this email already exists');
  }

  const randomPassword = crypto.randomBytes(16).toString('hex');
  const passwordHash = await bcrypt.hash(randomPassword, BCRYPT_ROUNDS);

  const [user] = await db
    .insert(users)
    .values({
      organizationId,
      email: data.email,
      name: data.name,
      passwordHash,
      role: data.role || 'member',
    })
    .returning();

  const { passwordHash: _, ...userWithoutPassword } = user;

  return userWithoutPassword;
}

export async function updateOrganization(
  organizationId: number,
  data: { name: string }
) {
  const [org] = await db
    .select()
    .from(organizations)
    .where(eq(organizations.id, organizationId))
    .limit(1);

  if (!org) {
    throw new NotFoundError('Organization');
  }

  const [updated] = await db
    .update(organizations)
    .set({ name: data.name, updatedAt: new Date() })
    .where(eq(organizations.id, organizationId))
    .returning();

  return updated;
}
