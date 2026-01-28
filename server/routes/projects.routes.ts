import { Router } from 'express';
import { authenticate, AuthenticatedRequest } from '../middleware/authenticate.js';
import { validateBody } from '../middleware/validate.js';
import { sendSuccess, sendPaginated } from '../lib/response.js';
import { requireIntParam, parseQueryInt } from '../lib/validation.js';
import * as ProjectService from '../services/project.service.js';
import { createProjectSchema, updateProjectSchema } from './schemas/projects.schemas.js';

const router = Router();

// GET /api/projects
router.get('/', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    const page = parseQueryInt(req.query.page as string, 1);
    const limit = parseQueryInt(req.query.limit as string, 20);
    const search = req.query.search as string | undefined;
    const result = await ProjectService.listProjects(req.user!.organizationId, page, limit, search);
    sendPaginated(res, result.items, result.pagination);
  } catch (error) {
    next(error);
  }
});

// GET /api/projects/:projectId
router.get('/:projectId', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    const projectId = requireIntParam(req.params.projectId, 'projectId');
    const result = await ProjectService.getProject(projectId, req.user!.organizationId);
    sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
});

// GET /api/projects/:projectId/stats
router.get('/:projectId/stats', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    const projectId = requireIntParam(req.params.projectId, 'projectId');
    const result = await ProjectService.getProjectStats(projectId, req.user!.organizationId);
    sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
});

// POST /api/projects
router.post('/', authenticate, validateBody(createProjectSchema), async (req: AuthenticatedRequest, res, next) => {
  try {
    const result = await ProjectService.createProject(req.user!.organizationId, req.user!.id, req.body);
    sendSuccess(res, result, 201);
  } catch (error) {
    next(error);
  }
});

// PATCH /api/projects/:projectId
router.patch('/:projectId', authenticate, validateBody(updateProjectSchema), async (req: AuthenticatedRequest, res, next) => {
  try {
    const projectId = requireIntParam(req.params.projectId, 'projectId');
    const result = await ProjectService.updateProject(projectId, req.user!.organizationId, req.body);
    sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/projects/:projectId
router.delete('/:projectId', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    const projectId = requireIntParam(req.params.projectId, 'projectId');
    const result = await ProjectService.deleteProject(projectId, req.user!.organizationId);
    sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
});

export default router;
