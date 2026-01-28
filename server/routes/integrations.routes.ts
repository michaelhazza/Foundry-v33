import { Router } from 'express';
import { authenticate, authorize, AuthenticatedRequest } from '../middleware/authenticate.js';
import { validateBody } from '../middleware/validate.js';
import { sendSuccess, sendPaginated } from '../lib/response.js';
import { requireIntParam, parseQueryInt } from '../lib/validation.js';
import * as IntegrationService from '../services/integration.service.js';
import { createIntegrationSchema, updateIntegrationSchema } from './schemas/integrations.schemas.js';

const router = Router({ mergeParams: true });

// GET /api/organizations/:organizationId/integrations
router.get('/', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    const organizationId = requireIntParam(req.params.organizationId, 'organizationId');
    const page = parseQueryInt(req.query.page as string, 1);
    const limit = parseQueryInt(req.query.limit as string, 20);
    const type = req.query.type as string | undefined;
    const result = await IntegrationService.listIntegrations(organizationId, page, limit, type);
    sendPaginated(res, result.items, result.pagination);
  } catch (error) {
    next(error);
  }
});

// GET /api/organizations/:organizationId/integrations/:integrationId
router.get('/:integrationId', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    const integrationId = requireIntParam(req.params.integrationId, 'integrationId');
    const organizationId = requireIntParam(req.params.organizationId, 'organizationId');
    const result = await IntegrationService.getIntegration(integrationId, organizationId);
    sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
});

// GET /api/organizations/:organizationId/integrations/:integrationId/test
router.get('/:integrationId/test', authenticate, authorize('owner'), async (req: AuthenticatedRequest, res, next) => {
  try {
    const integrationId = requireIntParam(req.params.integrationId, 'integrationId');
    const organizationId = requireIntParam(req.params.organizationId, 'organizationId');
    const result = await IntegrationService.testIntegration(integrationId, organizationId);
    sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
});

// POST /api/organizations/:organizationId/integrations
router.post('/', authenticate, authorize('owner'), validateBody(createIntegrationSchema), async (req: AuthenticatedRequest, res, next) => {
  try {
    const organizationId = requireIntParam(req.params.organizationId, 'organizationId');
    const result = await IntegrationService.createIntegration(organizationId, req.body);
    sendSuccess(res, result, 201);
  } catch (error) {
    next(error);
  }
});

// PATCH /api/organizations/:organizationId/integrations/:integrationId
router.patch('/:integrationId', authenticate, authorize('owner'), validateBody(updateIntegrationSchema), async (req: AuthenticatedRequest, res, next) => {
  try {
    const integrationId = requireIntParam(req.params.integrationId, 'integrationId');
    const organizationId = requireIntParam(req.params.organizationId, 'organizationId');
    const result = await IntegrationService.updateIntegration(integrationId, organizationId, req.body);
    sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/organizations/:organizationId/integrations/:integrationId
router.delete('/:integrationId', authenticate, authorize('owner'), async (req: AuthenticatedRequest, res, next) => {
  try {
    const integrationId = requireIntParam(req.params.integrationId, 'integrationId');
    const organizationId = requireIntParam(req.params.organizationId, 'organizationId');
    const result = await IntegrationService.deleteIntegration(integrationId, organizationId);
    sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
});

export default router;
