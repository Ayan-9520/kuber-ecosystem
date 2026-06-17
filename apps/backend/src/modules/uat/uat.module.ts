import { Router } from 'express';

import { uatRoutes } from './routes/uat.routes.js';

export function createUatModule(): Router {
  const router = Router();
  router.use(uatRoutes);
  return router;
}
