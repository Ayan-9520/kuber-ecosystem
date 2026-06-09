import { Router } from 'express';

import { ragRoutes } from './routes/rag.routes.js';

export { ragContextService } from './services/rag-context.service.js';
export { ragQueryService } from './services/rag-query.service.js';
export { ingestionService } from './services/ingestion.service.js';

export function createRagModule(): Router {
  const router = Router();
  router.use(ragRoutes);
  return router;
}
