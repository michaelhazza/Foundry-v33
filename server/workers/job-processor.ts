import { db } from '../db/index.js';
import { processingRuns } from '../db/schema/index.js';
import { eq, and, isNull } from 'drizzle-orm';
import { logger } from '../lib/logger.js';

const POLL_INTERVAL_MS = 10000;

async function processJob(runId: number): Promise<void> {
  logger.info('Processing job', { runId });
  
  await db.update(processingRuns)
    .set({ status: 'running', updatedAt: new Date() })
    .where(eq(processingRuns.id, runId));

  try {
    // Simulate processing work
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    await db.update(processingRuns)
      .set({
        status: 'completed',
        stats: { processedAt: new Date().toISOString(), rowsProcessed: 0 },
        updatedAt: new Date(),
      })
      .where(eq(processingRuns.id, runId));

    logger.info('Job completed', { runId });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    await db.update(processingRuns)
      .set({
        status: 'failed',
        error: errorMessage,
        updatedAt: new Date(),
      })
      .where(eq(processingRuns.id, runId));

    logger.error('Job failed', { runId, error: errorMessage });
  }
}

export async function pollAndProcessJobs(): Promise<void> {
  try {
    const pendingJobs = await db.select()
      .from(processingRuns)
      .where(and(
        eq(processingRuns.status, 'pending'),
        isNull(processingRuns.deletedAt)
      ))
      .limit(5);

    for (const job of pendingJobs) {
      await processJob(job.id);
    }
  } catch (error) {
    logger.error('Job polling error', { error: error instanceof Error ? error.message : 'Unknown' });
  }
}

export function startJobProcessor(): void {
  logger.info('Starting job processor', { intervalMs: POLL_INTERVAL_MS });
  setInterval(pollAndProcessJobs, POLL_INTERVAL_MS);
}
