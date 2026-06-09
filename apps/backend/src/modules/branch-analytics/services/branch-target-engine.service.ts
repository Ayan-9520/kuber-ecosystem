import type { AuthenticatedUser } from '@kuberone/shared-types';
import type { BranchTargetsQuery, CreateBranchTarget } from '@kuberone/shared-validation';

import { branchAnalyticsRepository } from '../repositories/branch-analytics.repository.js';
import { scopedBranchQuery } from '../utils/branch-date.utils.js';
import { resolveBranchScope } from '../utils/branch-scope.utils.js';

import { branchMetricEngineService } from './branch-metric-engine.service.js';

export const branchTargetEngineService = {
  async list(actor: AuthenticatedUser, rawQuery: BranchTargetsQuery & { page?: number; limit?: number }) {
    const { scope } = await resolveBranchScope(actor, rawQuery);
    const period = scopedBranchQuery(rawQuery);
    const page = rawQuery.page ?? 1;
    const limit = rawQuery.limit ?? 20;

    const [items, total] = await branchAnalyticsRepository.listTargets({
      branchIds: scope.branchIds.length ? scope.branchIds : undefined,
      periodType: period.periodType,
      isActive: rawQuery.isActive,
      page,
      limit,
    });

    const tracking = await Promise.all(
      items.map(async (target) => {
        const branchScope = { ...scope, branchIds: [target.branchId] };
        let actualValue = 0;
        const leadKpis = await branchMetricEngineService.computeLeadKpis(branchScope, period, target.branchId);
        const appKpis = await branchMetricEngineService.computeApplicationKpis(branchScope, period, target.branchId);
        const revKpis = await branchMetricEngineService.computeRevenueKpis(branchScope, period, target.branchId);
        const all = [...leadKpis, ...appKpis, ...revKpis];
        const actual = all.find((k) => k.code === target.metricCode);
        actualValue = actual?.value ?? 0;
        const achievementPct =
          Number(target.targetValue) > 0
            ? Math.round((actualValue / Number(target.targetValue)) * 10000) / 100
            : 0;
        return {
          ...target,
          actualValue,
          achievementPct,
          onTrack: achievementPct >= 80,
        };
      }),
    );

    return { period, items: tracking, total, page, limit };
  },

  async create(actor: AuthenticatedUser, data: CreateBranchTarget) {
    const branch = await branchAnalyticsRepository.getBranch(data.branchId);
    return branchAnalyticsRepository.createTarget({
      branch: { connect: { id: data.branchId } },
      regionId: branch?.regionId ?? '',
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
