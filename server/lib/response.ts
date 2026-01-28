import { Response } from 'express';

interface SuccessResponse<T> {
  success: true;
  data: T;
}

interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface PaginatedResponse<T> {
  success: true;
  data: T;
  pagination: PaginationMeta;
}

export function sendSuccess<T>(res: Response, data: T, statusCode: number = 200): void {
  const response: SuccessResponse<T> = {
    success: true,
    data,
  };
  res.status(statusCode).json(response);
}

export function sendPaginated<T>(
  res: Response,
  data: T,
  pagination: PaginationMeta,
  statusCode: number = 200
): void {
  const response: PaginatedResponse<T> = {
    success: true,
    data,
    pagination,
  };
  res.status(statusCode).json(response);
}

export function sendError(
  res: Response,
  code: string,
  message: string,
  statusCode: number = 500,
  details?: unknown
): void {
  const response: ErrorResponse = {
    success: false,
    error: {
      code,
      message,
      ...(details ? { details } : {}),
    },
  };
  res.status(statusCode).json(response);
}
