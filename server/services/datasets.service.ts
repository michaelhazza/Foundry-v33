import { eq, and, isNull, desc, sql } from 'drizzle-orm';
import { db } from '../db/index.js';
import { datasets } from '../db/schema/index.js';
import { NotFoundError } from '../errors/index.js';

export async function listDatasets(
  projectId: number,
  organizationId: number,
  options: { page?: number; limit?: number; format?: string } = {}
) {
  const page = options.page || 1;
  const limit = options.limit || 20;
  const offset = (page - 1) * limit;

  const conditions: ReturnType<typeof eq>[] = [
    eq(datasets.projectId, projectId),
    eq(datasets.organizationId, organizationId),
    isNull(datasets.deletedAt),
  ];

  if (options.format) {
    conditions.push(eq(datasets.format, options.format as 'csv' | 'json' | 'excel'));
  }

  const whereClause = and(...conditions);

  const [countResult] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(datasets)
    .where(whereClause);

  const total = countResult.count;

  const items = await db
    .select()
    .from(datasets)
    .where(whereClause)
    .orderBy(desc(datasets.createdAt))
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

export async function getDataset(
  datasetId: number,
  projectId: number,
  organizationId: number
) {
  const [dataset] = await db
    .select()
    .from(datasets)
    .where(
      and(
        eq(datasets.id, datasetId),
        eq(datasets.projectId, projectId),
        eq(datasets.organizationId, organizationId),
        isNull(datasets.deletedAt)
      )
    )
    .limit(1);

  if (!dataset) {
    throw new NotFoundError('Dataset');
  }

  return dataset;
}

export async function getDatasetFile(
  datasetId: number,
  projectId: number,
  organizationId: number
) {
  const dataset = await getDataset(datasetId, projectId, organizationId);

  return {
    fileUrl: dataset.fileUrl,
    filename: dataset.name,
    format: dataset.format,
  };
}

export async function createDataset(
  projectId: number,
  organizationId: number,
  data: {
    name: string;
    format: 'csv' | 'json' | 'excel';
    rowCount?: number;
    fileUrl?: string;
    metadata?: Record<string, unknown>;
  }
) {
  const [dataset] = await db
    .insert(datasets)
    .values({
      projectId,
      organizationId,
      name: data.name,
      format: data.format,
      rowCount: data.rowCount || null,
      fileUrl: data.fileUrl || null,
      metadata: data.metadata || null,
    })
    .returning();

  return dataset;
}

export async function updateDataset(
  datasetId: number,
  projectId: number,
  organizationId: number,
  data: { name: string }
) {
  await getDataset(datasetId, projectId, organizationId);

  const [updated] = await db
    .update(datasets)
    .set({ name: data.name, updatedAt: new Date() })
    .where(
      and(
        eq(datasets.id, datasetId),
        eq(datasets.projectId, projectId),
        eq(datasets.organizationId, organizationId)
      )
    )
    .returning();

  return updated;
}

export async function deleteDataset(
  datasetId: number,
  projectId: number,
  organizationId: number
) {
  await getDataset(datasetId, projectId, organizationId);

  const now = new Date();

  await db
    .update(datasets)
    .set({ deletedAt: now, updatedAt: now })
    .where(
      and(
        eq(datasets.id, datasetId),
        eq(datasets.projectId, projectId),
        eq(datasets.organizationId, organizationId)
      )
    );

  return { message: 'Dataset deleted successfully' };
}
