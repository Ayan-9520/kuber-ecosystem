import { Router } from 'express';

import { goLiveRoutes } from './routes/go-live.routes.js';

export function createGoLiveModule(): Router {
  const router = Router();
  router.use(goLiveRoutes);
  return router;
}
