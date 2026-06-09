import { prisma } from '../../../config/database.js';
import { env } from '../../../config/env.js';
import { analyticsCacheService } from '../../analytics/services/analytics-cache.service.js';
import { executiveAnalyticsRepository } from '../repositories/executive-analytics.repository.js';

import { executiveAnalyticsOrchestratorService } from './executive-analytics-orchestrator.service.js';
import { executiveLeaderboardEngineService } from './executive-leaderboard-engine.service.js';
import { executiveMetricEngineService } from './executive-metric-engine.service.js';
import { executivePerformanceEngineService } from './executive-performance-engine.service.js';

let intervalHandle: ReturnType<typeof setInterval> | null = null;
let processing = false;

function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function endOfToday(): Date {
  const d = new Date();
  d.setHours(23, 59, 59, 999);
  return d;
}

export const executiveAnalyticsWorkerService = {
  start() {
    if (!env.EXECUTIVE_ANALYTICS_WORKER_ENABLED || intervalHandle) return;
    intervalHandle = setInterval(() => {
      void executiveAnalyticsWorkerService.tick();
    }, env.EXECUTIVE_ANALYTICS_WORKER_INTERVAL_MS);
    console.log(`📈 Executive analytics worker started (every ${env.EXECUTIVE_ANALYTICS_WORKER_INTERVAL_MS}ms)`);
  },

  stop() {
    if (intervalHandle) {
      clearInterval(intervalHandle);
      intervalHandle = null;
    }
  },

  async tick() {
    if (processing) return;
    processing = true;
    try {
      const today = startOfToday();
      const end = endOfToday();
      const employees = await prisma.employee.findMany({
        where: { isActive: true, deletedAt: null },
        select: { id: true, department: true, designation: true },
        take: 50,
      });

      let metricsWritten = 0;
      for (const emp of employees) {
        const role = executiveMetricEngineService.detectRoleFromRoles([]) ??
          (emp.department?.includes('Credit')
            ? 'CREDIT_EXECUTIVE'
            : emp.department?.includes('Ops')
              ? 'OPERATIONS_EXECUTIVE'
              : emp.designation?.includes('Relationship')
                ? 'RELATIONSHIP_MANAGER'
                : 'SALES_EXECUTIVE');

        const period = { fromDate: today, toDate: end, periodType: 'DAILY' as const };
        metricsWritten += await executiveMetricEngineService.persistMetrics(emp.id, role, period);
        await executivePerformanceEngineService.persist(emp.id, role, period);

        const dashboard = await executiveAnalyticsOrchestratorService.dashboard(
          { id: 'system', roles: ['SUPER_ADMIN'], employeeId: emp.id, permissions: ['*'] } as never,
          { timePreset: 'TODAY', employeeId: emp.id, executiveRole: role },
        );
        await executiveAnalyticsRepository.upsertSnapshot({
          employeeId: emp.id,
          executiveRole: role,
          snapshotDate: today,
          periodType: 'DAILY',
          payload: dashboard as never,
        });
      }

      const leaderboardWritten = await executiveLeaderboardEngineService.rebuild('DAILY', today, end);
      analyticsCacheService.invalidate('executive:');

      if (metricsWritten > 0 || leaderboardWritten > 0) {
        console.log(`[executive-analytics-worker] metrics=${metricsWritten} leaderboard=${leaderboardWritten}`);
      }
    } catch (error) {
      console.error('Executive analytics worker error:', error);
    } finally {
      processing = false;
    }
  },
};
