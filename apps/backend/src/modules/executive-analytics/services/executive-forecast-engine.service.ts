import type { AuthenticatedUser } from '@kuberone/shared-types';
import type { ExecutiveForecastQuery } from '@kuberone/shared-validation';

import { prisma } from '../../../config/database.js';
import { executiveAnalyticsRepository } from '../repositories/executive-analytics.repository.js';
import type { ExecutiveRoleType } from '../types/executive-analytics.types.js';
import { scopedExecutiveQuery } from '../utils/executive-date.utils.js';
import { resolveExecutiveScope } from '../utils/executive-scope.utils.js';


import { executiveMetricEngineService } from './executive-metric-engine.service.js';

function linearForecast(current: number, elapsedMs: number, totalMs: number): { predicted: number; confidence: number } {
  if (elapsedMs <= 0 || totalMs <= 0) return { predicted: current, confidence: 50 };
  const pace = current / elapsedMs;
  const predicted = pace * totalMs;
  const progress = elapsedMs / totalMs;
  const confidence = Math.round(Math.min(95, 40 + progress * 55));
  return { predicted: Math.round(predicted * 100) / 100, confidence };
}

export const executiveForecastEngineService = {
  async get(actor: AuthenticatedUser, rawQuery: ExecutiveForecastQuery) {
    const { query, scope } = await resolveExecutiveScope(actor, rawQuery);
    const period = scopedExecutiveQuery(query);
    const employeeId = query.employeeId ?? scope.employeeIds[0];
    if (!employeeId) return { period, forecasts: [], trends: {} };

    const role = (query.executiveRole ?? scope.executiveRole ?? 'SALES_EXECUTIVE') as ExecutiveRoleType;
    const persisted = await executiveAnalyticsRepository.listForecasts({ employeeId, periodType: period.periodType });

    const kpis = await executiveMetricEngineService.computeKpis(employeeId, role, period);
    const elapsed = Date.now() - period.fromDate.getTime();
    const total = period.toDate.getTime() - period.fromDate.getTime();

    const primaryMetrics = ['revenue_generated', 'conversions', 'disbursements', 'applications_submitted'];
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
      const existing = await prisma.executiveForecast.findFirst({
        where: {
          employeeId,
          metricCode: f.metricCode,
          periodType: period.periodType,
          forecastDate: period.toDate,
        },
      });
      const data = {
        executiveRole: role,
        periodType: period.periodType,
        predictedValue: f.predictedValue,
        confidence: f.confidence,
        modelVersion: f.modelVersion,
      };
      if (existing) {
        await prisma.executiveForecast.update({ where: { id: existing.id }, data });
      } else {
        await prisma.executiveForecast.create({
          data: {
            employeeId,
            metricCode: f.metricCode,
            forecastDate: period.toDate,
            ...data,
          },
        });
      }
    }

    return {
      period,
      employeeId,
      executiveRole: role,
      forecasts: persisted.length ? persisted : computed,
      trends: {
        targetAchievement: computed.map((c) => ({ metric: c.metricCode, forecast: c.achievementForecast ?? 0 })),
        revenueContribution: computed.filter((c) => c.metricCode === 'revenue_generated'),
        conversionTrends: computed.filter((c) => c.metricCode === 'conversions'),
      },
    };
  },
};
