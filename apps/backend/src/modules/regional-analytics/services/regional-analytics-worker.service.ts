import { prisma } from '../../../config/database.js';
import { env } from '../../../config/env.js';
import { analyticsCacheService } from '../../analytics/services/analytics-cache.service.js';
import { regionalAnalyticsRepository } from '../repositories/regional-analytics.repository.js';

import { regionalAnalyticsOrchestratorService } from './regional-analytics-orchestrator.service.js';
import { regionalMetricEngineService } from './regional-metric-engine.service.js';
import { regionalPerformanceEngineService } from './regional-performance-engine.service.js';
import { regionalRankingEngineService } from './regional-ranking-engine.service.js';

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

export const regionalAnalyticsWorkerService = {
  start() {
    if (!env.REGIONAL_ANALYTICS_WORKER_ENABLED || intervalHandle) return;
    intervalHandle = setInterval(() => {
      void regionalAnalyticsWorkerService.tick();
    }, env.REGIONAL_ANALYTICS_WORKER_INTERVAL_MS);
    console.log(`🗺️ Regional analytics worker started (every ${env.REGIONAL_ANALYTICS_WORKER_INTERVAL_MS}ms)`);
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
      const regions = await prisma.region.findMany({
        where: { isActive: true },
        select: { id: true },
        take: 15,
      });

      const actor = { id: 'system', roles: ['SUPER_ADMIN'], permissions: ['*'] } as never;
      const period = { fromDate: today, toDate: end, periodType: 'DAILY' as const, timePreset: 'TODAY' as const };
      let metricsWritten = 0;

      for (const region of regions) {
        const branchIds = (
          await prisma.branch.findMany({ where: { regionId: region.id, isActive: true }, select: { id: true } })
        ).map((b) => b.id);
        const scope = { regionId: region.id, branchIds, canViewAll: true };

        const [overview, leads, apps, revenue] = await Promise.all([
          regionalMetricEngineService.computeOverviewKpis(scope, period, region.id),
          regionalMetricEngineService.computeLeadKpis(scope, period, region.id),
          regionalMetricEngineService.computeApplicationKpis(scope, period, region.id),
          regionalMetricEngineService.computeRevenueKpis(scope, period, region.id),
        ]);
        metricsWritten += await regionalMetricEngineService.persistMetrics(region.id, period, [
          ...overview,
          ...leads,
          ...apps,
          ...revenue,
        ]);
        await regionalPerformanceEngineService.persist(actor, scope, period, region.id);

        const dashboard = await regionalAnalyticsOrchestratorService.dashboard(actor, {
          timePreset: 'TODAY',
          regionId: region.id,
        });
        await regionalAnalyticsRepository.upsertSnapshot({
          regionId: region.id,
          snapshotDate: today,
          periodType: 'DAILY',
          payload: dashboard as never,
        });
      }

      const rankingWritten = await regionalRankingEngineService.rebuild('DAILY', today, end);
      analyticsCacheService.invalidate('regional:');

      if (metricsWritten > 0 || rankingWritten > 0) {
        console.log(`[regional-analytics-worker] metrics=${metricsWritten} rankings=${rankingWritten}`);
      }
    } catch (error) {
      console.error('Regional analytics worker error:', error);
    } finally {
      processing = false;
    }
  },
};
