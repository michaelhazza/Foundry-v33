import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import { authenticate, AuthenticatedRequest } from '../middleware/authenticate.js';
import { validateBody } from '../middleware/validate.js';
import { upload } from '../middleware/upload.js';
import { sendSuccess, sendPaginated } from '../lib/response.js';
import { requireIntParam, parseQueryInt } from '../lib/validation.js';
import * as SourceService from '../services/source.service.js';
import { updateSourceSchema } from './schemas/sources.schemas.js';

const router = Router({ mergeParams: true });

// GET /api/projects/:projectId/sources
router.get('/', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    const projectId = requireIntParam(req.params.projectId, 'projectId');
    const page = parseQueryInt(req.query.page as string, 1);
    const limit = parseQueryInt(req.query.limit as string, 20);
    const type = req.query.type as string | undefined;
    const status = req.query.status as string | undefined;
    const result = await SourceService.listSources(projectId, req.user!.organizationId, page, limit, type, status);
    sendPaginated(res, result.items, result.pagination);
  } catch (error) {
    next(error);
  }
});

// GET /api/projects/:projectId/sources/:sourceId
router.get('/:sourceId', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    const sourceId = requireIntParam(req.params.sourceId, 'sourceId');
    const projectId = requireIntParam(req.params.projectId, 'projectId');
    const result = await SourceService.getSource(sourceId, projectId, req.user!.organizationId);
    sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
});

// GET /api/projects/:projectId/sources/:sourceId/download
router.get('/:sourceId/download', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    const sourceId = requireIntParam(req.params.sourceId, 'sourceId');
    const projectId = requireIntParam(req.params.projectId, 'projectId');
    const fileInfo = await SourceService.getSourceFile(sourceId, projectId, req.user!.organizationId);
    const filePath = fileInfo.filePath;
    const fileName = fileInfo.fileName || path.basename(filePath);
    const mimeType = fileInfo.mimeType || 'application/octet-stream';

    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.setHeader('Content-Type', mimeType);

    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
    fileStream.on('error', (err) => {
      next(err);
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/projects/:projectId/sources
router.post('/', authenticate, upload.single('file'), async (req: AuthenticatedRequest, res, next) => {
  try {
    const projectId = requireIntParam(req.params.projectId, 'projectId');
    const file = req.file;
    const result = await SourceService.createSource(projectId, req.user!.organizationId, {
      fileName: file?.originalname,
      mimeType: file?.mimetype,
      fileSize: file?.size,
      filePath: file?.path,
      ...req.body,
    });
    sendSuccess(res, result, 201);
  } catch (error) {
    next(error);
  }
});

// PATCH /api/projects/:projectId/sources/:sourceId
router.patch('/:sourceId', authenticate, validateBody(updateSourceSchema), async (req: AuthenticatedRequest, res, next) => {
  try {
    const sourceId = requireIntParam(req.params.sourceId, 'sourceId');
    const projectId = requireIntParam(req.params.projectId, 'projectId');
    const result = await SourceService.updateSource(sourceId, projectId, req.user!.organizationId, req.body);
    sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/projects/:projectId/sources/:sourceId
router.delete('/:sourceId', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    const sourceId = requireIntParam(req.params.sourceId, 'sourceId');
    const projectId = requireIntParam(req.params.projectId, 'projectId');
    const result = await SourceService.deleteSource(sourceId, projectId, req.user!.organizationId);
    sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
});

export default router;
