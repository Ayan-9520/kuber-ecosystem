import type { RegionalForecastQuery } from '@kuberone/shared-validation';

import { prisma } from '../../../config/database.js';
import type { RegionalScope, ResolvedRegionalPeriod } from '../types/regional-analytics.types.js';

import { regionalMetricEngineService } from './regional-metric-engine.service.js';

function linearForecast(current: number, elapsedMs: number, totalMs: number): { predicted: number; confidence: number } {
  if (elapsedMs <= 0 || totalMs <= 0) return { predicted: current, confidence: 50 };
  const pace = current / elapsedMs;
  const predicted = pace * totalMs;
  const progress = elapsedMs / totalMs;
  const confidence = Math.round(Math.min(95, 40 + progress * 55));
  return { predicted: Math.round(predicted * 100) / 100, confidence };
}

export const regionalForecastEngineService = {
  async get(scope: RegionalScope, period: ResolvedRegionalPeriod, regionId: string, _rawQuery: RegionalForecastQuery) {
    const persisted = await prisma.regionalForecast.findMany({
      where: { regionId, periodType: period.periodType },
      orderBy: { forecastDate: 'desc' },
      take: 20,
    });

    const [overview, leadKpis, appKpis, revKpis] = await Promise.all([
      regionalMetricEngineService.computeOverviewKpis(scope, period, regionId),
      regionalMetricEngineService.computeLeadKpis(scope, period, regionId),
      regionalMetricEngineService.computeApplicationKpis(scope, period, regionId),
      regionalMetricEngineService.computeRevenueKpis(scope, period, regionId),
    ]);
    const kpis = [...overview, ...leadKpis, ...appKpis, ...revKpis];

    const elapsed = Date.now() - period.fromDate.getTime();
    const total = period.toDate.getTime() - period.fromDate.getTime();
    const primaryMetrics = ['total_leads', 'regional_leads', 'applications_submitted', 'revenue_generated', 'applications_disbursed', 'regional_growth_rate'];

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

    for (const f of computed) {
      const existing = await prisma.regionalForecast.findFirst({
        where: { regionId, metricCode: f.metricCode, periodType: period.periodType, forecastDate: period.toDate },
      });
      const data = {
        periodType: period.periodType,
        predictedValue: f.predictedValue,
        confidence: f.confidence,
        modelVersion: f.modelVersion,
      };
      if (existing) {
        await prisma.regionalForecast.update({ where: { id: existing.id }, data });
      } else {
        await prisma.regionalForecast.create({
          data: { regionId, metricCode: f.metricCode, forecastDate: period.toDate, ...data },
        });
      }
    }

    return {
      period,
      regionId,
      forecasts: persisted.length ? persisted : computed,
      trends: {
        leadForecast: computed.filter((c) => c.metricCode === 'total_leads' || c.metricCode === 'regional_leads'),
        applicationForecast: computed.filter((c) => c.metricCode === 'applications_submitted'),
        revenueForecast: computed.filter((c) => c.metricCode === 'revenue_generated'),
        disbursementForecast: computed.filter((c) => c.metricCode === 'applications_disbursed'),
        growthForecast: computed.filter((c) => c.metricCode === 'regional_growth_rate'),
        targetAchievement: computed.map((c) => ({ metric: c.metricCode, forecast: c.achievementForecast ?? 0 })),
      },
    };
  },
};
