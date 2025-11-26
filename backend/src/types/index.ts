export interface HealthResponse {
  status: 'OK' | 'ERROR';
  database: 'Connected' | 'Disconnected';
  timestamp: string;
}
