import { Router } from 'express';

import { devOpsRoutes } from './routes/devops.routes.js';

export function createDevOpsModule(): Router {
  const router = Router();
  router.use(devOpsRoutes);
  return router;
}
