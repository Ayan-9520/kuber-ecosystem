import { env } from '../../../../config/env.js';
import type { EmbeddingProvider } from '../../types/rag.types.js';

import { localHashEmbeddingProvider } from './local-hash-embedding.provider.js';
import { openAiEmbeddingProvider } from './openai-embedding.provider.js';

export function createEmbeddingProvider(): EmbeddingProvider {
  const provider = env.EMBEDDING_PROVIDER ?? 'local_hash';

  if (provider === 'openai' && env.OPENAI_API_KEY) {
    return openAiEmbeddingProvider;
  }

  return localHashEmbeddingProvider;
}

export const embeddingProvider = createEmbeddingProvider();
