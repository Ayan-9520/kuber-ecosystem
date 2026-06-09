import { ragRepository } from '../../repositories/rag.repository.js';
import type { VectorSearchResult, VectorStoreProvider } from '../../types/rag.types.js';

function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0;
  let normA = 0;
  let normB = 0;
  const len = Math.min(a.length, b.length);
  for (let i = 0; i < len; i++) {
    dot += (a[i] ?? 0) * (b[i] ?? 0);
    normA += (a[i] ?? 0) ** 2;
    normB += (b[i] ?? 0) ** 2;
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  return denom === 0 ? 0 : dot / denom;
}

export class LocalVectorStore implements VectorStoreProvider {
  readonly name = 'LOCAL' as const;

  async upsert(_chunkId: string, _documentId: string, _embedding: number[]): Promise<string> {
    return _chunkId;
  }

  async search(
    queryEmbedding: number[],
    topK: number,
    filters?: Record<string, unknown>,
  ): Promise<VectorSearchResult[]> {
    const records = await ragRepository.findEmbeddingsForSearch({
      productCode: filters?.productCode as string | undefined,
      lenderCode: filters?.lenderCode as string | undefined,
      categoryCode: filters?.categoryCode as string | undefined,
    });

    const scored = records.map((r: (typeof records)[number]) => {
      const embedding = r.embedding as number[];
      return {
        chunkId: r.chunkId,
        documentId: r.documentId,
        embeddingId: r.id,
        score: cosineSimilarity(queryEmbedding, embedding),
      };
    });

    return scored
      .sort((a: (typeof scored)[number], b: (typeof scored)[number]) => b.score - a.score)
      .slice(0, topK);
  }

  async deleteByDocument(documentId: string): Promise<void> {
    await ragRepository.deleteEmbeddingsByDocument(documentId);
  }
}
