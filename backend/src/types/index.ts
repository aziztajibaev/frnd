import { Role } from '@prisma/client';

export interface HealthResponse {
  status: 'OK' | 'ERROR';
  database: 'Connected' | 'Disconnected';
  timestamp: string;
}

export { Role };
