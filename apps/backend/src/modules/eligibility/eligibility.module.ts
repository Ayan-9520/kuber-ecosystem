import { Router } from 'express';

import { eligibilityCalculateRoutes } from '../finance-engine/routes/finance-engine.routes.js';

export function createEligibilityModule(): Router {
  const router = Router();
  router.use(eligibilityCalculateRoutes);
  return router;
}
