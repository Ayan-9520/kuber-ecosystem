import { Router } from 'express';

import { drRoutes } from './routes/dr.routes.js';

export function createDrModule(): Router {
  const router = Router();
  router.use(drRoutes);
  return router;
}
