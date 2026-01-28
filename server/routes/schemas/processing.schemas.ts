import { z } from 'zod';

export const createProcessingRunSchema = z.object({
  sourceId: z.number().int().positive('Source ID must be a positive integer'),
  pipelineConfig: z.record(z.unknown()).optional(),
  priority: z.enum(['low', 'normal', 'high']).optional().default('normal'),
  description: z.string().max(2000).optional(),
});

export const updateProcessingRunSchema = z.object({
  status: z.enum(['pending', 'running', 'completed', 'failed', 'cancelled']).optional(),
  pipelineConfig: z.record(z.unknown()).optional(),
  priority: z.enum(['low', 'normal', 'high']).optional(),
  description: z.string().max(2000).optional(),
}).refine(data => Object.keys(data).length > 0, {
  message: 'At least one field must be provided for update',
});
