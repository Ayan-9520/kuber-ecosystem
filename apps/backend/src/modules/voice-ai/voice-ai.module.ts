import { Router } from 'express';

import { voiceAiRoutes } from './routes/voice-ai.routes.js';

export function createVoiceAiModule(): Router {
  const router = Router();
  router.use(voiceAiRoutes);
  return router;
}

export { voiceSessionService } from './services/voice-session.service.js';
