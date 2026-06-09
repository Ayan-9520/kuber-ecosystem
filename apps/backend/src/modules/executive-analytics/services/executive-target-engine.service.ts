import type { AuthenticatedUser } from '@kuberone/shared-types';
import type { CreateExecutiveTarget, ExecutiveTargetsQuery } from '@kuberone/shared-validation';

import { executiveAnalyticsRepository } from '../repositories/executive-analytics.repository.js';
import type { ExecutiveRoleType } from '../types/executive-analytics.types.js';
import { scopedExecutiveQuery } from '../utils/executive-date.utils.js';
import { resolveExecutiveScope } from '../utils/executive-scope.utils.js';

import { executiveMetricEngineService } from './executive-metric-engine.service.js';

export const executiveTargetEngineService = {
  async list(actor: AuthenticatedUser, rawQuery: ExecutiveTargetsQuery & { page?: number; limit?: number }) {
    const { scope } = await resolveExecutiveScope(actor, rawQuery);
    const period = scopedExecutiveQuery(rawQuery);
    const page = rawQuery.page ?? 1;
    const limit = rawQuery.limit ?? 20;

    const [items, total] = await executiveAnalyticsRepository.listTargets({
      employeeIds: scope.employeeIds.length ? scope.employeeIds : undefined,
      executiveRole: scope.executiveRole,
      periodType: period.periodType,
      isActive: rawQuery.isActive,
      page,
      limit,
    });

    const tracking = await Promise.all(
      items.map(async (target) => {
        const kpis = await executiveMetricEngineService.computeKpis(
          target.employeeId,
          target.executiveRole,
          period,
        );
        const actual = kpis.find((k) => k.code === target.metricCode);
        const achievementPct =
          actual && Number(target.targetValue) > 0
            ? Math.round((actual.value / Number(target.targetValue)) * 10000) / 100
            : 0;
        return {
          ...target,
          actualValue: actual?.value ?? 0,
          achievementPct,
          onTrack: achievementPct >= 80,
        };
      }),
    );

    return { period, items: tracking, total, page, limit };
  },

  async create(actor: AuthenticatedUser, data: CreateExecutiveTarget) {
    return executiveAnalyticsRepository.createTarget({
      employee: { connect: { id: data.employeeId } },
      executiveRole: data.executiveRole as ExecutiveRoleType,
      metricCode: data.metricCode,
      metricName: data.metricName,
      targetValue: data.targetValue,
      periodType: data.periodType,
      periodStart: data.periodStart,
      periodEnd: data.periodEnd,
      branchId: data.branchId,
      regionId: data.regionId,
      productId: data.productId,
      assignedBy: actor.id ? { connect: { id: actor.id } } : undefined,
      isActive: true,
    });
  },
};
