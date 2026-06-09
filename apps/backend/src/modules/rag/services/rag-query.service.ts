import type { z } from 'zod';

import { completionService } from '../../ai-platform/services/completion.service.js';
import { ragRepository } from '../repositories/rag.repository.js';
import type { RagQueryResult, RequestContext } from '../types/rag.types.js';
import type { querySchema } from '../validators/rag.validator.js';

import { ragContextService } from './rag-context.service.js';


type QueryInput = z.infer<typeof querySchema>;

export const ragQueryService = {
  async query(input: QueryInput, ctx: RequestContext): Promise<RagQueryResult> {
    const start = Date.now();

    const context = await ragContextService.build(
      {
        q: input.q,
        topK: input.topK,
        source: input.source,
        categoryCode: input.categoryCode,
        productCode: input.productCode,
        lenderCode: input.lenderCode,
      },
      ctx.actorId,
    );

    let answer: string;
    let model: string | undefined;
    let provider: string | undefined;
    let tokensUsed: number | undefined;

    if (input.generateAnswer && completionService.isAvailable()) {
      const contextBlock = [
        '=== RETRIEVED KNOWLEDGE ===',
        ...context.snippets,
        '',
        '=== POLICIES ===',
        ...context.policies,
        '',
        '=== FAQs ===',
        ...context.faqs,
      ].join('\n');

      const result = await completionService.chat({
        module: 'RAG',
        messages: [
          {
            role: 'system',
            content: `You are KuberOne AI for Kuber Finserve. Answer ONLY using the retrieved knowledge below. If insufficient, say what is missing. Use ₹ Indian format. Do not guarantee approvals.\n\n${contextBlock}`,
          },
          { role: 'user', content: input.q },
        ],
      }, { actorId: ctx.actorId, ipAddress: ctx.ipAddress, requestId: ctx.requestId });

      answer = result.content;
      model = result.model;
      provider = result.provider;
      tokensUsed = result.totalTokens;
    } else {
      answer = context.snippets.length > 0
        ? `Based on KuberOne knowledge:\n\n${context.snippets.slice(0, 3).join('\n\n')}`
        : 'No relevant knowledge found for this query. Please check the Knowledge Base or contact support.';
      model = 'kuber-rag-v1';
      provider = 'rules-engine';
    }

    const latencyMs = Date.now() - start;

    const ragQuery = await ragRepository.createQuery({
      userId: ctx.actorId,
      queryText: input.q,
      source: input.source as never,
      topK: input.topK,
      chunkCount: context.chunks.length,
      latencyMs,
      ipAddress: ctx.ipAddress,
      requestId: ctx.requestId,
    });

    const response = await ragRepository.createResponse({
      query: { connect: { id: ragQuery.id } },
      answer,
      contextUsed: {
        snippetCount: context.snippets.length,
        chunkIds: context.chunks.map((c) => c.chunkId),
      } as never,
      model,
      provider,
      tokensUsed,
      latencyMs,
    });

    return {
      queryId: ragQuery.id,
      responseId: response.id,
      answer,
      context,
      model,
      provider,
      tokensUsed,
      latencyMs,
    };
  },

  async addFeedback(
    responseId: string,
    userId: string,
    rating: number,
    helpful: boolean | undefined,
    comment: string | undefined,
  ) {
    return ragRepository.createFeedback({
      response: { connect: { id: responseId } },
      userId,
      rating,
      helpful,
      comment,
    });
  },
};
