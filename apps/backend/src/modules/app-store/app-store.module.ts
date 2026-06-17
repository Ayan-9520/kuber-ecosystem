import { Router } from 'express';

import { appStoreRoutes } from './routes/app-store.routes.js';

export function createAppStoreModule(): Router {
  const router = Router();
  router.use(appStoreRoutes);
  return router;
}
