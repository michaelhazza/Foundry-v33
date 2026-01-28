import { pgTable, serial, integer, varchar, text, timestamp, jsonb, index, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { organizations } from './organizations.js';
import { projects } from './projects.js';
import { sources } from './sources.js';

export const processingRunStatusEnum = pgEnum('processing_run_status', ['pending', 'running', 'completed', 'failed']);

export const processingRuns = pgTable('processing_runs', {
  id: serial('id').primaryKey(),
  organizationId: integer('organization_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  projectId: integer('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  sourceId: integer('source_id').notNull().references(() => sources.id, { onDelete: 'cascade' }),
  status: processingRunStatusEnum('status').notNull().default('pending'),
  config: jsonb('config'),
  stats: jsonb('stats'),
  error: text('error'),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  organizationIdIdx: index('processing_runs_organization_id_idx').on(table.organizationId),
  projectIdIdx: index('processing_runs_project_id_idx').on(table.projectId),
  sourceIdIdx: index('processing_runs_source_id_idx').on(table.sourceId),
}));

export const processingRunsRelations = relations(processingRuns, ({ one }) => ({
  organization: one(organizations, {
    fields: [processingRuns.organizationId],
    references: [organizations.id],
  }),
  project: one(projects, {
    fields: [processingRuns.projectId],
    references: [projects.id],
  }),
  source: one(sources, {
    fields: [processingRuns.sourceId],
    references: [sources.id],
  }),
}));
