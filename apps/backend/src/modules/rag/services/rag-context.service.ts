import type { RagQuerySource } from '@kuberone/database';
import type { z } from 'zod';

import type { RagContextResult } from '../types/rag.types.js';
import type { contextSchema } from '../validators/rag.validator.js';

import { retrievalService } from './retrieval.service.js';

type ContextInput = z.infer<typeof contextSchema>;

export const ragContextService = {
  async build(input: ContextInput, actorId: string): Promise<RagContextResult> {
    const query = input.q ?? 'loan policies eligibility documents lender guidelines';

    const result = await retrievalService.search(
      {
        q: query,
        topK: input.topK,
        source: input.source,
        categoryCode: input.categoryCode,
        productCode: input.productCode,
        lenderCode: input.lenderCode,
      },
      { actorId },
    );

    const chunks = result.chunks;

    const policies = chunks
      .filter((c) => c.sourceType === 'POLICY' || c.sourceType === 'LENDER_POLICY' || c.sourceType === 'PRODUCT_GUIDELINE')
      .map((c) => `[${c.documentTitle}] ${c.content.slice(0, 500)}`);

    const faqs = chunks
      .filter((c) => c.sourceType === 'FAQ')
      .map((c) => `Q: ${c.documentTitle}\nA: ${c.content.slice(0, 400)}`);

    const sops = chunks
      .filter((c) => c.sourceType === 'SOP')
      .map((c) => `[SOP: ${c.documentTitle}] ${c.content.slice(0, 400)}`);

    const lenderRules = chunks
      .filter((c) => c.lenderCode || c.sourceType === 'LENDER_POLICY')
      .map((c) => `[${c.lenderCode ?? 'Lender'}] ${c.content.slice(0, 400)}`);

    const eligibilityRules = chunks
      .filter((c) => c.sourceType === 'ELIGIBILITY_RULE' || c.content.toLowerCase().includes('eligibility'))
      .map((c) => c.content.slice(0, 400));

    const snippets = chunks.map(
      (c) => `[${c.sourceType ?? 'KNOWLEDGE'}] ${c.documentTitle}: ${c.content.slice(0, 600)}`,
    );

    return {
      snippets,
      chunks,
      policies,
      faqs,
      sops,
      lenderRules,
      eligibilityRules,
      source: input.source as RagQuerySource,
      generatedAt: new Date().toISOString(),
    };
  },

  async getSnippetStrings(
    query: string,
    options?: { topK?: number; productCode?: string; lenderCode?: string; source?: RagQuerySource },
    actorId = 'system',
  ): Promise<string[]> {
    const ctx = await this.build(
      {
        q: query,
        topK: options?.topK ?? 8,
        source: options?.source ?? 'AI_ADVISOR',
        productCode: options?.productCode,
        lenderCode: options?.lenderCode,
      },
      actorId,
    );
    return ctx.snippets;
  },
};
