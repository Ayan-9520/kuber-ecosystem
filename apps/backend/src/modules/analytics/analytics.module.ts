import { Router } from 'express';

import { analyticsRoutes } from './routes/analytics.routes.js';

export { analyticsOrchestratorService } from './services/analytics-orchestrator.service.js';
export { analyticsWorkerService } from './services/analytics-worker.service.js';

export function createAnalyticsModule(): Router {
  const router = Router();
  router.use(analyticsRoutes);
  return router;
}
