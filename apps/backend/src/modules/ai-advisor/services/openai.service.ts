import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions.js';

import { completionService } from '../../ai-platform/services/completion.service.js';
import { rulesEngineService } from '../../ai-platform/services/rules-engine.service.js';

export interface OpenAiChatResult {
  content: string;
  model: string;
  tokensUsed?: number;
  provider: 'openai' | 'rules-engine';
}

export const openAiService = {
  isAvailable(): boolean {
    return completionService.isAvailable();
  },

  async chat(
    messages: ChatCompletionMessageParam[],
    ctx?: { actorId: string; ipAddress?: string; requestId?: string },
    fallback?: () => OpenAiChatResult,
  ): Promise<OpenAiChatResult> {
    const result = await completionService.chat({
      module: 'AI_ADVISOR',
      messages,
      fallback: fallback
        ? () => {
            const fb = fallback();
            return { ...fb, latencyMs: 0, provider: fb.provider };
          }
        : undefined,
    }, ctx ? { actorId: ctx.actorId, ipAddress: ctx.ipAddress, requestId: ctx.requestId } : undefined);

    return {
      content: result.content,
      model: result.model,
      tokensUsed: result.totalTokens,
      provider: result.provider === 'openai' ? 'openai' : 'rules-engine',
    };
  },

  fallbackReply(params: {
    intent: string;
    language: 'en' | 'hi' | 'hinglish';
    structured: Record<string, unknown>;
  }): OpenAiChatResult {
    const result = rulesEngineService.fallbackReply({
      intent: params.intent,
      language: params.language,
      structured: params.structured,
    });
    return {
      content: result.content,
      model: result.model,
      provider: 'rules-engine',
    };
  },
};
