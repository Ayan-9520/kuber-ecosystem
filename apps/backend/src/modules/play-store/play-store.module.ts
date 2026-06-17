import { Router } from 'express';

import { playStoreRoutes } from './routes/play-store.routes.js';

export function createPlayStoreModule(): Router {
  const router = Router();
  router.use(playStoreRoutes);
  return router;
}
