import { z } from 'zod';

export const createIntegrationSchema = z.object({
  name: z.string().min(1, 'Integration name is required').max(255),
  type: z.enum(['slack', 'github', 'jira', 'webhook', 's3', 'gcs', 'azure_blob'], {
    errorMap: () => ({ message: 'Invalid integration type' }),
  }),
  config: z.record(z.unknown()),
  description: z.string().max(2000).optional(),
  enabled: z.boolean().optional().default(true),
});

export const updateIntegrationSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  type: z.enum(['slack', 'github', 'jira', 'webhook', 's3', 'gcs', 'azure_blob']).optional(),
  config: z.record(z.unknown()).optional(),
  description: z.string().max(2000).optional(),
  enabled: z.boolean().optional(),
}).refine(data => Object.keys(data).length > 0, {
  message: 'At least one field must be provided for update',
});
