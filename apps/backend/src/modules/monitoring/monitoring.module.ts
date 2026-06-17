import { Router } from 'express';

import { monitoringRoutes } from './routes/monitoring.routes.js';

export function createMonitoringModule(): Router {
  const router = Router();
  router.use(monitoringRoutes);
  return router;
}

export { metricsMiddleware } from './middleware/metrics.middleware.js';
export { metricsRegistryService } from './services/metrics-registry.service.js';
export { monitoringHealthService } from './services/monitoring-health.service.js';
