import { Router } from 'express';

import { knowledgeRoutes } from './routes/knowledge.routes.js';

export function createKnowledgeBaseModule(): Router {
  const router = Router();
  router.use(knowledgeRoutes);
  return router;
}
