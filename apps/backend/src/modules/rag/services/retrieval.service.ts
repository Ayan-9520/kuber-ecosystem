import type { z } from 'zod';

import { env } from '../../../config/env.js';
import { embeddingProvider } from '../providers/embedding/embedding.factory.js';
import { vectorStore } from '../providers/vector-store/vector-store.factory.js';
import { ragRepository } from '../repositories/rag.repository.js';
import type { RagQuerySource, RequestContext, RetrievedChunk } from '../types/rag.types.js';
import type { searchSchema } from '../validators/rag.validator.js';

type SearchInput = z.infer<typeof searchSchema>;

function rerank(chunks: RetrievedChunk[]): RetrievedChunk[] {
  return chunks
    .map((c) => ({
      ...c,
      score: c.score * (c.content.length > 100 ? 1.05 : 0.95),
    }))
    .sort((a, b) => b.score - a.score);
}

export const retrievalService = {
  async search(input: SearchInput, ctx: RequestContext) {
    const start = Date.now();
    const topK = input.topK ?? env.RAG_TOP_K ?? 5;
    const minScore = env.RAG_MIN_SCORE ?? 0.3;

    const [queryEmbedding] = await embeddingProvider.embed([input.q]);

    const vectorResults = await vectorStore.search(queryEmbedding!, topK * 2, {
      categoryCode: input.categoryCode,
      productCode: input.productCode,
      lenderCode: input.lenderCode,
    });

    const records = await ragRepository.findEmbeddingsForSearch({
      productCode: input.productCode,
      lenderCode: input.lenderCode,
      categoryCode: input.categoryCode,
    });

    type EmbeddingSearchRow = (typeof records)[number];
    const recordMap = new Map<string, EmbeddingSearchRow>(records.map((r: EmbeddingSearchRow) => [r.chunkId, r]));

    let chunks: RetrievedChunk[] = vectorResults
      .filter((v) => v.score >= minScore)
      .map((v) => {
        const rec = recordMap.get(v.chunkId);
        return {
          chunkId: v.chunkId,
          documentId: v.documentId,
          documentTitle: rec?.document.title ?? 'Unknown',
          content: rec?.chunk.content ?? '',
          score: Math.round(v.score * 1000) / 1000,
          categoryCode: rec?.document.categoryCode,
          productCode: rec?.document.productCode,
          lenderCode: rec?.document.lenderCode,
          sourceType: rec?.document.sourceType,
        };
      })
      .filter((c) => c.content.length > 0);

    if (input.rerank) chunks = rerank(chunks);
    chunks = chunks.slice(0, topK);

    const latencyMs = Date.now() - start;

    const ragQuery = await ragRepository.createQuery({
      userId: ctx.actorId,
      queryText: input.q,
      source: input.source as RagQuerySource,
      filters: {
        categoryCode: input.categoryCode,
        productCode: input.productCode,
        lenderCode: input.lenderCode,
      } as never,
      topK,
      chunkCount: chunks.length,
      latencyMs,
      ipAddress: ctx.ipAddress,
      requestId: ctx.requestId,
    });

    await ragRepository.createRetrievalLog({
      query: { connect: { id: ragQuery.id } },
      userId: ctx.actorId,
      queryText: input.q,
      source: input.source as RagQuerySource,
      topK,
      chunkIds: chunks.map((c) => c.chunkId) as never,
      scores: chunks.map((c) => ({ chunkId: c.chunkId, score: c.score })) as never,
      latencyMs,
      vectorProvider: vectorStore.name,
      reranked: !!input.rerank,
    });

    return { queryId: ragQuery.id, chunks, latencyMs, meta: { total: chunks.length, topK } };
  },
};
