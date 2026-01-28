import { pgTable, serial, integer, varchar, timestamp, index, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { organizations } from './organizations.js';
import { projects } from './projects.js';
import { processingRuns } from './processing-runs.js';

export const sourceTypeEnum = pgEnum('source_type', ['file_upload', 'api_import']);
export const sourceStatusEnum = pgEnum('source_status', ['pending', 'processing', 'ready', 'error']);

export const sources = pgTable('sources', {
  id: serial('id').primaryKey(),
  organizationId: integer('organization_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  projectId: integer('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  type: sourceTypeEnum('type').notNull(),
  filename: varchar('filename', { length: 255 }).notNull(),
  filepath: varchar('filepath', { length: 1024 }).notNull(),
  mimetype: varchar('mimetype', { length: 255 }).notNull(),
  size: integer('size').notNull(),
  status: sourceStatusEnum('status').notNull().default('pending'),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  organizationIdIdx: index('sources_organization_id_idx').on(table.organizationId),
  projectIdIdx: index('sources_project_id_idx').on(table.projectId),
}));

export const sourcesRelations = relations(sources, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [sources.organizationId],
    references: [organizations.id],
  }),
  project: one(projects, {
    fields: [sources.projectId],
    references: [projects.id],
  }),
  processingRuns: many(processingRuns),
}));
