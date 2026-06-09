import { prisma } from '../../../config/database.js';
import { env } from '../../../config/env.js';
import { analyticsCacheService } from '../../analytics/services/analytics-cache.service.js';
import { branchAnalyticsRepository } from '../repositories/branch-analytics.repository.js';

import { branchAnalyticsOrchestratorService } from './branch-analytics-orchestrator.service.js';
import { branchMetricEngineService } from './branch-metric-engine.service.js';
import { branchPerformanceEngineService } from './branch-performance-engine.service.js';
import { branchRankingEngineService } from './branch-ranking-engine.service.js';

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

export const branchAnalyticsWorkerService = {
  start() {
    if (!env.BRANCH_ANALYTICS_WORKER_ENABLED || intervalHandle) return;
    intervalHandle = setInterval(() => {
      void branchAnalyticsWorkerService.tick();
    }, env.BRANCH_ANALYTICS_WORKER_INTERVAL_MS);
    console.log(`🏢 Branch analytics worker started (every ${env.BRANCH_ANALYTICS_WORKER_INTERVAL_MS}ms)`);
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
      const branches = await prisma.branch.findMany({
        where: { isActive: true },
        select: { id: true, regionId: true },
        take: 30,
      });

      const actor = { id: 'system', roles: ['SUPER_ADMIN'], permissions: ['*'] } as never;
      const period = { fromDate: today, toDate: end, periodType: 'DAILY' as const, timePreset: 'TODAY' as const };
      let metricsWritten = 0;

      for (const branch of branches) {
        const scope = { branchIds: [branch.id], canViewRegion: true, canViewAll: true };
        const [leadKpis, appKpis, revKpis] = await Promise.all([
          branchMetricEngineService.computeLeadKpis(scope, period, branch.id),
          branchMetricEngineService.computeApplicationKpis(scope, period, branch.id),
          branchMetricEngineService.computeRevenueKpis(scope, period, branch.id),
        ]);
        metricsWritten += await branchMetricEngineService.persistMetrics(branch.id, branch.regionId, period, [
          ...leadKpis,
          ...appKpis,
          ...revKpis,
        ]);
        await branchPerformanceEngineService.persist(actor, scope, period, branch.id);

        const dashboard = await branchAnalyticsOrchestratorService.dashboard(actor, {
          timePreset: 'TODAY',
          branchId: branch.id,
        });
        await branchAnalyticsRepository.upsertSnapshot({
          branchId: branch.id,
          regionId: branch.regionId,
          snapshotDate: today,
          periodType: 'DAILY',
          payload: dashboard as never,
        });
      }

      const rankingWritten = await branchRankingEngineService.rebuild('DAILY', today, end);
      analyticsCacheService.invalidate('branch:');

      if (metricsWritten > 0 || rankingWritten > 0) {
        console.log(`[branch-analytics-worker] metrics=${metricsWritten} rankings=${rankingWritten}`);
      }
    } catch (error) {
      console.error('Branch analytics worker error:', error);
    } finally {
      processing = false;
    }
  },
};
