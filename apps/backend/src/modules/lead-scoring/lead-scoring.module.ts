import { Router } from 'express';

import { leadScoringRoutes } from './routes/lead-scoring.routes.js';

export function createLeadScoringModule(): Router {
  const router = Router();
  router.use(leadScoringRoutes);
  return router;
}

export { leadScoringService } from './services/lead-scoring.service.js';
export { scoringEngineService } from './services/scoring-engine.service.js';
