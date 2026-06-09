import type { AuthenticatedUser } from '@kuberone/shared-types';
import type { CreateRegionalTarget, RegionalTargetsQuery } from '@kuberone/shared-validation';

import { regionalAnalyticsRepository } from '../repositories/regional-analytics.repository.js';
import { scopedRegionalQuery } from '../utils/regional-date.utils.js';
import { resolveRegionalScope } from '../utils/regional-scope.utils.js';

import { regionalMetricEngineService } from './regional-metric-engine.service.js';

export const regionalTargetEngineService = {
  async list(actor: AuthenticatedUser, rawQuery: RegionalTargetsQuery & { page?: number; limit?: number }) {
    const { scope } = await resolveRegionalScope(actor, rawQuery);
    const period = scopedRegionalQuery(rawQuery);
    const page = rawQuery.page ?? 1;
    const limit = rawQuery.limit ?? 20;

    const [items, total] = await regionalAnalyticsRepository.listTargets({
      regionIds: scope.regionId ? [scope.regionId] : undefined,
      periodType: period.periodType,
      isActive: rawQuery.isActive,
      page,
      limit,
    });

    const tracking = await Promise.all(
      items.map(async (target) => {
        const regionScope = { ...scope, regionId: target.regionId };
        const overview = await regionalMetricEngineService.computeOverviewKpis(regionScope, period, target.regionId);
        const leadKpis = await regionalMetricEngineService.computeLeadKpis(regionScope, period, target.regionId);
        const revKpis = await regionalMetricEngineService.computeRevenueKpis(regionScope, period, target.regionId);
        const all = [...overview, ...leadKpis, ...revKpis];
        const actual = all.find((k) => k.code === target.metricCode);
        const actualValue = actual?.value ?? 0;
        const achievementPct =
          Number(target.targetValue) > 0
            ? Math.round((actualValue / Number(target.targetValue)) * 10000) / 100
            : 0;
        return { ...target, actualValue, achievementPct, onTrack: achievementPct >= 80 };
      }),
    );

    return { period, items: tracking, total, page, limit };
  },

  async create(actor: AuthenticatedUser, data: CreateRegionalTarget) {
    return regionalAnalyticsRepository.createTarget({
      region: { connect: { id: data.regionId } },
      metricCode: data.metricCode,
      metricName: data.metricName,
      category: data.category,
      targetValue: data.targetValue,
      periodType: data.periodType,
      periodStart: data.periodStart,
      periodEnd: data.periodEnd,
      productId: data.productId,
      assignedBy: actor.id ? { connect: { id: actor.id } } : undefined,
      isActive: true,
    });
  },
};
