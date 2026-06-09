import { Router } from 'express';

import { aiRoutes } from './routes/ai.routes.js';

export function createAiModule(): Router {
  const router = Router();
  router.use(aiRoutes);
  return router;
}
