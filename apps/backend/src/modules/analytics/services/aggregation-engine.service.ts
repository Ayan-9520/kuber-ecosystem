import type { AuthenticatedUser } from '@kuberone/shared-types';
import type { AnalyticsBaseQuery } from '@kuberone/shared-validation';

import { prisma } from '../../../config/database.js';
import { losAnalyticsService } from '../../applications/services/los-analytics.service.js';
import { commissionAnalyticsService } from '../../commissions/services/commission-analytics.service.js';
import { leadAnalyticsService } from '../../leads/services/lead-analytics.service.js';
import { ticketAnalyticsService } from '../../support/services/ticket-analytics.service.js';
import { CACHE_TTL_MS } from '../constants/analytics.constants.js';
import type { AnalyticsOverview } from '../types/analytics.types.js';
import { scopedQuery } from '../utils/analytics-date.utils.js';
import { resolveDateRange } from '../utils/analytics-date.utils.js';
import { applyAnalyticsScope } from '../utils/analytics-scope.utils.js';

import { analyticsCacheService } from './analytics-cache.service.js';
import { metricEngineService } from './metric-engine.service.js';


function cacheKey(prefix: string, query: AnalyticsBaseQuery): string {
  return `${prefix}:${JSON.stringify(query)}`;
}

export const aggregationEngineService = {
  async getOverview(actor: AuthenticatedUser, rawQuery: AnalyticsBaseQuery): Promise<AnalyticsOverview> {
    const query = scopedQuery(applyAnalyticsScope(actor, rawQuery));
    const key = cacheKey('overview', query);
    const cached = analyticsCacheService.get<AnalyticsOverview>(key);
    if (cached) return cached;

    const domainQuery = {
      branchId: query.branchId,
      regionId: query.regionId,
      fromDate: query.fromDate,
      toDate: query.toDate,
      ...(query.employeeId ? { assignedToId: query.employeeId, assignedSalesId: query.employeeId } : {}),
    };

    const [scorecards, leads, applications, commissions, support, ai, notifications] = await Promise.all([
      metricEngineService.computeKpis(actor, query),
      leadAnalyticsService.getSummary(domainQuery as never),
      losAnalyticsService.getSummary(domainQuery as never),
      commissionAnalyticsService.getSummary({ ...domainQuery, groupBy: undefined } as never),
      ticketAnalyticsService.getSummary(actor, domainQuery as never),
      aggregationEngineService.getAiSummary(query),
      aggregationEngineService.getNotificationSummary(query),
    ]);

    const result: AnalyticsOverview = {
      period: resolveDateRange(query),
      scorecards,
      leads: leads as unknown as Record<string, unknown>,
      applications: applications as unknown as Record<string, unknown>,
      commissions: commissions as unknown as Record<string, unknown>,
      support: support as unknown as Record<string, unknown>,
      ai,
      notifications,
    };

    analyticsCacheService.set(key, result, CACHE_TTL_MS);
    return result;
  },

  async getAiSummary(query: AnalyticsBaseQuery & { fromDate: Date; toDate: Date }) {
    const [total, voice, byModule, failures] = await Promise.all([
      prisma.aiUsageLog.count({ where: { createdAt: { gte: query.fromDate, lte: query.toDate } } }),
      prisma.aiUsageLog.count({ where: { createdAt: { gte: query.fromDate, lte: query.toDate }, module: 'VOICE_AI' } }),
      prisma.aiUsageLog.groupBy({
        by: ['module'],
        where: { createdAt: { gte: query.fromDate, lte: query.toDate } },
        _count: true,
      }),
      prisma.aiUsageLog.count({ where: { createdAt: { gte: query.fromDate, lte: query.toDate }, success: false } }),
    ]);
    return {
      totalRequests: total,
      voiceAiRequests: voice,
      advisorRequests: byModule.find((m) => m.module === 'AI_ADVISOR')?._count ?? 0,
      copilotRequests: byModule.find((m) => m.module === 'COPILOT')?._count ?? 0,
      ragRequests: byModule.find((m) => m.module === 'RAG')?._count ?? 0,
      failureCount: failures,
      byModule: byModule.map((m) => ({ module: m.module, count: m._count })),
    };
  },

  async getNotificationSummary(query: AnalyticsBaseQuery & { fromDate: Date; toDate: Date }) {
    const dateFilter = { createdAt: { gte: query.fromDate, lte: query.toDate } };
    const [total, email, sms, push, failed] = await Promise.all([
      prisma.notification.count({ where: dateFilter }),
      prisma.emailDelivery.count({ where: dateFilter }),
      prisma.smsDelivery.count({ where: dateFilter }),
      prisma.pushNotificationDelivery.count({ where: dateFilter }),
      prisma.notification.count({ where: { ...dateFilter, status: 'FAILED' } }),
    ]);
    return { total, email, sms, push, failed };
  },
};
