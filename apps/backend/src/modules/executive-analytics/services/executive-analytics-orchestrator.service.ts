import type { AuthenticatedUser } from '@kuberone/shared-types';
import type {
  CreateExecutiveTarget,
  ExecutiveDashboardQuery,
  ExecutiveExportQuery,
  ExecutiveForecastQuery,
  ExecutiveLeaderboardQuery,
  ExecutivePerformanceQuery,
  ExecutiveTargetsQuery,
} from '@kuberone/shared-validation';

import { prisma } from '../../../config/database.js';
import { aggregationEngineService } from '../../analytics/services/aggregation-engine.service.js';
import { analyticsCacheService } from '../../analytics/services/analytics-cache.service.js';
import { EXECUTIVE_CACHE_TTL_MS } from '../constants/executive-analytics.constants.js';
import { executiveAnalyticsRepository } from '../repositories/executive-analytics.repository.js';
import type { ExecutiveRoleType } from '../types/executive-analytics.types.js';
import { scopedExecutiveQuery } from '../utils/executive-date.utils.js';
import { resolveExecutiveScope } from '../utils/executive-scope.utils.js';

import { executiveExportEngineService } from './executive-export-engine.service.js';
import { executiveForecastEngineService } from './executive-forecast-engine.service.js';
import { executiveLeaderboardEngineService } from './executive-leaderboard-engine.service.js';
import { executiveMetricEngineService } from './executive-metric-engine.service.js';
import { executivePerformanceEngineService } from './executive-performance-engine.service.js';
import { executiveTargetEngineService } from './executive-target-engine.service.js';

async function resolveEmployee(actor: AuthenticatedUser, employeeId?: string) {
  const id = employeeId ?? actor.employeeId;
  if (!id) return undefined;
  return executiveAnalyticsRepository.getEmployee(id);
}

export const executiveAnalyticsOrchestratorService = {
  async dashboard(actor: AuthenticatedUser, rawQuery: ExecutiveDashboardQuery) {
    const { query, scope } = await resolveExecutiveScope(actor, rawQuery);
    const period = scopedExecutiveQuery(query);
    const employeeId = query.employeeId ?? scope.employeeIds[0] ?? actor.employeeId;
    if (!employeeId) return { period, kpis: [], productivity: {}, trends: {}, ai: {} };

    const role = (query.executiveRole ?? scope.executiveRole ?? 'SALES_EXECUTIVE') as ExecutiveRoleType;
    const cacheKey = `executive:dashboard:${employeeId}:${role}:${period.periodType}:${period.fromDate.toISOString()}`;
    const cached = analyticsCacheService.get<unknown>(cacheKey);
    if (cached) return cached;

    const employee = await resolveEmployee(actor, employeeId);
    const [kpis, productivity, conversionTrend, productivityTrend, qualityTrend, aiSummary] = await Promise.all([
      executiveMetricEngineService.computeKpis(employeeId, role, period),
      executiveMetricEngineService.computeProductivity(employeeId, employee?.userId, period),
      executiveMetricEngineService.getTrendPoints(employeeId, 'conversion_rate', period),
      executiveMetricEngineService.getTrendPoints(employeeId, 'leads_contacted', period),
      executiveMetricEngineService.getTrendPoints(employeeId, 'approval_accuracy', period),
      aggregationEngineService.getAiSummary({
        fromDate: period.fromDate,
        toDate: period.toDate,
        employeeId,
      }),
    ]);

    const aiUsage = employee?.userId
      ? await prisma.aiUsageLog.count({
          where: { userId: employee.userId, createdAt: { gte: period.fromDate, lte: period.toDate } },
        })
      : 0;
    const voiceAi = employee?.userId
      ? await prisma.aiUsageLog.count({
          where: { userId: employee.userId, module: 'VOICE_AI', createdAt: { gte: period.fromDate, lte: period.toDate } },
        })
      : 0;
    const copilot = employee?.userId
      ? await prisma.aiUsageLog.count({
          where: { userId: employee.userId, module: 'COPILOT', createdAt: { gte: period.fromDate, lte: period.toDate } },
        })
      : 0;
    const recommendations = await prisma.recommendation.count({
      where: { createdAt: { gte: period.fromDate, lte: period.toDate } },
    });

    const result = {
      period,
      executiveRole: role,
      employee: employee
        ? { id: employee.id, name: `${employee.firstName} ${employee.lastName}`, designation: employee.designation }
        : { id: employeeId, name: 'Executive' },
      kpis,
      productivity,
      trends: {
        conversion: conversionTrend,
        productivity: productivityTrend,
        quality: qualityTrend,
        aiAdoption: [{ date: period.toDate.toISOString().slice(0, 10), value: aiUsage }],
      },
      ai: {
        ...aiSummary,
        aiUsage,
        voiceAiUsage: voiceAi,
        copilotUsage: copilot,
        recommendationAdoption: recommendations,
        aiEffectiveness: aiUsage > 0 ? Math.round((1 - (aiSummary.failureCount ?? 0) / aiUsage) * 100) : 100,
      },
      scope: { canViewTeam: scope.canViewTeam, employeeIds: scope.employeeIds },
    };

    analyticsCacheService.set(cacheKey, result, EXECUTIVE_CACHE_TTL_MS);
    return result;
  },

  async performance(actor: AuthenticatedUser, rawQuery: ExecutivePerformanceQuery) {
    const { query, scope } = await resolveExecutiveScope(actor, rawQuery);
    const period = scopedExecutiveQuery(query);
    const employeeId = query.employeeId ?? scope.employeeIds[0] ?? actor.employeeId;
    if (!employeeId) return { period, scores: null };

    const role = (query.executiveRole ?? scope.executiveRole ?? 'SALES_EXECUTIVE') as ExecutiveRoleType;
    const scores = await executivePerformanceEngineService.compute(employeeId, role, period);
    const kpis = await executiveMetricEngineService.computeKpis(employeeId, role, period);

    return {
      period,
      employeeId,
      executiveRole: role,
      scores,
      kpis,
      trends: {
        productivity: await executiveMetricEngineService.getTrendPoints(employeeId, 'leads_contacted', period),
        quality: await executiveMetricEngineService.getTrendPoints(employeeId, 'conversion_rate', period),
      },
    };
  },

  targets: (actor: AuthenticatedUser, query: ExecutiveTargetsQuery & { page?: number; limit?: number }) =>
    executiveTargetEngineService.list(actor, query),

  createTarget: (actor: AuthenticatedUser, data: CreateExecutiveTarget) =>
    executiveTargetEngineService.create(actor, data),

  leaderboard: (actor: AuthenticatedUser, query: ExecutiveLeaderboardQuery) =>
    executiveLeaderboardEngineService.get(actor, query),

  forecast: (actor: AuthenticatedUser, query: ExecutiveForecastQuery) =>
    executiveForecastEngineService.get(actor, query),

  export: (actor: AuthenticatedUser, query: ExecutiveExportQuery) =>
    executiveExportEngineService.buildExport(actor, query),
};
