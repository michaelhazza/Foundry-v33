import { Router } from 'express';
import { authenticate, AuthenticatedRequest } from '../middleware/authenticate.js';
import { validateBody } from '../middleware/validate.js';
import { sendSuccess, sendPaginated } from '../lib/response.js';
import { requireIntParam, parseQueryInt } from '../lib/validation.js';
import * as DatasetService from '../services/dataset.service.js';
import { createDatasetSchema, updateDatasetSchema } from './schemas/datasets.schemas.js';

const router = Router({ mergeParams: true });

// GET /api/projects/:projectId/datasets
router.get('/', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    const projectId = requireIntParam(req.params.projectId, 'projectId');
    const page = parseQueryInt(req.query.page as string, 1);
    const limit = parseQueryInt(req.query.limit as string, 20);
    const format = req.query.format as string | undefined;
    const result = await DatasetService.listDatasets(projectId, req.user!.organizationId, page, limit, format);
    sendPaginated(res, result.items, result.pagination);
  } catch (error) {
    next(error);
  }
});

// GET /api/projects/:projectId/datasets/:datasetId
router.get('/:datasetId', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    const datasetId = requireIntParam(req.params.datasetId, 'datasetId');
    const projectId = requireIntParam(req.params.projectId, 'projectId');
    const result = await DatasetService.getDataset(datasetId, projectId, req.user!.organizationId);
    sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
});

// GET /api/projects/:projectId/datasets/:datasetId/download
router.get('/:datasetId/download', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    const datasetId = requireIntParam(req.params.datasetId, 'datasetId');
    const projectId = requireIntParam(req.params.projectId, 'projectId');
    const fileInfo = await DatasetService.getDatasetFile(datasetId, projectId, req.user!.organizationId);
    const filePath = fileInfo.filePath;
    const fileName = fileInfo.fileName;
    const mimeType = fileInfo.mimeType || 'application/octet-stream';

    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.setHeader('Content-Type', mimeType);

    const fs = await import('fs');
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
    fileStream.on('error', (err) => {
      next(err);
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/projects/:projectId/datasets
router.post('/', authenticate, validateBody(createDatasetSchema), async (req: AuthenticatedRequest, res, next) => {
  try {
    const projectId = requireIntParam(req.params.projectId, 'projectId');
    const result = await DatasetService.createDataset(projectId, req.user!.organizationId, req.body);
    sendSuccess(res, result, 201);
  } catch (error) {
    next(error);
  }
});

// PATCH /api/projects/:projectId/datasets/:datasetId
router.patch('/:datasetId', authenticate, validateBody(updateDatasetSchema), async (req: AuthenticatedRequest, res, next) => {
  try {
    const datasetId = requireIntParam(req.params.datasetId, 'datasetId');
    const projectId = requireIntParam(req.params.projectId, 'projectId');
    const result = await DatasetService.updateDataset(datasetId, projectId, req.user!.organizationId, req.body);
    sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/projects/:projectId/datasets/:datasetId
router.delete('/:datasetId', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    const datasetId = requireIntParam(req.params.datasetId, 'datasetId');
    const projectId = requireIntParam(req.params.projectId, 'projectId');
    const result = await DatasetService.deleteDataset(datasetId, projectId, req.user!.organizationId);
    sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
});

export default router;
