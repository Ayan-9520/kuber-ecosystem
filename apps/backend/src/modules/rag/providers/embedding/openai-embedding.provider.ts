import { embeddingService } from '../../../ai-platform/services/embedding.service.js';
import type { EmbeddingProvider } from '../../types/rag.types.js';

export const openAiEmbeddingProvider: EmbeddingProvider = {
  name: 'OPENAI',
  model: 'text-embedding-3-small',
  dimensions: 1536,

  async embed(texts: string[]): Promise<number[][]> {
    const result = await embeddingService.embed({ module: 'RAG', texts });
    return result.embeddings;
  },
};
