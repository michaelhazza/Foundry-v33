import { pgTable, serial, varchar, timestamp, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './users.js';
import { projects } from './projects.js';
import { sources } from './sources.js';
import { processingRuns } from './processing-runs.js';
import { datasets } from './datasets.js';
import { integrations } from './integrations.js';

export const organizations = pgTable('organizations', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const organizationsRelations = relations(organizations, ({ many }) => ({
  users: many(users),
  projects: many(projects),
  sources: many(sources),
  processingRuns: many(processingRuns),
  datasets: many(datasets),
  integrations: many(integrations),
}));
