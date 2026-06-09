import { Router } from 'express';

import { branchRoutes } from './routes/branch.routes.js';

export function createBranchesModule(): Router {
  const router = Router();
  router.use(branchRoutes);
  return router;
}
