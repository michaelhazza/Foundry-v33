import { pgTable, serial, integer, varchar, text, timestamp, index, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { organizations } from './organizations.js';

export const integrationTypeEnum = pgEnum('integration_type', ['teamwork_desk']);
export const integrationStatusEnum = pgEnum('integration_status', ['active', 'inactive', 'error']);

export const integrations = pgTable('integrations', {
  id: serial('id').primaryKey(),
  organizationId: integer('organization_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  type: integrationTypeEnum('type').notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  credentials: text('credentials'),
  status: integrationStatusEnum('status').notNull().default('active'),
  lastSyncAt: timestamp('last_sync_at', { withTimezone: true }),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  organizationIdIdx: index('integrations_organization_id_idx').on(table.organizationId),
}));

export const integrationsRelations = relations(integrations, ({ one }) => ({
  organization: one(organizations, {
    fields: [integrations.organizationId],
    references: [organizations.id],
  }),
}));
