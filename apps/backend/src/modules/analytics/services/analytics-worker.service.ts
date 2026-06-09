import { env } from '../../../config/env.js';
import { analyticsRepository } from '../repositories/analytics.repository.js';

import { aggregationEngineService } from './aggregation-engine.service.js';
import { analyticsCacheService } from './analytics-cache.service.js';
import { metricEngineService } from './metric-engine.service.js';
import { scheduleEngineService } from './schedule-engine.service.js';

let intervalHandle: ReturnType<typeof setInterval> | null = null;
let processing = false;

function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export const analyticsWorkerService = {
  start() {
    if (!env.ANALYTICS_WORKER_ENABLED || intervalHandle) return;
    intervalHandle = setInterval(() => {
      void analyticsWorkerService.tick();
    }, env.ANALYTICS_WORKER_INTERVAL_MS);
    console.log(`📊 Analytics worker started (every ${env.ANALYTICS_WORKER_INTERVAL_MS}ms)`);
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
      const metricsWritten = await metricEngineService.persistDailyMetrics(today);
      const overview = await aggregationEngineService.getOverview(
        { id: 'system', roles: ['SUPER_ADMIN'], dataScope: 'ORGANIZATION' } as never,
        { timePreset: 'TODAY' },
      );
      await analyticsRepository.upsertSnapshot({
        snapshotDate: today,
        dashboardType: 'MANAGEMENT',
        payload: overview as never,
      });
      const schedulesRun = await scheduleEngineService.processDueSchedules();
      analyticsCacheService.invalidate('overview');
      if (metricsWritten > 0 || schedulesRun > 0) {
        console.log(`[analytics-worker] metrics=${metricsWritten} schedules=${schedulesRun}`);
      }
    } catch (error) {
      console.error('Analytics worker error:', error);
    } finally {
      processing = false;
    }
  },
};
