import { Router } from 'express';

import { contentRoutes } from './routes/content.routes.js';

export function createContentModule(): Router {
  const router = Router();
  router.use(contentRoutes);
  return router;
}

export { contentWorkerService } from './services/content-worker.service.js';
