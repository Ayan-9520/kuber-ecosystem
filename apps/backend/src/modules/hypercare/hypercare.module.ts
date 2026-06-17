import { Router } from 'express';

import { hypercareRoutes } from './routes/hypercare.routes.js';

export function createHypercareModule(): Router {
  const router = Router();
  router.use(hypercareRoutes);
  return router;
}
