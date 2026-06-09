import type { AuthenticatedUser } from '@kuberone/shared-types';
import type {
  AnalyticsAiQuery,
  AnalyticsApplicationsQuery,
  AnalyticsCommissionsQuery,
  AnalyticsExportQuery,
  AnalyticsKpisQuery,
  AnalyticsLeadsQuery,
  AnalyticsOverviewQuery,
  AnalyticsRevenueQuery,
} from '@kuberone/shared-validation';

import { losAnalyticsService } from '../../applications/services/los-analytics.service.js';
import { commissionAnalyticsService } from '../../commissions/services/commission-analytics.service.js';
import { leadAnalyticsService } from '../../leads/services/lead-analytics.service.js';
import { scopedQuery } from '../utils/analytics-date.utils.js';
import { applyAnalyticsScope } from '../utils/analytics-scope.utils.js';

import { aggregationEngineService } from './aggregation-engine.service.js';
import { chartEngineService } from './chart-engine.service.js';
import { exportEngineService } from './export-engine.service.js';
import { metricEngineService } from './metric-engine.service.js';


export const analyticsOrchestratorService = {
  overview: (actor: AuthenticatedUser, query: AnalyticsOverviewQuery) =>
    aggregationEngineService.getOverview(actor, query),

  kpis: async (actor: AuthenticatedUser, query: AnalyticsKpisQuery) => {
    const scoped = scopedQuery(applyAnalyticsScope(actor, query));
    const all = await metricEngineService.computeKpis(actor, scoped);
    if (!query.categories?.length) return { period: scoped, kpis: all };
    const categories = new Set(query.categories.map((c) => c.toUpperCase()));
    return {
      period: scoped,
      kpis: all.filter((k) => categories.has(k.code.split('_')[0]?.toUpperCase() ?? '') || categories.has(k.code)),
    };
  },

  revenue: (actor: AuthenticatedUser, query: AnalyticsRevenueQuery) =>
    chartEngineService.revenueTrend(actor, query),

  leads: async (actor: AuthenticatedUser, query: AnalyticsLeadsQuery) => {
    const scoped = scopedQuery(applyAnalyticsScope(actor, query));
    const [summary, funnel] = await Promise.all([
      leadAnalyticsService.getSummary(scoped as never),
      chartEngineService.leadFunnel(actor, query),
    ]);
    return { period: scoped, summary, charts: funnel };
  },

  applications: async (actor: AuthenticatedUser, query: AnalyticsApplicationsQuery) => {
    const scoped = scopedQuery(applyAnalyticsScope(actor, query));
    const summary = await losAnalyticsService.getSummary(scoped as never);
    return { period: scoped, summary };
  },

  commissions: async (actor: AuthenticatedUser, query: AnalyticsCommissionsQuery) => {
    const scoped = scopedQuery(applyAnalyticsScope(actor, query));
    const summary = await commissionAnalyticsService.getSummary({
      ...scoped,
      groupBy: query.groupBy,
    } as never);
    return { period: scoped, summary };
  },

  ai: async (actor: AuthenticatedUser, query: AnalyticsAiQuery) => {
    const scoped = scopedQuery(applyAnalyticsScope(actor, query));
    const summary = await aggregationEngineService.getAiSummary(scoped);
    return { period: scoped, summary };
  },

  export: (actor: AuthenticatedUser, query: AnalyticsExportQuery) =>
    exportEngineService.buildExport(actor, query),
};
