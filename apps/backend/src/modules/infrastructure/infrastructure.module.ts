import { Router } from 'express';

import { infrastructureRoutes } from './routes/infrastructure.routes.js';

export function createInfrastructureModule(): Router {
  const router = Router();
  router.use(infrastructureRoutes);
  return router;
}
