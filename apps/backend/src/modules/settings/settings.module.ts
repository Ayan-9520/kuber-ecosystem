import { Router } from 'express';

import { settingRoutes } from './routes/setting.routes.js';

export function createSettingsModule(): Router {
  const router = Router();
  router.use(settingRoutes);
  return router;
}
