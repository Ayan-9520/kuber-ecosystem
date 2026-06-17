import type { AuthenticatedUser } from '@kuberone/shared-types';
import type { ContentAnalyticsQuery } from '@kuberone/shared-validation';

import { prisma } from '../../../config/database.js';
import { contentRepository } from '../repositories/content.repository.js';

function periodBounds(period: string): { start: Date; end: Date } {
  const end = new Date();
  const start = new Date();
  switch (period) {
    case 'day':
      start.setDate(end.getDate() - 1);
      break;
    case 'week':
      start.setDate(end.getDate() - 7);
      break;
    case 'quarter':
      start.setMonth(end.getMonth() - 3);
      break;
    default:
      start.setMonth(end.getMonth() - 1);
  }
  return { start, end };
}

export const contentAnalyticsService = {
  async dashboard(_actor: AuthenticatedUser, query: ContentAnalyticsQuery) {
    const { start, end } = periodBounds(query.period);
    const from = query.fromDate ?? start;
    const to = query.toDate ?? end;

    const where = {
      createdAt: { gte: from, lte: to },
      ...(query.contentType ? { contentType: query.contentType as never } : {}),
    };

    const [totalGenerated, approved, rejected, published, usageCount, agg] = await Promise.all([
      contentRepository.request.count(where),
      contentRepository.request.count({ ...where, status: 'APPROVED' }),
      prisma.contentApproval.count({ where: { status: 'REJECTED', createdAt: { gte: from, lte: to } } }),
      contentRepository.request.count({ ...where, status: 'PUBLISHED' }),
      contentRepository.usage.count({ usedAt: { gte: from, lte: to } }),
      prisma.contentGenerationResult.aggregate({
        where: { request: where },
        _avg: { generationMs: true, tokensUsed: true, estimatedCost: true },
        _sum: { tokensUsed: true, estimatedCost: true },
        _count: { id: true },
      }),
    ]);

    const templatePerf = await prisma.contentTemplate.findMany({
      orderBy: { usageCount: 'desc' },
      take: 10,
      select: { code: true, name: true, contentType: true, usageCount: true },
    });

    const approvalRate = totalGenerated ? (approved / totalGenerated) * 100 : 0;
    const rejectionRate = totalGenerated ? (rejected / totalGenerated) * 100 : 0;

    return {
      summary: {
        totalGenerated,
        totalApproved: approved,
        totalRejected: rejected,
        totalPublished: published,
        totalUsage: usageCount,
        approvalRate: Math.round(approvalRate * 100) / 100,
        rejectionRate: Math.round(rejectionRate * 100) / 100,
        totalTokens: agg._sum.tokensUsed ?? 0,
        totalCost: Number(agg._sum.estimatedCost ?? 0),
        avgGenerationMs: Math.round(agg._avg.generationMs ?? 0),
        avgTokens: Math.round(agg._avg.tokensUsed ?? 0),
      },
      templatePerformance: templatePerf,
      period: { from, to, preset: query.period },
    };
  },

  async list(_actor: AuthenticatedUser, query: ContentAnalyticsQuery) {
    const items = await contentRepository.analytics.findMany({
      where: query.contentType ? { contentType: query.contentType as never } : {},
      skip: (query.page - 1) * query.limit,
      take: query.limit,
      orderBy: { periodStart: 'desc' },
    });
    const total = await prisma.contentAnalytics.count({
      where: query.contentType ? { contentType: query.contentType as never } : {},
    });
    return { items, meta: { page: query.page, limit: query.limit, total, totalPages: Math.ceil(total / query.limit) || 1 } };
  },
};
