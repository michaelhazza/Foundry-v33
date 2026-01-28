import bcrypt from 'bcrypt';
import { db, pool } from './index.js';
import { organizations } from './schema/organizations.js';
import { users } from './schema/users.js';
import { eq } from 'drizzle-orm';

const SEED_ORG = {
  name: 'Default Organization',
  slug: 'default-org',
};

const SEED_ADMIN = {
  email: 'admin@foundry.local',
  password: 'admin123!',
  name: 'Admin User',
  role: 'owner' as const,
};

async function seedAdmin() {
  console.log('Seeding default organization and admin user...');

  await db.transaction(async (tx) => {
    // Check if org already exists
    const existingOrg = await tx
      .select()
      .from(organizations)
      .where(eq(organizations.slug, SEED_ORG.slug))
      .limit(1);

    let orgId: number;

    if (existingOrg.length > 0) {
      orgId = existingOrg[0].id;
      console.log(`Organization "${SEED_ORG.name}" already exists (id: ${orgId})`);
    } else {
      const [newOrg] = await tx
        .insert(organizations)
        .values({
          name: SEED_ORG.name,
          slug: SEED_ORG.slug,
        })
        .returning();
      orgId = newOrg.id;
      console.log(`Created organization "${SEED_ORG.name}" (id: ${orgId})`);
    }

    // Check if admin user already exists
    const existingUser = await tx
      .select()
      .from(users)
      .where(eq(users.email, SEED_ADMIN.email))
      .limit(1);

    if (existingUser.length > 0) {
      console.log(`Admin user "${SEED_ADMIN.email}" already exists (id: ${existingUser[0].id})`);
    } else {
      const passwordHash = await bcrypt.hash(SEED_ADMIN.password, 12);

      const [newUser] = await tx
        .insert(users)
        .values({
          organizationId: orgId,
          email: SEED_ADMIN.email,
          passwordHash,
          name: SEED_ADMIN.name,
          role: SEED_ADMIN.role,
        })
        .returning();

      console.log(`Created admin user "${SEED_ADMIN.email}" (id: ${newUser.id})`);
    }
  });

  console.log('Seed complete');
  console.log(`  Email:    ${SEED_ADMIN.email}`);
  console.log(`  Password: ${SEED_ADMIN.password}`);
  await pool.end();
}

seedAdmin().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
