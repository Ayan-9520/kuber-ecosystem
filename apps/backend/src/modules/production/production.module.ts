import { Router } from 'express';

import { productionRoutes } from './routes/production.routes.js';

export function createProductionModule(): Router {
  const router = Router();
  router.use(productionRoutes);
  return router;
}
