import { Router } from 'express';

import { backendDeploymentRoutes } from './routes/backend-deployment.routes.js';

export function createBackendDeploymentModule(): Router {
  const router = Router();
  router.use(backendDeploymentRoutes);
  return router;
}
