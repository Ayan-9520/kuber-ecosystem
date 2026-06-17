import { Router } from 'express';

import { mobileReleaseRoutes } from './routes/mobile-release.routes.js';

export function createMobileReleaseModule(): Router {
  const router = Router();
  router.use(mobileReleaseRoutes);
  return router;
}
