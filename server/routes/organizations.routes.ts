import { Router } from 'express';
import { authenticate, authorize, AuthenticatedRequest } from '../middleware/authenticate.js';
import { validateBody } from '../middleware/validate.js';
import { sendSuccess, sendPaginated } from '../lib/response.js';
import { requireIntParam, parseQueryInt } from '../lib/validation.js';
import * as OrganizationService from '../services/organization.service.js';
import { addUserSchema, updateOrganizationSchema } from './schemas/organizations.schemas.js';

const router = Router();

// GET /api/organizations/:organizationId
router.get('/:organizationId', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    const organizationId = requireIntParam(req.params.organizationId, 'organizationId');
    const result = await OrganizationService.getOrganization(organizationId);
    sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
});

// GET /api/organizations/:organizationId/users
router.get('/:organizationId/users', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    const organizationId = requireIntParam(req.params.organizationId, 'organizationId');
    const page = parseQueryInt(req.query.page as string, 1);
    const limit = parseQueryInt(req.query.limit as string, 20);
    const result = await OrganizationService.listUsers(organizationId, page, limit);
    sendPaginated(res, result.items, result.pagination);
  } catch (error) {
    next(error);
  }
});

// POST /api/organizations/:organizationId/users
router.post('/:organizationId/users', authenticate, authorize('owner'), validateBody(addUserSchema), async (req: AuthenticatedRequest, res, next) => {
  try {
    const organizationId = requireIntParam(req.params.organizationId, 'organizationId');
    const result = await OrganizationService.addUser(organizationId, req.body);
    sendSuccess(res, result, 201);
  } catch (error) {
    next(error);
  }
});

// PATCH /api/organizations/:organizationId
router.patch('/:organizationId', authenticate, authorize('owner'), validateBody(updateOrganizationSchema), async (req: AuthenticatedRequest, res, next) => {
  try {
    const organizationId = requireIntParam(req.params.organizationId, 'organizationId');
    const result = await OrganizationService.updateOrganization(organizationId, req.body);
    sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
});

export default router;
