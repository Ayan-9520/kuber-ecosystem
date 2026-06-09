import type { AuthenticatedUser } from '@kuberone/shared-types';
import type { BranchForecastQuery } from '@kuberone/shared-validation';

import { prisma } from '../../../config/database.js';
import type { BranchScope, ResolvedBranchPeriod } from '../types/branch-analytics.types.js';

import { branchMetricEngineService } from './branch-metric-engine.service.js';

function linearForecast(current: number, elapsedMs: number, totalMs: number): { predicted: number; confidence: number } {
  if (elapsedMs <= 0 || totalMs <= 0) return { predicted: current, confidence: 50 };
  const pace = current / elapsedMs;
  const predicted = pace * totalMs;
  const progress = elapsedMs / totalMs;
  const confidence = Math.round(Math.min(95, 40 + progress * 55));
  return { predicted: Math.round(predicted * 100) / 100, confidence };
}

export const branchForecastEngineService = {
  async get(
    _actor: AuthenticatedUser,
    scope: BranchScope,
    period: ResolvedBranchPeriod,
    branchId: string,
    _rawQuery: BranchForecastQuery,
  ) {
    const persisted = await prisma.branchForecast.findMany({
      where: { branchId, periodType: period.periodType },
      orderBy: { forecastDate: 'desc' },
      take: 20,
    });

    const [leadKpis, appKpis, revKpis] = await Promise.all([
      branchMetricEngineService.computeLeadKpis(scope, period, branchId),
      branchMetricEngineService.computeApplicationKpis(scope, period, branchId),
      branchMetricEngineService.computeRevenueKpis(scope, period, branchId),
    ]);
    const kpis = [...leadKpis, ...appKpis, ...revKpis];

    const elapsed = Date.now() - period.fromDate.getTime();
    const total = period.toDate.getTime() - period.fromDate.getTime();
    const primaryMetrics = ['total_leads', 'applications_submitted', 'revenue_generated', 'applications_disbursed'];

    const computed = kpis
      .filter((k) => primaryMetrics.includes(k.code))
      .map((k) => {
        const { predicted, confidence } = linearForecast(k.value, elapsed, total);
        const achievementForecast = k.target ? Math.round((predicted / k.target) * 10000) / 100 : undefined;
        return {
          metricCode: k.code,
          metricName: k.name,
          currentValue: k.value,
          predictedValue: predicted,
          targetValue: k.target,
          achievementForecast,
          confidence,
          modelVersion: 'linear-v1',
        };
      });

    const branch = await prisma.branch.findUnique({
      where: { id: branchId },
      select: { regionId: true },
    });

    for (const f of computed) {
      const existing = await prisma.branchForecast.findFirst({
        where: {
          branchId,
          metricCode: f.metricCode,
          periodType: period.periodType,
          forecastDate: period.toDate,
        },
      });
      const data = {
        regionId: branch?.regionId ?? '',
        periodType: period.periodType,
        predictedValue: f.predictedValue,
        confidence: f.confidence,
        modelVersion: f.modelVersion,
      };
      if (existing) {
        await prisma.branchForecast.update({ where: { id: existing.id }, data });
      } else {
        await prisma.branchForecast.create({
          data: {
            branchId,
            metricCode: f.metricCode,
            forecastDate: period.toDate,
            ...data,
          },
        });
      }
    }

    return {
      period,
      branchId,
      forecasts: persisted.length ? persisted : computed,
      trends: {
        leadForecast: computed.filter((c) => c.metricCode === 'total_leads'),
        applicationForecast: computed.filter((c) => c.metricCode === 'applications_submitted'),
        revenueForecast: computed.filter((c) => c.metricCode === 'revenue_generated'),
        disbursementForecast: computed.filter((c) => c.metricCode === 'applications_disbursed'),
        targetAchievement: computed.map((c) => ({ metric: c.metricCode, forecast: c.achievementForecast ?? 0 })),
      },
    };
  },
};
