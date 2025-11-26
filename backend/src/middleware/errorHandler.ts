import { Request, Response, NextFunction } from 'express';

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  console.error('Error:', err);

  res.status(500).json({
    status: 'ERROR',
    message: process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err.message,
    timestamp: new Date().toISOString()
  });
};

export const notFoundHandler = (_req: Request, res: Response) => {
  res.status(404).json({
    status: 'ERROR',
    message: 'Route not found',
    timestamp: new Date().toISOString()
  });
};
