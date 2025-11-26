export interface HealthResponse {
  status: 'OK' | 'ERROR';
  database: 'Connected' | 'Disconnected';
  timestamp: string;
}

export enum Role {
  USER = 'USER',
  ADMIN = 'ADMIN',
  MODERATOR = 'MODERATOR'
}
