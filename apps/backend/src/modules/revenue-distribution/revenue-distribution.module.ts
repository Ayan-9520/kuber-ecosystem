import { Router } from 'express';

import { revenueDistributionRoutes } from './routes/revenue-distribution.routes.js';

export function createRevenueDistributionModule(): Router {
  const router = Router();
  router.use(revenueDistributionRoutes);
  return router;
}

export { revenueDistributionService, computeAllocations } from './services/revenue-distribution.service.js';
