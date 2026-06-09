import { createHash } from 'node:crypto';

import { env } from '../../../config/env.js';
import type { EmbeddingInput, EmbeddingResult, PlatformRequestContext } from '../types/ai-platform.types.js';

import { modelRoutingService } from './model-routing.service.js';
import { openAiClientService } from './openai-client.service.js';
import { usageTrackingService } from './usage-tracking.service.js';


const LOCAL_HASH_DIM = 384;

function localHashEmbed(text: string): number[] {
  const vec = new Array<number>(LOCAL_HASH_DIM).fill(0);
  const tokens = text.toLowerCase().split(/\s+/);
  for (const token of tokens) {
    const hash = createHash('sha256').update(token).digest();
    for (let i = 0; i < LOCAL_HASH_DIM; i++) {
      vec[i] = (vec[i] ?? 0) + (hash[i % hash.length]! / 255 - 0.5);
    }
  }
  const norm = Math.sqrt(vec.reduce((s, v) => s + v * v, 0)) || 1;
  return vec.map((v) => v / norm);
}

export const embeddingService = {
  isOpenAiAvailable(): boolean {
    return openAiClientService.isConfigured() && env.EMBEDDING_PROVIDER === 'openai';
  },

  async embed(input: EmbeddingInput, ctx?: PlatformRequestContext): Promise<EmbeddingResult> {
    const start = Date.now();
    const useOpenAi = this.isOpenAiAvailable();
    const { primary: model } = await modelRoutingService.resolveModel(input.module, 'EMBEDDING', input.model);

    const aiRequest = await usageTrackingService.startRequest({
      userId: ctx?.actorId,
      module: input.module,
      requestType: 'EMBEDDING',
      modelCode: model,
      ctx,
      metadata: { textCount: input.texts.length },
    });

    try {
      if (useOpenAi) {
        const client = openAiClientService.getClient()!;
        const response = await client.embeddings.create({ model, input: input.texts });
        const embeddings = response.data.map((d) => d.embedding);
        const latencyMs = Date.now() - start;
        const tokens = response.usage?.total_tokens ?? 0;

        await usageTrackingService.completeRequest(aiRequest.id, {
          status: 'SUCCESS',
          modelCode: model,
          inputTokens: tokens,
          outputTokens: 0,
          latencyMs,
          embedding: embeddings,
        });
        await usageTrackingService.logUsage({
          requestId: aiRequest.id,
          userId: ctx?.actorId,
          module: input.module,
          requestType: 'EMBEDDING',
          modelCode: model,
          inputTokens: tokens,
          outputTokens: 0,
          latencyMs,
        });

        return {
          embeddings,
          model,
          provider: 'openai',
          dimensions: embeddings[0]?.length ?? 1536,
          totalTokens: tokens,
          latencyMs,
          requestId: aiRequest.id,
        };
      }

      const embeddings = input.texts.map((t) => localHashEmbed(t));
      const latencyMs = Date.now() - start;

      await usageTrackingService.completeRequest(aiRequest.id, {
        status: 'SUCCESS',
        modelCode: 'local-hash-v1',
        latencyMs,
        embedding: embeddings,
      });

      return {
        embeddings,
        model: 'local-hash-v1',
        provider: 'local_hash',
        dimensions: LOCAL_HASH_DIM,
        latencyMs,
        requestId: aiRequest.id,
      };
    } catch (err) {
      const latencyMs = Date.now() - start;
      await usageTrackingService.completeRequest(aiRequest.id, {
        status: 'FAILED',
        modelCode: model,
        latencyMs,
        errorCode: 'EMBEDDING_FAILED',
        errorMessage: String(err),
      });
      throw err;
    }
  },

  get dimensions(): number {
    return this.isOpenAiAvailable() ? 1536 : LOCAL_HASH_DIM;
  },

  get providerName(): string {
    return this.isOpenAiAvailable() ? 'OPENAI' : 'LOCAL_HASH';
  },
};
