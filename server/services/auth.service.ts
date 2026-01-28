import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { eq, and, isNull } from 'drizzle-orm';
import { db } from '../db/index.js';
import { users, organizations, passwordResetTokens } from '../db/schema/index.js';
import { config } from '../config.js';
import { NotFoundError, ConflictError, ValidationError, UnauthorizedError } from '../errors/index.js';

const BCRYPT_ROUNDS = 10;

function generateToken(user: { id: number; email: string; organizationId: number; role: string }): string {
  return jwt.sign(
    { id: user.id, email: user.email, organizationId: user.organizationId, role: user.role },
    config.jwt.secret,
    { expiresIn: config.jwt.expiry }
  );
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export async function register(data: {
  name: string;
  email: string;
  password: string;
  organizationName: string;
}) {
  const existingUser = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, data.email))
    .limit(1);

  if (existingUser.length > 0) {
    throw new ConflictError('A user with this email already exists');
  }

  const passwordHash = await bcrypt.hash(data.password, BCRYPT_ROUNDS);
  const slug = slugify(data.organizationName) + '-' + Date.now();

  const result = await db.transaction(async (tx) => {
    const [organization] = await tx
      .insert(organizations)
      .values({
        name: data.organizationName,
        slug,
      })
      .returning();

    const [user] = await tx
      .insert(users)
      .values({
        organizationId: organization.id,
        email: data.email,
        passwordHash,
        name: data.name,
        role: 'owner',
      })
      .returning();

    return { organization, user };
  });

  const token = generateToken({
    id: result.user.id,
    email: result.user.email,
    organizationId: result.user.organizationId,
    role: result.user.role,
  });

  const { passwordHash: _, ...userWithoutPassword } = result.user;

  return {
    user: userWithoutPassword,
    organization: result.organization,
    token,
  };
}

export async function login(data: { email: string; password: string }) {
  const [user] = await db
    .select()
    .from(users)
    .where(and(eq(users.email, data.email), isNull(users.deletedAt)))
    .limit(1);

  if (!user) {
    throw new UnauthorizedError('Invalid email or password');
  }

  const isValidPassword = await bcrypt.compare(data.password, user.passwordHash);
  if (!isValidPassword) {
    throw new UnauthorizedError('Invalid email or password');
  }

  const token = generateToken({
    id: user.id,
    email: user.email,
    organizationId: user.organizationId,
    role: user.role,
  });

  const { passwordHash: _, ...userWithoutPassword } = user;

  return {
    user: userWithoutPassword,
    token,
  };
}

export async function getCurrentUser(userId: number) {
  const [user] = await db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      role: users.role,
      organizationId: users.organizationId,
      organizationName: organizations.name,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
    })
    .from(users)
    .innerJoin(organizations, eq(users.organizationId, organizations.id))
    .where(and(eq(users.id, userId), isNull(users.deletedAt)))
    .limit(1);

  if (!user) {
    throw new NotFoundError('User');
  }

  return user;
}

export async function forgotPassword(data: { email: string }) {
  const [user] = await db
    .select({ id: users.id, email: users.email })
    .from(users)
    .where(and(eq(users.email, data.email), isNull(users.deletedAt)))
    .limit(1);

  if (!user) {
    // Return silently to prevent email enumeration
    return { message: 'If an account with that email exists, a reset link has been sent.' };
  }

  const rawToken = crypto.randomBytes(32).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  await db.insert(passwordResetTokens).values({
    userId: user.id,
    tokenHash,
    expiresAt,
  });

  // Log token for development (email sending deferred)
  console.log(`[Password Reset] Token for ${user.email}: ${rawToken}`);

  return { message: 'If an account with that email exists, a reset link has been sent.' };
}

export async function resetPassword(data: { token: string; newPassword: string }) {
  const tokenHash = crypto.createHash('sha256').update(data.token).digest('hex');

  const [resetToken] = await db
    .select()
    .from(passwordResetTokens)
    .where(eq(passwordResetTokens.tokenHash, tokenHash))
    .limit(1);

  if (!resetToken) {
    throw new ValidationError('Invalid or expired reset token');
  }

  if (resetToken.usedAt) {
    throw new ValidationError('This reset token has already been used');
  }

  if (new Date() > resetToken.expiresAt) {
    throw new ValidationError('This reset token has expired');
  }

  const passwordHash = await bcrypt.hash(data.newPassword, BCRYPT_ROUNDS);

  await db.transaction(async (tx) => {
    await tx
      .update(users)
      .set({ passwordHash, updatedAt: new Date() })
      .where(eq(users.id, resetToken.userId));

    await tx
      .update(passwordResetTokens)
      .set({ usedAt: new Date() })
      .where(eq(passwordResetTokens.id, resetToken.id));
  });

  return { message: 'Password has been reset successfully' };
}

export async function changePassword(data: {
  userId: number;
  currentPassword: string;
  newPassword: string;
}) {
  const [user] = await db
    .select()
    .from(users)
    .where(and(eq(users.id, data.userId), isNull(users.deletedAt)))
    .limit(1);

  if (!user) {
    throw new NotFoundError('User');
  }

  const isValidPassword = await bcrypt.compare(data.currentPassword, user.passwordHash);
  if (!isValidPassword) {
    throw new ValidationError('Current password is incorrect');
  }

  const passwordHash = await bcrypt.hash(data.newPassword, BCRYPT_ROUNDS);

  await db
    .update(users)
    .set({ passwordHash, updatedAt: new Date() })
    .where(eq(users.id, data.userId));

  return { message: 'Password changed successfully' };
}

export async function verifyToken(token: string) {
  try {
    const decoded = jwt.verify(token, config.jwt.secret) as {
      id: number;
      email: string;
      organizationId: number;
      role: string;
    };
    return { valid: true, decoded };
  } catch {
    throw new UnauthorizedError('Invalid or expired token');
  }
}
