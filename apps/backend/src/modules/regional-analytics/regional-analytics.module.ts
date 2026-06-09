import { Router } from 'express';

import { regionalAnalyticsRoutes } from './routes/regional-analytics.routes.js';

export { regionalAnalyticsOrchestratorService } from './services/regional-analytics-orchestrator.service.js';
export { regionalAnalyticsWorkerService } from './services/regional-analytics-worker.service.js';

export function createRegionalAnalyticsModule(): Router {
  const router = Router();
  router.use(regionalAnalyticsRoutes);
  return router;
}
