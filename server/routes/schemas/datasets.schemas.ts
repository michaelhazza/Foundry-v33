import { z } from 'zod';

export const createDatasetSchema = z.object({
  name: z.string().min(1, 'Dataset name is required').max(255),
  description: z.string().max(2000).optional(),
  format: z.enum(['json', 'csv', 'parquet', 'jsonl', 'xml'], {
    errorMap: () => ({ message: 'Format must be one of: json, csv, parquet, jsonl, xml' }),
  }),
  processingRunId: z.number().int().positive().optional(),
  tags: z.array(z.string().max(50)).max(20).optional(),
  metadata: z.record(z.unknown()).optional(),
});

export const updateDatasetSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().max(2000).optional(),
  format: z.enum(['json', 'csv', 'parquet', 'jsonl', 'xml']).optional(),
  tags: z.array(z.string().max(50)).max(20).optional(),
  metadata: z.record(z.unknown()).optional(),
  status: z.enum(['draft', 'ready', 'published', 'archived']).optional(),
}).refine(data => Object.keys(data).length > 0, {
  message: 'At least one field must be provided for update',
});
