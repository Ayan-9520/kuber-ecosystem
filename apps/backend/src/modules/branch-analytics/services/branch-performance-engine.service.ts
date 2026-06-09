import { branchAnalyticsRepository } from '../repositories/branch-analytics.repository.js';
import type { BranchKpi, BranchPerformanceScores, BranchScope, ResolvedBranchPeriod } from '../types/branch-analytics.types.js';

import { branchMetricEngineService } from './branch-metric-engine.service.js';

function clampScore(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value * 100) / 100));
}

function scoreFromKpis(kpis: BranchKpi[]): BranchPerformanceScores {
  const achievements = kpis
    .filter((k) => k.achievementPct != null)
    .map((k) => k.achievementPct ?? 0);

  const growthKpis = kpis.filter((k) =>
    ['total_leads', 'new_leads', 'conversion_rate', 'hot_leads'].includes(k.code),
  );
  const growthScore = clampScore(
    growthKpis.length
      ? growthKpis.reduce((s, k) => s + (k.achievementPct ?? Math.min(k.value * 2, 100)), 0) / growthKpis.length
      : achievements.length
        ? achievements.reduce((a, b) => a + b, 0) / achievements.length
        : 50,
  );

  const revenueKpis = kpis.filter((k) => ['revenue_generated', 'revenue_achievement_pct'].includes(k.code));
  const revenueScore = clampScore(
    revenueKpis.length
      ? revenueKpis.reduce((s, k) => s + (k.achievementPct ?? k.value), 0) / revenueKpis.length
      : 60,
  );

  const opsKpis = kpis.filter((k) =>
    ['applications_submitted', 'applications_disbursed', 'disbursal_rate', 'application_tat'].includes(k.code),
  );
  const operationsScore = clampScore(
    opsKpis.length
      ? opsKpis.reduce((s, k) => {
          if (k.code === 'application_tat') return s + Math.max(0, 100 - k.value * 3);
          return s + (k.achievementPct ?? Math.min(k.value, 100));
        }, 0) / opsKpis.length
      : 65,
  );

  const complianceKpis = kpis.filter((k) => ['sla_compliance', 'escalations'].includes(k.code));
  const complianceScore = clampScore(
    complianceKpis.length
      ? complianceKpis.reduce((s, k) => {
          if (k.code === 'escalations') return s + Math.max(0, 100 - k.value * 5);
          return s + k.value;
        }, 0) / complianceKpis.length
      : 75,
  );

  const customerKpis = kpis.filter((k) =>
    ['tickets_resolved', 'avg_resolution_time', 'sla_compliance'].includes(k.code),
  );
  const customerScore = clampScore(
    customerKpis.length
      ? customerKpis.reduce((s, k) => {
          if (k.code === 'avg_resolution_time') return s + Math.max(0, 100 - k.value * 4);
          return s + (k.achievementPct ?? k.value);
        }, 0) / customerKpis.length
      : 70,
  );

  const overallScore = clampScore((growthScore + revenueScore + operationsScore + complianceScore + customerScore) / 5);

  return {
    growthScore,
    revenueScore,
    operationsScore,
    complianceScore,
    customerScore,
    overallScore,
    breakdown: {
      kpiCount: kpis.length,
      achievements,
      topMetrics: kpis.slice(0, 8).map((k) => ({ code: k.code, value: k.value, achievementPct: k.achievementPct })),
    },
  };
}

async function collectKpis(
  actor: { id: string; roles: string[] },
  scope: BranchScope,
  period: ResolvedBranchPeriod,
  branchId: string,
): Promise<BranchKpi[]> {
  const [leads, apps, revenue, commission, support] = await Promise.all([
    branchMetricEngineService.computeLeadKpis(scope, period, branchId),
    branchMetricEngineService.computeApplicationKpis(scope, period, branchId),
    branchMetricEngineService.computeRevenueKpis(scope, period, branchId),
    branchMetricEngineService.computeCommissionKpis(scope, period, branchId),
    branchMetricEngineService.computeSupportKpis(actor, scope, period, branchId),
  ]);
  return [...leads, ...apps, ...revenue, ...commission, ...support];
}

export const branchPerformanceEngineService = {
  async compute(
    actor: { id: string; roles: string[] },
    scope: BranchScope,
    period: ResolvedBranchPeriod,
    branchId: string,
  ): Promise<BranchPerformanceScores> {
    const kpis = await collectKpis(actor, scope, period, branchId);
    return scoreFromKpis(kpis);
  },

  async persist(
    actor: { id: string; roles: string[] },
    scope: BranchScope,
    period: ResolvedBranchPeriod,
    branchId: string,
  ): Promise<BranchPerformanceScores> {
    const scores = await this.compute(actor, scope, period, branchId);
    const branch = await branchAnalyticsRepository.getBranch(branchId);
    if (!branch) return scores;

    await branchAnalyticsRepository.upsertPerformance({
      branchId,
      regionId: branch.regionId,
      periodType: period.periodType,
      periodStart: period.fromDate,
      periodEnd: period.toDate,
      growthScore: scores.growthScore,
      revenueScore: scores.revenueScore,
      operationsScore: scores.operationsScore,
      complianceScore: scores.complianceScore,
      customerScore: scores.customerScore,
      overallScore: scores.overallScore,
      breakdown: scores.breakdown as never,
    });

    return scores;
  },
};
