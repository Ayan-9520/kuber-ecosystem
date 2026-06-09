import type { z } from 'zod';

import { ragRepository } from '../repositories/rag.repository.js';
import type { RagAnalyticsSummary } from '../types/rag.types.js';
import type { analyticsQuerySchema } from '../validators/rag.validator.js';

type AnalyticsQuery = z.infer<typeof analyticsQuerySchema>;

export const ragAnalyticsService = {
  async getAnalytics(_query: AnalyticsQuery): Promise<RagAnalyticsSummary> {
    const [
      totalQueries,
      totalRetrievals,
      avgLatency,
      avgRating,
      bySource,
      topDocs,
    ] = await Promise.all([
      ragRepository.countQueries(),
      ragRepository.countRetrievals(),
      ragRepository.avgQueryLatency(),
      ragRepository.avgFeedbackRating(),
      ragRepository.queriesBySource(),
      ragRepository.topRetrievedDocuments(10),
    ]);

    const queriesBySource: Record<string, number> = {};
    for (const row of bySource) queriesBySource[row.source] = row._count.id;

    const categoryCounts: Record<string, number> = {};
    for (const doc of topDocs) {
      const code = doc.categoryCode ?? 'UNKNOWN';
      categoryCounts[code] = (categoryCounts[code] ?? 0) + 1;
    }

    return {
      totalQueries,
      totalRetrievals,
      avgLatencyMs: Math.round(avgLatency._avg.latencyMs ?? 0),
      avgFeedbackRating: Math.round((avgRating._avg.rating ?? 0) * 10) / 10,
      retrievalAccuracy: totalQueries > 0 ? Math.round((totalRetrievals / totalQueries) * 85) : 0,
      searchEffectiveness: totalQueries > 0 ? Math.min(95, Math.round((avgRating._avg.rating ?? 3) * 20)) : 0,
      topDocuments: topDocs.map((d: (typeof topDocs)[number]) => ({
        id: d.id,
        title: d.title,
        retrievalCount: d.chunkCount,
      })),
      topCategories: Object.entries(categoryCounts).map(([code, count]) => ({ code, count })),
      queriesBySource,
    };
  },
};
