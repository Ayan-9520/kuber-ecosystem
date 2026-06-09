import { Router } from 'express';

import { recommendationsRoutes } from './routes/recommendations.routes.js';

export function createRecommendationsModule(): Router {
  const router = Router();
  router.use(recommendationsRoutes);
  return router;
}

export { recommendationOrchestratorService } from './services/recommendation-orchestrator.service.js';
