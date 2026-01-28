import { eq, and, isNull, desc, sql } from 'drizzle-orm';
import { db } from '../db/index.js';
import { sources, processingRuns } from '../db/schema/index.js';
import { NotFoundError } from '../errors/index.js';

export async function listSources(
  projectId: number,
  organizationId: number,
  options: { page?: number; limit?: number; type?: string; status?: string } = {}
) {
  const page = options.page || 1;
  const limit = options.limit || 20;
  const offset = (page - 1) * limit;

  const conditions: ReturnType<typeof eq>[] = [
    eq(sources.projectId, projectId),
    eq(sources.organizationId, organizationId),
    isNull(sources.deletedAt),
  ];

  if (options.type) {
    conditions.push(eq(sources.type, options.type as 'file_upload' | 'api_import'));
  }

  if (options.status) {
    conditions.push(eq(sources.status, options.status as 'pending' | 'processing' | 'ready' | 'error'));
  }

  const whereClause = and(...conditions);

  const [countResult] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(sources)
    .where(whereClause);

  const total = countResult.count;

  const items = await db
    .select()
    .from(sources)
    .where(whereClause)
    .orderBy(desc(sources.createdAt))
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

export async function getSource(
  sourceId: number,
  projectId: number,
  organizationId: number
) {
  const [source] = await db
    .select()
    .from(sources)
    .where(
      and(
        eq(sources.id, sourceId),
        eq(sources.projectId, projectId),
        eq(sources.organizationId, organizationId),
        isNull(sources.deletedAt)
      )
    )
    .limit(1);

  if (!source) {
    throw new NotFoundError('Source');
  }

  return source;
}

export async function getSourceFile(
  sourceId: number,
  projectId: number,
  organizationId: number
) {
  const source = await getSource(sourceId, projectId, organizationId);

  return {
    filepath: source.filepath,
    filename: source.filename,
    mimetype: source.mimetype,
  };
}

export async function createSource(
  projectId: number,
  organizationId: number,
  data: {
    type: 'file_upload' | 'api_import';
    filename: string;
    filepath: string;
    mimetype: string;
    size: number;
  }
) {
  const [source] = await db
    .insert(sources)
    .values({
      projectId,
      organizationId,
      type: data.type,
      filename: data.filename,
      filepath: data.filepath,
      mimetype: data.mimetype,
      size: data.size,
      status: 'pending',
    })
    .returning();

  return source;
}

export async function updateSource(
  sourceId: number,
  projectId: number,
  organizationId: number,
  data: { filename: string }
) {
  await getSource(sourceId, projectId, organizationId);

  const [updated] = await db
    .update(sources)
    .set({ filename: data.filename, updatedAt: new Date() })
    .where(
      and(
        eq(sources.id, sourceId),
        eq(sources.projectId, projectId),
        eq(sources.organizationId, organizationId)
      )
    )
    .returning();

  return updated;
}

export async function deleteSource(
  sourceId: number,
  projectId: number,
  organizationId: number
) {
  await getSource(sourceId, projectId, organizationId);

  const now = new Date();

  await db.transaction(async (tx) => {
    // Soft delete the source
    await tx
      .update(sources)
      .set({ deletedAt: now, updatedAt: now })
      .where(
        and(
          eq(sources.id, sourceId),
          eq(sources.projectId, projectId),
          eq(sources.organizationId, organizationId)
        )
      );

    // Cascade: soft delete related processing runs
    await tx
      .update(processingRuns)
      .set({ deletedAt: now, updatedAt: now })
      .where(
        and(
          eq(processingRuns.sourceId, sourceId),
          eq(processingRuns.organizationId, organizationId),
          isNull(processingRuns.deletedAt)
        )
      );
  });

  return { message: 'Source and related processing runs deleted successfully' };
}
