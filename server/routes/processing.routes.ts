import { Router } from 'express';
import { authenticate, AuthenticatedRequest } from '../middleware/authenticate.js';
import { validateBody } from '../middleware/validate.js';
import { sendSuccess, sendPaginated } from '../lib/response.js';
import { requireIntParam, parseQueryInt } from '../lib/validation.js';
import * as ProcessingService from '../services/processing.service.js';
import { createProcessingRunSchema, updateProcessingRunSchema } from './schemas/processing.schemas.js';

const router = Router({ mergeParams: true });

// GET /api/projects/:projectId/processing-runs
router.get('/', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    const projectId = requireIntParam(req.params.projectId, 'projectId');
    const page = parseQueryInt(req.query.page as string, 1);
    const limit = parseQueryInt(req.query.limit as string, 20);
    const status = req.query.status as string | undefined;
    const sourceId = req.query.sourceId ? parseInt(req.query.sourceId as string, 10) : undefined;
    const result = await ProcessingService.listProcessingRuns(projectId, req.user!.organizationId, page, limit, status, sourceId);
    sendPaginated(res, result.items, result.pagination);
  } catch (error) {
    next(error);
  }
});

// GET /api/projects/:projectId/processing-runs/:runId
router.get('/:runId', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    const runId = requireIntParam(req.params.runId, 'runId');
    const projectId = requireIntParam(req.params.projectId, 'projectId');
    const result = await ProcessingService.getProcessingRun(runId, projectId, req.user!.organizationId);
    sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
});

// GET /api/projects/:projectId/processing-runs/:runId/logs
router.get('/:runId/logs', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    const runId = requireIntParam(req.params.runId, 'runId');
    const projectId = requireIntParam(req.params.projectId, 'projectId');
    const result = await ProcessingService.getProcessingLogs(runId, projectId, req.user!.organizationId);
    sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
});

// POST /api/projects/:projectId/processing-runs
router.post('/', authenticate, validateBody(createProcessingRunSchema), async (req: AuthenticatedRequest, res, next) => {
  try {
    const projectId = requireIntParam(req.params.projectId, 'projectId');
    const result = await ProcessingService.createProcessingRun(projectId, req.user!.organizationId, req.body);
    sendSuccess(res, result, 201);
  } catch (error) {
    next(error);
  }
});

// PATCH /api/projects/:projectId/processing-runs/:runId
router.patch('/:runId', authenticate, validateBody(updateProcessingRunSchema), async (req: AuthenticatedRequest, res, next) => {
  try {
    const runId = requireIntParam(req.params.runId, 'runId');
    const projectId = requireIntParam(req.params.projectId, 'projectId');
    const result = await ProcessingService.updateProcessingRun(runId, projectId, req.user!.organizationId, req.body);
    sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/projects/:projectId/processing-runs/:runId
router.delete('/:runId', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    const runId = requireIntParam(req.params.runId, 'runId');
    const projectId = requireIntParam(req.params.projectId, 'projectId');
    const result = await ProcessingService.deleteProcessingRun(runId, projectId, req.user!.organizationId);
    sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
});

export default router;
