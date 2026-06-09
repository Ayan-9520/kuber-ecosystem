import { Router } from 'express';

import { branchAnalyticsRoutes } from './routes/branch-analytics.routes.js';

export { branchAnalyticsOrchestratorService } from './services/branch-analytics-orchestrator.service.js';
export { branchAnalyticsWorkerService } from './services/branch-analytics-worker.service.js';

export function createBranchAnalyticsModule(): Router {
  const router = Router();
  router.use(branchAnalyticsRoutes);
  return router;
}
