import { Router } from 'express';

import { aiPlatformRoutes } from './routes/ai-platform.routes.js';

export function createAiPlatformModule(): Router {
  const router = Router();
  router.use(aiPlatformRoutes);
  return router;
}

export { completionService } from './services/completion.service.js';
export { embeddingService } from './services/embedding.service.js';
export { aiPlatformContextBuilderService } from './services/context-builder.service.js';
export { aiPlatformPromptBuilderService } from './services/prompt-builder.service.js';
export { speechToTextService } from './services/speech-to-text.service.js';
export { textToSpeechService } from './services/text-to-speech.service.js';
export { usageTrackingService } from './services/usage-tracking.service.js';
export { modelRoutingService } from './services/model-routing.service.js';
export { moderationService } from './services/moderation.service.js';
export { openAiClientService } from './services/openai-client.service.js';
export { rulesEngineService } from './services/rules-engine.service.js';
export { functionCallingService } from './services/function-calling.service.js';
export { responseProcessorService } from './services/response-processor.service.js';
