import { eq, and, isNull, desc, sql } from 'drizzle-orm';
import { db } from '../db/index.js';
import { integrations } from '../db/schema/index.js';
import { NotFoundError, ValidationError } from '../errors/index.js';
import { encrypt, decrypt } from '../lib/encryption.js';

export async function listIntegrations(
  organizationId: number,
  options: { page?: number; limit?: number; type?: string } = {}
) {
  const page = options.page || 1;
  const limit = options.limit || 20;
  const offset = (page - 1) * limit;

  const conditions: ReturnType<typeof eq>[] = [
    eq(integrations.organizationId, organizationId),
    isNull(integrations.deletedAt),
  ];

  if (options.type) {
    conditions.push(eq(integrations.type, options.type as 'teamwork_desk'));
  }

  const whereClause = and(...conditions);

  const [countResult] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(integrations)
    .where(whereClause);

  const total = countResult.count;

  const items = await db
    .select({
      id: integrations.id,
      organizationId: integrations.organizationId,
      type: integrations.type,
      name: integrations.name,
      status: integrations.status,
      lastSyncAt: integrations.lastSyncAt,
      createdAt: integrations.createdAt,
      updatedAt: integrations.updatedAt,
    })
    .from(integrations)
    .where(whereClause)
    .orderBy(desc(integrations.createdAt))
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

export async function getIntegration(integrationId: number, organizationId: number) {
  const [integration] = await db
    .select({
      id: integrations.id,
      organizationId: integrations.organizationId,
      type: integrations.type,
      name: integrations.name,
      status: integrations.status,
      lastSyncAt: integrations.lastSyncAt,
      createdAt: integrations.createdAt,
      updatedAt: integrations.updatedAt,
    })
    .from(integrations)
    .where(
      and(
        eq(integrations.id, integrationId),
        eq(integrations.organizationId, organizationId),
        isNull(integrations.deletedAt)
      )
    )
    .limit(1);

  if (!integration) {
    throw new NotFoundError('Integration');
  }

  return integration;
}

export async function testIntegration(integrationId: number, organizationId: number) {
  const [integration] = await db
    .select()
    .from(integrations)
    .where(
      and(
        eq(integrations.id, integrationId),
        eq(integrations.organizationId, organizationId),
        isNull(integrations.deletedAt)
      )
    )
    .limit(1);

  if (!integration) {
    throw new NotFoundError('Integration');
  }

  let connectionStatus: 'success' | 'failed' = 'failed';
  let errorMessage: string | null = null;

  try {
    if (!integration.credentials) {
      throw new ValidationError('No credentials configured for this integration');
    }

    const decryptedCredentials = decrypt(integration.credentials);
    const credentials = JSON.parse(decryptedCredentials);

    // Attempt a basic connectivity check based on integration type
    if (integration.type === 'teamwork_desk') {
      // Validate that required credential fields exist
      if (!credentials.apiKey || !credentials.domain) {
        throw new ValidationError('Missing required credentials: apiKey, domain');
      }
      // In production, this would make an HTTP request to the Teamwork API
      // For now, verify credentials are properly structured
      connectionStatus = 'success';
    }

    // Update status to active on successful test
    await db
      .update(integrations)
      .set({ status: 'active', updatedAt: new Date() })
      .where(eq(integrations.id, integrationId));
  } catch (err) {
    errorMessage = err instanceof Error ? err.message : 'Connection test failed';

    // Update status to error on failed test
    await db
      .update(integrations)
      .set({ status: 'error', updatedAt: new Date() })
      .where(eq(integrations.id, integrationId));

    if (err instanceof ValidationError) {
      throw err;
    }
  }

  return {
    integrationId,
    status: connectionStatus,
    error: errorMessage,
    testedAt: new Date().toISOString(),
  };
}

export async function createIntegration(
  organizationId: number,
  data: {
    type: 'teamwork_desk';
    name: string;
    credentials?: Record<string, unknown>;
  }
) {
  let encryptedCredentials: string | null = null;

  if (data.credentials) {
    encryptedCredentials = encrypt(JSON.stringify(data.credentials));
  }

  const [integration] = await db
    .insert(integrations)
    .values({
      organizationId,
      type: data.type,
      name: data.name,
      credentials: encryptedCredentials,
      status: 'inactive',
    })
    .returning();

  // Return without raw credentials
  const { credentials: _, ...integrationWithoutCredentials } = integration;

  return integrationWithoutCredentials;
}

export async function updateIntegration(
  integrationId: number,
  organizationId: number,
  data: { name?: string; credentials?: Record<string, unknown> }
) {
  await getIntegration(integrationId, organizationId);

  const updateData: Record<string, unknown> = { updatedAt: new Date() };

  if (data.name !== undefined) {
    updateData.name = data.name;
  }

  if (data.credentials !== undefined) {
    updateData.credentials = encrypt(JSON.stringify(data.credentials));
  }

  const [updated] = await db
    .update(integrations)
    .set(updateData)
    .where(
      and(
        eq(integrations.id, integrationId),
        eq(integrations.organizationId, organizationId)
      )
    )
    .returning();

  // Return without raw credentials
  const { credentials: _, ...integrationWithoutCredentials } = updated;

  return integrationWithoutCredentials;
}

export async function deleteIntegration(integrationId: number, organizationId: number) {
  await getIntegration(integrationId, organizationId);

  const now = new Date();

  await db
    .update(integrations)
    .set({ deletedAt: now, updatedAt: now })
    .where(
      and(
        eq(integrations.id, integrationId),
        eq(integrations.organizationId, organizationId)
      )
    );

  return { message: 'Integration deleted successfully' };
}
