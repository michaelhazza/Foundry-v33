import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/index.js';
import { sendError } from '../lib/response.js';
import { logger } from '../lib/logger.js';

export function errorHandler(err: Error, req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof AppError) {
    if (err.statusCode >= 500) {
      logger.error('Server error', { error: err.message, code: err.code, stack: err.stack, path: req.path });
    } else {
      logger.warn('Client error', { error: err.message, code: err.code, path: req.path });
    }
    sendError(res, err.code, err.message, err.statusCode);
    return;
  }

  logger.error('Unhandled error', { error: err.message, stack: err.stack, path: req.path });
  sendError(res, 'SYS-001', 'Internal server error', 500);
}
