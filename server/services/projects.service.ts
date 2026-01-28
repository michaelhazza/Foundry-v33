import { eq, and, isNull, like, desc, sql } from 'drizzle-orm';
import { db } from '../db/index.js';
import { projects, sources, processingRuns, datasets } from '../db/schema/index.js';
import { NotFoundError } from '../errors/index.js';

export async function listProjects(
  organizationId: number,
  options: { page?: number; limit?: number; search?: string } = {}
) {
  const page = options.page || 1;
  const limit = options.limit || 20;
  const offset = (page - 1) * limit;

  const conditions = [
    eq(projects.organizationId, organizationId),
    isNull(projects.deletedAt),
  ];

  if (options.search) {
    conditions.push(like(projects.name, `%${options.search}%`));
  }

  const whereClause = and(...conditions);

  const [countResult] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(projects)
    .where(whereClause);

  const total = countResult.count;

  const items = await db
    .select()
    .from(projects)
    .where(whereClause)
    .orderBy(desc(projects.createdAt))
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

export async function getProject(projectId: number, organizationId: number) {
  const [project] = await db
    .select()
    .from(projects)
    .where(
      and(
        eq(projects.id, projectId),
        eq(projects.organizationId, organizationId),
        isNull(projects.deletedAt)
      )
    )
    .limit(1);

  if (!project) {
    throw new NotFoundError('Project');
  }

  return project;
}

export async function getProjectStats(projectId: number, organizationId: number) {
  // Verify the project exists and belongs to the org
  await getProject(projectId, organizationId);

  const [sourceCount] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(sources)
    .where(
      and(
        eq(sources.projectId, projectId),
        eq(sources.organizationId, organizationId),
        isNull(sources.deletedAt)
      )
    );

  const [runCount] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(processingRuns)
    .where(
      and(
        eq(processingRuns.projectId, projectId),
        eq(processingRuns.organizationId, organizationId),
        isNull(processingRuns.deletedAt)
      )
    );

  const [datasetCount] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(datasets)
    .where(
      and(
        eq(datasets.projectId, projectId),
        eq(datasets.organizationId, organizationId),
        isNull(datasets.deletedAt)
      )
    );

  return {
    projectId,
    sources: sourceCount.count,
    processingRuns: runCount.count,
    datasets: datasetCount.count,
  };
}

export async function createProject(
  organizationId: number,
  ownerId: number,
  data: { name: string; description?: string }
) {
  const [project] = await db
    .insert(projects)
    .values({
      organizationId,
      ownerId,
      name: data.name,
      description: data.description || null,
    })
    .returning();

  return project;
}

export async function updateProject(
  projectId: number,
  organizationId: number,
  data: { name?: string; description?: string }
) {
  const existing = await getProject(projectId, organizationId);

  const updateData: Record<string, unknown> = { updatedAt: new Date() };
  if (data.name !== undefined) updateData.name = data.name;
  if (data.description !== undefined) updateData.description = data.description;

  const [updated] = await db
    .update(projects)
    .set(updateData)
    .where(
      and(
        eq(projects.id, projectId),
        eq(projects.organizationId, organizationId)
      )
    )
    .returning();

  return updated;
}

export async function deleteProject(projectId: number, organizationId: number) {
  await getProject(projectId, organizationId);

  const now = new Date();

  await db.transaction(async (tx) => {
    // Soft delete the project
    await tx
      .update(projects)
      .set({ deletedAt: now, updatedAt: now })
      .where(
        and(
          eq(projects.id, projectId),
          eq(projects.organizationId, organizationId)
        )
      );

    // Cascade: soft delete sources
    await tx
      .update(sources)
      .set({ deletedAt: now, updatedAt: now })
      .where(
        and(
          eq(sources.projectId, projectId),
          eq(sources.organizationId, organizationId),
          isNull(sources.deletedAt)
        )
      );

    // Cascade: soft delete processing runs
    await tx
      .update(processingRuns)
      .set({ deletedAt: now, updatedAt: now })
      .where(
        and(
          eq(processingRuns.projectId, projectId),
          eq(processingRuns.organizationId, organizationId),
          isNull(processingRuns.deletedAt)
        )
      );

    // Cascade: soft delete datasets
    await tx
      .update(datasets)
      .set({ deletedAt: now, updatedAt: now })
      .where(
        and(
          eq(datasets.projectId, projectId),
          eq(datasets.organizationId, organizationId),
          isNull(datasets.deletedAt)
        )
      );
  });

  return { message: 'Project and related resources deleted successfully' };
}
