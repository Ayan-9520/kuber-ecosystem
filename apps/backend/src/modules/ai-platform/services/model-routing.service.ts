import { env } from '../../../config/env.js';
import {
  DEFAULT_CHAT_MODEL,
  DEFAULT_EMBEDDING_MODEL,
  DEFAULT_TRANSCRIPTION_MODEL,
  DEFAULT_TTS_MODEL,
} from '../constants/ai-platform.constants.js';
import { aiPlatformRepository } from '../repositories/ai-platform.repository.js';
import type { AiModelCapability, AiModuleSource } from '../types/ai-platform.types.js';

const ENV_DEFAULTS: Record<AiModelCapability, string> = {
  CHAT: env.OPENAI_DEFAULT_MODEL ?? env.OPENAI_MODEL ?? DEFAULT_CHAT_MODEL,
  EMBEDDING: env.OPENAI_EMBEDDING_MODEL ?? DEFAULT_EMBEDDING_MODEL,
  TRANSCRIPTION: env.OPENAI_TRANSCRIPTION_MODEL ?? DEFAULT_TRANSCRIPTION_MODEL,
  TTS: env.OPENAI_TTS_MODEL ?? DEFAULT_TTS_MODEL,
  MODERATION: 'text-moderation-latest',
  REALTIME: env.OPENAI_DEFAULT_MODEL ?? DEFAULT_CHAT_MODEL,
  STRUCTURED: env.OPENAI_DEFAULT_MODEL ?? env.OPENAI_MODEL ?? DEFAULT_CHAT_MODEL,
  FUNCTION_CALLING: env.OPENAI_DEFAULT_MODEL ?? env.OPENAI_MODEL ?? DEFAULT_CHAT_MODEL,
};

export const modelRoutingService = {
  async resolveModel(module: AiModuleSource, capability: AiModelCapability, override?: string): Promise<{
    primary: string;
    fallback: string;
    providerCode: string;
  }> {
    if (override) {
      return {
        primary: override,
        fallback: env.OPENAI_FALLBACK_MODEL ?? DEFAULT_CHAT_MODEL,
        providerCode: 'openai',
      };
    }

    const route = await aiPlatformRepository.findModelRoute(module, capability);
    if (route?.isActive) {
      return {
        primary: route.primaryModel.code,
        fallback: route.fallbackModel?.code ?? env.OPENAI_FALLBACK_MODEL ?? DEFAULT_CHAT_MODEL,
        providerCode: route.primaryModel.provider.code,
      };
    }

    return {
      primary: ENV_DEFAULTS[capability],
      fallback: env.OPENAI_FALLBACK_MODEL ?? DEFAULT_CHAT_MODEL,
      providerCode: 'openai',
    };
  },

  async listActiveModels() {
    return aiPlatformRepository.listModels();
  },
};
