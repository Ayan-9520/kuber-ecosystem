import type { AiModuleSource } from '@kuberone/database';

import { aiPlatformRepository } from '../repositories/ai-platform.repository.js';

import { openAiClientService } from './openai-client.service.js';

export const moderationService = {
  async moderate(
    text: string,
    params: { userId?: string; module: AiModuleSource },
  ): Promise<{ flagged: boolean; categories?: Record<string, boolean>; action: 'allow' | 'block' }> {
    const client = openAiClientService.getClient();
    if (!client) {
      return { flagged: false, action: 'allow' };
    }

    try {
      const result = await client.moderations.create({ input: text });
      const top = result.results[0];
      const flagged = top?.flagged ?? false;
      const categories = top?.categories as Record<string, boolean> | undefined;

      await aiPlatformRepository.createModerationLog({
        userId: params.userId,
        module: params.module,
        inputText: text.slice(0, 2000),
        flagged,
        categories: categories as never,
        scores: top?.category_scores as never,
        action: flagged ? 'block' : 'allow',
      });

      return { flagged, categories, action: flagged ? 'block' : 'allow' };
    } catch {
      return { flagged: false, action: 'allow' };
    }
  },
};
