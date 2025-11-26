export interface HealthResponse {
  status: 'OK' | 'ERROR';
  database: 'Connected' | 'Disconnected';
  timestamp: string;
}

export interface Role {
  id: number;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}
