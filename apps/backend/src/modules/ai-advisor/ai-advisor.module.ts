import { Router } from 'express';

import { createAiPlatformModule } from '../ai-platform/ai-platform.module.js';
import { voiceAiRoutes } from '../voice-ai/routes/voice-ai.routes.js';

import { aiAdvisorRoutes } from './routes/ai-advisor.routes.js';

export function createAiAdvisorModule(): Router {
  const router = Router();
  router.use('/platform', createAiPlatformModule());
  router.use(aiAdvisorRoutes);
  router.use('/voice', voiceAiRoutes);
  return router;
}

export { aiAdvisorService } from './services/ai-advisor.service.js';
export { contextBuilderService } from './services/context-builder.service.js';
