import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { HealthResponse } from '../types';

export const healthCheck = async (_req: Request, res: Response) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    const response: HealthResponse = {
      status: 'OK',
      database: 'Connected',
      timestamp: new Date().toISOString()
    };
    res.json(response);
  } catch (error) {
    const response: HealthResponse = {
      status: 'ERROR',
      database: 'Disconnected',
      timestamp: new Date().toISOString()
    };
    res.status(503).json(response);
  }
};
