import { pgTable, serial, integer, varchar, timestamp, jsonb, index, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { organizations } from './organizations.js';
import { projects } from './projects.js';

export const datasetFormatEnum = pgEnum('dataset_format', ['csv', 'json', 'excel']);

export const datasets = pgTable('datasets', {
  id: serial('id').primaryKey(),
  organizationId: integer('organization_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  projectId: integer('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(),
  format: datasetFormatEnum('format').notNull(),
  rowCount: integer('row_count'),
  fileUrl: varchar('file_url', { length: 1024 }),
  metadata: jsonb('metadata'),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  organizationIdIdx: index('datasets_organization_id_idx').on(table.organizationId),
  projectIdIdx: index('datasets_project_id_idx').on(table.projectId),
}));

export const datasetsRelations = relations(datasets, ({ one }) => ({
  organization: one(organizations, {
    fields: [datasets.organizationId],
    references: [organizations.id],
  }),
  project: one(projects, {
    fields: [datasets.projectId],
    references: [projects.id],
  }),
}));
