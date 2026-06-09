import { Router } from 'express';

import { emiCalculateRoutes } from '../finance-engine/routes/finance-engine.routes.js';

export function createEmiModule(): Router {
  const router = Router();
  router.use(emiCalculateRoutes);
  return router;
}
