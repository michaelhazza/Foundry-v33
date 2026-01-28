import { pgTable, serial, integer, varchar, text, timestamp, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { organizations } from './organizations.js';
import { users } from './users.js';
import { sources } from './sources.js';
import { processingRuns } from './processing-runs.js';
import { datasets } from './datasets.js';

export const projects = pgTable('projects', {
  id: serial('id').primaryKey(),
  organizationId: integer('organization_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  ownerId: integer('owner_id').notNull().references(() => users.id, { onDelete: 'no action' }),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  organizationIdIdx: index('projects_organization_id_idx').on(table.organizationId),
  ownerIdIdx: index('projects_owner_id_idx').on(table.ownerId),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [projects.organizationId],
    references: [organizations.id],
  }),
  owner: one(users, {
    fields: [projects.ownerId],
    references: [users.id],
  }),
  sources: many(sources),
  processingRuns: many(processingRuns),
  datasets: many(datasets),
}));
