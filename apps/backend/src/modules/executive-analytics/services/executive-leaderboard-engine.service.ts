import type { AuthenticatedUser } from '@kuberone/shared-types';
import type { ExecutiveLeaderboardQuery } from '@kuberone/shared-validation';

import { prisma } from '../../../config/database.js';
import { analyticsCacheService } from '../../analytics/services/analytics-cache.service.js';
import { EXECUTIVE_CACHE_TTL_MS } from '../constants/executive-analytics.constants.js';
import { executiveAnalyticsRepository } from '../repositories/executive-analytics.repository.js';
import type { ExecutiveRoleType } from '../types/executive-analytics.types.js';
import { scopedExecutiveQuery } from '../utils/executive-date.utils.js';
import { resolveExecutiveScope } from '../utils/executive-scope.utils.js';


import { executivePerformanceEngineService } from './executive-performance-engine.service.js';

const LEADERBOARD_ROLES: ExecutiveRoleType[] = [
  'SALES_EXECUTIVE',
  'RELATIONSHIP_MANAGER',
  'CREDIT_EXECUTIVE',
  'OPERATIONS_EXECUTIVE',
];

export const executiveLeaderboardEngineService = {
  async get(actor: AuthenticatedUser, rawQuery: ExecutiveLeaderboardQuery) {
    const { query, scope } = await resolveExecutiveScope(actor, rawQuery);
    const period = scopedExecutiveQuery(query);
    const role = (query.executiveRole ?? scope.executiveRole ?? 'SALES_EXECUTIVE') as ExecutiveRoleType;
    const limit = rawQuery.limit ?? 20;

    const cacheKey = `executive:leaderboard:${role}:${period.periodType}:${period.fromDate.toISOString()}:${scope.branchId ?? ''}:${scope.regionId ?? ''}`;
    const cached = analyticsCacheService.get<unknown>(cacheKey);
    if (cached) return cached;

    const persisted = await executiveAnalyticsRepository.listLeaderboard({
      executiveRole: role,
      periodType: period.periodType,
      periodStart: period.fromDate,
      branchId: scope.branchId,
      regionId: scope.regionId,
      limit,
    });

    if (persisted.length) {
      const result = { period, executiveRole: role, entries: persisted };
      analyticsCacheService.set(cacheKey, result, EXECUTIVE_CACHE_TTL_MS);
      return result;
    }

    const employees = await prisma.employee.findMany({
      where: {
        isActive: true,
        deletedAt: null,
        ...(scope.branchId ? { branchId: scope.branchId } : {}),
        ...(scope.regionId ? { branch: { regionId: scope.regionId } } : {}),
        ...(scope.employeeIds.length && !scope.canViewTeam ? { id: { in: scope.employeeIds } } : {}),
      },
      select: { id: true, firstName: true, lastName: true, employeeCode: true, designation: true },
      take: 50,
    });

    const scored = await Promise.all(
      employees.map(async (emp) => {
        const scores = await executivePerformanceEngineService.compute(emp.id, role, period);
        return { employee: emp, score: scores.overallRating, metrics: scores };
      }),
    );

    scored.sort((a, b) => b.score - a.score);
    const entries = scored.slice(0, limit).map((entry, idx) => ({
      rank: idx + 1,
      score: entry.score,
      employeeId: entry.employee.id,
      employee: entry.employee,
      metrics: entry.metrics,
    }));

    const result = { period, executiveRole: role, entries };
    analyticsCacheService.set(cacheKey, result, EXECUTIVE_CACHE_TTL_MS);
    return result;
  },

  async rebuild(periodType: 'DAILY' | 'WEEKLY' | 'MONTHLY', periodStart: Date, periodEnd: Date): Promise<number> {
    const employees = await prisma.employee.findMany({
      where: { isActive: true, deletedAt: null },
      select: { id: true, department: true, designation: true, branchId: true, branch: { select: { regionId: true } } },
      take: 100,
    });

    let written = 0;
    for (const role of LEADERBOARD_ROLES) {
      const scored: Array<{ employeeId: string; score: number; branchId: string; regionId: string; metrics: unknown }> = [];

      for (const emp of employees) {
        const scores = await executivePerformanceEngineService.compute(emp.id, role, {
          fromDate: periodStart,
          toDate: periodEnd,
          periodType,
        });
        scored.push({
          employeeId: emp.id,
          score: scores.overallRating,
          branchId: emp.branchId,
          regionId: emp.branch.regionId,
          metrics: scores,
        });
      }

      scored.sort((a, b) => b.score - a.score);
      for (let i = 0; i < scored.length; i++) {
        const entry = scored[i]!;
        await executiveAnalyticsRepository.upsertLeaderboardEntry({
          executiveRole: role,
          periodType,
          periodStart,
          periodEnd,
          employeeId: entry.employeeId,
          rank: i + 1,
          score: entry.score,
          metrics: entry.metrics as never,
          branchId: entry.branchId,
          regionId: entry.regionId,
        });
        written++;
      }
    }
    return written;
  },
};
