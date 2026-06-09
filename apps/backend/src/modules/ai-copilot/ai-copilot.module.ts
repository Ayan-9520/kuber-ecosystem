import { Router } from 'express';

import { aiCopilotRoutes } from './routes/ai-copilot.routes.js';

export function createAiCopilotModule(): Router {
  const router = Router();
  router.use(aiCopilotRoutes);
  return router;
}

export { aiCopilotService } from './services/ai-copilot.service.js';
