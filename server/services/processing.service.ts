import { eq, and, isNull, desc, sql } from 'drizzle-orm';
import { db } from '../db/index.js';
import { processingRuns, sources } from '../db/schema/index.js';
import { NotFoundError, ValidationError } from '../errors/index.js';

export async function listProcessingRuns(
  projectId: number,
  organizationId: number,
  options: { page?: number; limit?: number; status?: string; sourceId?: number } = {}
) {
  const page = options.page || 1;
  const limit = options.limit || 20;
  const offset = (page - 1) * limit;

  const conditions: ReturnType<typeof eq>[] = [
    eq(processingRuns.projectId, projectId),
    eq(processingRuns.organizationId, organizationId),
    isNull(processingRuns.deletedAt),
  ];

  if (options.status) {
    conditions.push(
      eq(processingRuns.status, options.status as 'pending' | 'running' | 'completed' | 'failed')
    );
  }

  if (options.sourceId) {
    conditions.push(eq(processingRuns.sourceId, options.sourceId));
  }

  const whereClause = and(...conditions);

  const [countResult] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(processingRuns)
    .where(whereClause);

  const total = countResult.count;

  const items = await db
    .select()
    .from(processingRuns)
    .where(whereClause)
    .orderBy(desc(processingRuns.createdAt))
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

export async function getProcessingRun(
  runId: number,
  projectId: number,
  organizationId: number
) {
  const [run] = await db
    .select()
    .from(processingRuns)
    .where(
      and(
        eq(processingRuns.id, runId),
        eq(processingRuns.projectId, projectId),
        eq(processingRuns.organizationId, organizationId),
        isNull(processingRuns.deletedAt)
      )
    )
    .limit(1);

  if (!run) {
    throw new NotFoundError('Processing run');
  }

  return run;
}

export async function getProcessingLogs(
  runId: number,
  projectId: number,
  organizationId: number
) {
  const run = await getProcessingRun(runId, projectId, organizationId);

  return {
    id: run.id,
    status: run.status,
    config: run.config,
    stats: run.stats,
    error: run.error,
    createdAt: run.createdAt,
    updatedAt: run.updatedAt,
  };
}

export async function createProcessingRun(
  projectId: number,
  organizationId: number,
  data: { sourceId: number; config?: Record<string, unknown> }
) {
  // Verify source exists and belongs to the same project/org
  const [source] = await db
    .select({ id: sources.id })
    .from(sources)
    .where(
      and(
        eq(sources.id, data.sourceId),
        eq(sources.projectId, projectId),
        eq(sources.organizationId, organizationId),
        isNull(sources.deletedAt)
      )
    )
    .limit(1);

  if (!source) {
    throw new ValidationError('Source not found or does not belong to this project');
  }

  const [run] = await db
    .insert(processingRuns)
    .values({
      projectId,
      organizationId,
      sourceId: data.sourceId,
      status: 'pending',
      config: data.config || null,
    })
    .returning();

  return run;
}

export async function updateProcessingRun(
  runId: number,
  projectId: number,
  organizationId: number,
  data: { config?: Record<string, unknown> }
) {
  await getProcessingRun(runId, projectId, organizationId);

  const updateData: Record<string, unknown> = { updatedAt: new Date() };
  if (data.config !== undefined) updateData.config = data.config;

  const [updated] = await db
    .update(processingRuns)
    .set(updateData)
    .where(
      and(
        eq(processingRuns.id, runId),
        eq(processingRuns.projectId, projectId),
        eq(processingRuns.organizationId, organizationId)
      )
    )
    .returning();

  return updated;
}

export async function deleteProcessingRun(
  runId: number,
  projectId: number,
  organizationId: number
) {
  await getProcessingRun(runId, projectId, organizationId);

  const now = new Date();

  const [deleted] = await db
    .update(processingRuns)
    .set({ deletedAt: now, updatedAt: now })
    .where(
      and(
        eq(processingRuns.id, runId),
        eq(processingRuns.projectId, projectId),
        eq(processingRuns.organizationId, organizationId)
      )
    )
    .returning();

  return { message: 'Processing run deleted successfully' };
}
