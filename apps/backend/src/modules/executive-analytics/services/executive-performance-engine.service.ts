import { executiveAnalyticsRepository } from '../repositories/executive-analytics.repository.js';
import type { ExecutiveKpi, ExecutivePerformanceScores, ExecutiveRoleType, ResolvedExecutivePeriod } from '../types/executive-analytics.types.js';

import { executiveMetricEngineService } from './executive-metric-engine.service.js';

function clampScore(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value * 100) / 100));
}

function scoreFromKpis(kpis: ExecutiveKpi[]): ExecutivePerformanceScores {
  const achievements = kpis
    .filter((k) => k.achievementPct != null && k.code !== 'target_achievement_pct')
    .map((k) => k.achievementPct ?? 0);

  const performanceScore = achievements.length
    ? clampScore(achievements.reduce((a, b) => a + b, 0) / achievements.length)
    : clampScore(kpis.find((k) => k.code === 'target_achievement_pct')?.value ?? 50);

  const activityKpis = kpis.filter((k) =>
    ['leads_contacted', 'followups_completed', 'applications_reviewed', 'applications_processed', 'daily_activity'].includes(k.code),
  );
  const productivityScore = clampScore(
    activityKpis.length ? activityKpis.reduce((s, k) => s + Math.min(k.value * 5, 100), 0) / activityKpis.length : 60,
  );

  const qualityKpis = kpis.filter((k) =>
    ['conversion_rate', 'approval_accuracy', 'retention_rate', 'customer_satisfaction'].includes(k.code),
  );
  const qualityScore = clampScore(
    qualityKpis.length ? qualityKpis.reduce((s, k) => s + k.value, 0) / qualityKpis.length : 70,
  );

  const complianceKpis = kpis.filter((k) =>
    ['credit_tat', 'operational_tat', 'resolution_time', 'escalations'].includes(k.code),
  );
  const complianceScore = clampScore(
    complianceKpis.length
      ? complianceKpis.reduce((s, k) => {
          if (k.code === 'escalations') return s + Math.max(0, 100 - k.value * 10);
          return s + Math.max(0, 100 - k.value * 2);
        }, 0) / complianceKpis.length
      : 75,
  );

  const overallRating = clampScore((performanceScore + productivityScore + qualityScore + complianceScore) / 4);

  return {
    performanceScore,
    productivityScore,
    qualityScore,
    complianceScore,
    overallRating,
    breakdown: {
      kpiCount: kpis.length,
      achievements,
      topMetrics: kpis.slice(0, 5).map((k) => ({ code: k.code, value: k.value, achievementPct: k.achievementPct })),
    },
  };
}

export const executivePerformanceEngineService = {
  async compute(
    employeeId: string,
    role: ExecutiveRoleType,
    period: ResolvedExecutivePeriod,
  ): Promise<ExecutivePerformanceScores> {
    const kpis = await executiveMetricEngineService.computeKpis(employeeId, role, period);
    return scoreFromKpis(kpis);
  },

  async persist(
    employeeId: string,
    role: ExecutiveRoleType,
    period: ResolvedExecutivePeriod,
  ): Promise<ExecutivePerformanceScores> {
    const scores = await this.compute(employeeId, role, period);
    const employee = await executiveAnalyticsRepository.getEmployee(employeeId);

    await executiveAnalyticsRepository.upsertPerformance({
      employeeId,
      executiveRole: role,
      periodType: period.periodType,
      periodStart: period.fromDate,
      periodEnd: period.toDate,
      performanceScore: scores.performanceScore,
      productivityScore: scores.productivityScore,
      qualityScore: scores.qualityScore,
      complianceScore: scores.complianceScore,
      overallRating: scores.overallRating,
      branchId: employee?.branchId,
      regionId: employee?.branch.regionId,
      breakdown: scores.breakdown as never,
    });

    return scores;
  },
};
