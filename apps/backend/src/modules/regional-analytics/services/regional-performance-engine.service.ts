import { regionalAnalyticsRepository } from '../repositories/regional-analytics.repository.js';
import type { RegionalKpi, RegionalPerformanceScores, RegionalScope, ResolvedRegionalPeriod } from '../types/regional-analytics.types.js';

import { regionalMetricEngineService } from './regional-metric-engine.service.js';

function clampScore(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value * 100) / 100));
}

function scoreFromKpis(kpis: RegionalKpi[], aiAdoption: number): RegionalPerformanceScores {
  const achievements = kpis.filter((k) => k.achievementPct != null).map((k) => k.achievementPct ?? 0);

  const revenueKpis = kpis.filter((k) => ['revenue_generated', 'total_revenue', 'revenue_achievement_pct'].includes(k.code));
  const revenueScore = clampScore(
    revenueKpis.length
      ? revenueKpis.reduce((s, k) => s + (k.achievementPct ?? k.value), 0) / revenueKpis.length
      : achievements.length
        ? achievements.reduce((a, b) => a + b, 0) / achievements.length
        : 60,
  );

  const growthKpis = kpis.filter((k) =>
    ['regional_growth_rate', 'total_leads', 'regional_leads', 'conversion_rate'].includes(k.code),
  );
  const growthScore = clampScore(
    growthKpis.length
      ? growthKpis.reduce((s, k) => s + (k.achievementPct ?? Math.min(k.value, 100)), 0) / growthKpis.length
      : 55,
  );

  const opsKpis = kpis.filter((k) =>
    ['applications_submitted', 'applications_disbursed', 'disbursement_rate', 'regional_tat'].includes(k.code),
  );
  const operationsScore = clampScore(
    opsKpis.length
      ? opsKpis.reduce((s, k) => {
          if (k.code === 'regional_tat') return s + Math.max(0, 100 - k.value * 3);
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

  const customerKpis = kpis.filter((k) => ['tickets_resolved', 'avg_resolution_time', 'sla_compliance'].includes(k.code));
  const customerScore = clampScore(
    customerKpis.length
      ? customerKpis.reduce((s, k) => {
          if (k.code === 'avg_resolution_time') return s + Math.max(0, 100 - k.value * 4);
          return s + (k.achievementPct ?? k.value);
        }, 0) / customerKpis.length
      : 70,
  );

  const aiAdoptionScore = clampScore(aiAdoption);

  const overallScore = clampScore(
    (revenueScore + growthScore + operationsScore + complianceScore + customerScore + aiAdoptionScore) / 6,
  );

  return {
    revenueScore,
    growthScore,
    operationsScore,
    complianceScore,
    customerScore,
    aiAdoptionScore,
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
  scope: RegionalScope,
  period: ResolvedRegionalPeriod,
  regionId: string,
): Promise<RegionalKpi[]> {
  const [overview, leads, apps, revenue, commission, support] = await Promise.all([
    regionalMetricEngineService.computeOverviewKpis(scope, period, regionId),
    regionalMetricEngineService.computeLeadKpis(scope, period, regionId),
    regionalMetricEngineService.computeApplicationKpis(scope, period, regionId),
    regionalMetricEngineService.computeRevenueKpis(scope, period, regionId),
    regionalMetricEngineService.computeCommissionKpis(scope, period),
    regionalMetricEngineService.computeSupportKpis(actor, scope, period),
  ]);
  return [...overview, ...leads, ...apps, ...revenue, ...commission, ...support];
}

export const regionalPerformanceEngineService = {
  async compute(
    actor: { id: string; roles: string[] },
    scope: RegionalScope,
    period: ResolvedRegionalPeriod,
    regionId: string,
    aiAdoption = 0,
  ): Promise<RegionalPerformanceScores> {
    const kpis = await collectKpis(actor, scope, period, regionId);
    return scoreFromKpis(kpis, aiAdoption);
  },

  async persist(
    actor: { id: string; roles: string[] },
    scope: RegionalScope,
    period: ResolvedRegionalPeriod,
    regionId: string,
    aiAdoption = 0,
  ): Promise<RegionalPerformanceScores> {
    const scores = await this.compute(actor, scope, period, regionId, aiAdoption);
    await regionalAnalyticsRepository.upsertPerformance({
      regionId,
      periodType: period.periodType,
      periodStart: period.fromDate,
      periodEnd: period.toDate,
      revenueScore: scores.revenueScore,
      growthScore: scores.growthScore,
      operationsScore: scores.operationsScore,
      complianceScore: scores.complianceScore,
      customerScore: scores.customerScore,
      aiAdoptionScore: scores.aiAdoptionScore,
      overallScore: scores.overallScore,
      breakdown: scores.breakdown as never,
    });
    return scores;
  },
};
