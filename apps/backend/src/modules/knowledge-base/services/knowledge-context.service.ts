import type { z } from 'zod';

import { knowledgeRepository } from '../repositories/knowledge.repository.js';
import type { AiKnowledgeContext } from '../types/knowledge-base.types.js';
import type { aiContextQuerySchema } from '../validators/knowledge.validator.js';

type ContextQuery = z.infer<typeof aiContextQuerySchema>;

function scoreRelevance(
  article: { title: string; summary: string | null; productCode: string | null; lenderCode: string | null; viewCount: number },
  query: ContextQuery,
): number {
  let score = 50 + Math.min(article.viewCount, 50);
  if (query.productCode && article.productCode === query.productCode) score += 20;
  if (query.lenderCode && article.lenderCode === query.lenderCode) score += 15;
  if (query.query) {
    const q = query.query.toLowerCase();
    if (article.title.toLowerCase().includes(q)) score += 15;
    if (article.summary?.toLowerCase().includes(q)) score += 10;
  }
  return Math.min(100, score);
}

export const knowledgeContextService = {
  async buildForAi(query: ContextQuery): Promise<AiKnowledgeContext> {
    const contentTypes = query.contentTypes?.split(',').filter(Boolean) as never[] | undefined;

    const where = {
      status: 'PUBLISHED' as const,
      ...(query.productCode ? { productCode: query.productCode } : {}),
      ...(query.lenderCode ? { lenderCode: query.lenderCode } : {}),
      ...(contentTypes?.length ? { contentType: { in: contentTypes } } : {}),
      ...(query.categoryCode
        ? { category: { code: query.categoryCode } }
        : {}),
      ...(query.query
        ? {
            OR: [
              { title: { contains: query.query } },
              { summary: { contains: query.query } },
              { searchKeywords: { contains: query.query } },
            ],
          }
        : {}),
    };

    const articles = await knowledgeRepository.listArticles(
      where,
      0,
      query.limit,
      { viewCount: 'desc' },
    );

    const snippets = articles.map((a) => ({
      id: a.id,
      title: a.title,
      summary: a.summary ?? a.title,
      content: a.content.slice(0, 1500),
      contentType: a.contentType,
      categoryCode: a.category?.code,
      tags: a.articleTags.map((t) => t.tag.name),
      relevanceScore: scoreRelevance(a, query),
    }));

    snippets.sort((a, b) => b.relevanceScore - a.relevanceScore);

    return {
      snippets,
      policies: snippets.filter((s) => s.contentType === 'POLICY').map((s) => `${s.title}: ${s.summary}`),
      faqs: snippets.filter((s) => s.contentType === 'FAQ').map((s) => `Q: ${s.title}\nA: ${s.summary}`),
      scripts: snippets.filter((s) => s.contentType === 'SCRIPT').map((s) => s.content.slice(0, 500)),
      source: query.source,
      generatedAt: new Date().toISOString(),
    };
  },

  async getSnippetStrings(limit = 8, productCode?: string): Promise<string[]> {
    const ctx = await this.buildForAi({
      source: 'AI_ADVISOR',
      limit,
      productCode,
    });
    return ctx.snippets.map((s) => `[${s.contentType}] ${s.title}: ${s.summary}`);
  },
};
