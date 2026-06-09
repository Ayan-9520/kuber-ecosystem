import type { z } from 'zod';

import { knowledgeRepository } from '../repositories/knowledge.repository.js';
import type { KnowledgeAnalytics } from '../types/knowledge-base.types.js';
import type { analyticsQuerySchema } from '../validators/knowledge.validator.js';

type AnalyticsQuery = z.infer<typeof analyticsQuerySchema>;

export const knowledgeAnalyticsService = {
  async getAnalytics(query: AnalyticsQuery): Promise<KnowledgeAnalytics> {
    const dateFilter = query.fromDate || query.toDate
      ? {
          createdAt: {
            ...(query.fromDate ? { gte: query.fromDate } : {}),
            ...(query.toDate ? { lte: query.toDate } : {}),
          },
        }
      : undefined;

    const [
      statusGroups,
      contentTypeGroups,
      topViewed,
      searchTrends,
      avgRating,
      deptUsage,
      totalViews,
      totalSearches,
    ] = await Promise.all([
      knowledgeRepository.groupArticlesByStatus(),
      knowledgeRepository.groupArticlesByContentType(),
      knowledgeRepository.topViewedArticles(10),
      knowledgeRepository.searchTrends(10),
      knowledgeRepository.avgFeedbackRating(),
      knowledgeRepository.departmentViewCounts(),
      knowledgeRepository.countViews(dateFilter),
      knowledgeRepository.countSearches(dateFilter),
    ]);

    const statusMap: Record<string, number> = {};
    for (const g of statusGroups) statusMap[g.status] = g._count.id;

    const contentTypeDistribution: Record<string, number> = {};
    for (const g of contentTypeGroups) contentTypeDistribution[g.contentType] = g._count.id;

    const totalArticles = Object.values(statusMap).reduce((s, n) => s + n, 0);

    return {
      totalArticles,
      publishedArticles: statusMap.PUBLISHED ?? 0,
      draftArticles: statusMap.DRAFT ?? 0,
      pendingReview: statusMap.REVIEW ?? 0,
      totalViews,
      totalSearches,
      averageFeedbackRating: Math.round((avgRating._avg.rating ?? 0) * 10) / 10,
      mostViewed: topViewed.map((a) => ({ id: a.id, title: a.title, viewCount: a.viewCount })),
      mostUsedPolicies: topViewed
        .filter((a) => a.contentType === 'POLICY')
        .map((a) => ({ id: a.id, title: a.title, viewCount: a.viewCount })),
      searchTrends: searchTrends.map((s) => ({ query: s.query, count: s._count.id })),
      departmentUsage: deptUsage.map((d) => ({
        department: d.source ?? 'Unknown',
        views: d._count.id,
      })),
      contentTypeDistribution,
    };
  },
};
