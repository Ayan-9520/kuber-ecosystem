import { Router } from 'express';

import { stagingRoutes } from './routes/staging.routes.js';

export function createStagingModule(): Router {
  const router = Router();
  router.use(stagingRoutes);
  return router;
}
