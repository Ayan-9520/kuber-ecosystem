import { Router } from 'express';

import { executiveAnalyticsRoutes } from './routes/executive-analytics.routes.js';

export { executiveAnalyticsOrchestratorService } from './services/executive-analytics-orchestrator.service.js';
export { executiveAnalyticsWorkerService } from './services/executive-analytics-worker.service.js';

export function createExecutiveAnalyticsModule(): Router {
  const router = Router();
  router.use(executiveAnalyticsRoutes);
  return router;
}
