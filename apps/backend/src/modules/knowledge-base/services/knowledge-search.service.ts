import type { Prisma } from '@kuberone/database';
import type { z } from 'zod';

import { prisma } from '../../../config/database.js';
import { knowledgeRepository } from '../repositories/knowledge.repository.js';
import type { KnowledgeSearchResult, RequestContext } from '../types/knowledge-base.types.js';
import type { searchQuerySchema } from '../validators/knowledge.validator.js';

type SearchQuery = z.infer<typeof searchQuerySchema>;

function mapArticle(a: {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  contentType: string;
  categoryId: string;
  status: string;
  currentVersion: number;
  viewCount: number;
  publishedAt: Date | null;
  productCode: string | null;
  lenderCode: string | null;
  category?: { name: string };
  articleTags?: Array<{ tag: { id: string; code: string; name: string } }>;
}) {
  return {
    id: a.id,
    slug: a.slug,
    title: a.title,
    summary: a.summary,
    contentType: a.contentType as never,
    categoryId: a.categoryId,
    categoryName: a.category?.name,
    status: a.status as never,
    currentVersion: a.currentVersion,
    viewCount: a.viewCount,
    publishedAt: a.publishedAt?.toISOString() ?? null,
    productCode: a.productCode,
    lenderCode: a.lenderCode,
    tags: a.articleTags?.map((t) => t.tag),
  };
}

export const knowledgeSearchService = {
  async search(query: SearchQuery, ctx: RequestContext): Promise<KnowledgeSearchResult> {
    const skip = (query.page - 1) * query.limit;
    const baseWhere: Prisma.KnowledgeArticleWhereInput = {
      status: 'PUBLISHED',
      ...(query.categoryId ? { categoryId: query.categoryId } : {}),
      ...(query.contentType ? { contentType: query.contentType } : {}),
      ...(query.productCode ? { productCode: query.productCode } : {}),
      ...(query.lenderCode ? { lenderCode: query.lenderCode } : {}),
      ...(query.tagId ? { articleTags: { some: { tagId: query.tagId } } } : {}),
    };

    let items: ReturnType<typeof mapArticle>[] = [];
    let total = 0;

    if (query.searchType === 'fulltext') {
      const rows = await prisma.$queryRaw<Array<{ id: string }>>`
        SELECT id FROM knowledge_articles
        WHERE status = 'PUBLISHED'
        AND MATCH(title, summary, content, search_keywords) AGAINST(${query.q} IN NATURAL LANGUAGE MODE)
        LIMIT ${query.limit} OFFSET ${skip}
      `;
      const ids = rows.map((r) => r.id);
      if (ids.length > 0) {
        const articles = await knowledgeRepository.listArticles(
          { id: { in: ids }, ...baseWhere },
          0,
          query.limit,
          { viewCount: 'desc' },
        );
        items = articles.map(mapArticle);
      }
      const countRows = await prisma.$queryRaw<Array<{ cnt: bigint }>>`
        SELECT COUNT(*) as cnt FROM knowledge_articles
        WHERE status = 'PUBLISHED'
        AND MATCH(title, summary, content, search_keywords) AGAINST(${query.q} IN NATURAL LANGUAGE MODE)
      `;
      total = Number(countRows[0]?.cnt ?? 0);
    } else {
      const searchWhere: Prisma.KnowledgeArticleWhereInput = {
        ...baseWhere,
        OR: [
          { title: { contains: query.q } },
          { summary: { contains: query.q } },
          { content: { contains: query.q } },
          { searchKeywords: { contains: query.q } },
        ],
      };
      const [articles, count] = await Promise.all([
        knowledgeRepository.listArticles(searchWhere, skip, query.limit, { viewCount: 'desc' }),
        knowledgeRepository.countArticles(searchWhere),
      ]);
      items = articles.map(mapArticle);
      total = count;
    }

    await knowledgeRepository.createSearchHistory({
      userId: ctx.actorId,
      query: query.q,
      searchType: query.searchType,
      filters: {
        categoryId: query.categoryId,
        tagId: query.tagId,
        contentType: query.contentType,
        productCode: query.productCode,
      } as never,
      resultCount: total,
      ipAddress: ctx.ipAddress,
    });

    await knowledgeRepository.createAudit({
      userId: ctx.actorId,
      action: 'SEARCHED',
      entityType: 'search',
      newValues: { query: query.q, resultCount: total },
      ipAddress: ctx.ipAddress,
      requestId: ctx.requestId,
    });

    return {
      items,
      meta: { total, page: query.page, limit: query.limit, searchType: query.searchType },
    };
  },
};
