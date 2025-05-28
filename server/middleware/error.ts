import { Request, Response, NextFunction } from 'express';
import { logger } from '../lib/logger';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (err instanceof AppError) {
    logger.warn(`${err.statusCode} - ${err.message}`);
    return res.status(err.statusCode).json({
      error: err.message
    });
  }

  logger.error('Unhandled error:', err);
  res.status(500).json({
    error: 'An unexpected error occurred'
  });
}