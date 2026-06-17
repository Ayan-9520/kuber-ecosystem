import { env } from '../../../config/env.js';

import { automationQueueService } from './automation-queue.service.js';

let intervalHandle: ReturnType<typeof setInterval> | null = null;
let processing = false;

export const automationWorkerService = {
  start() {
    if (!env.AUTOMATION_WORKER_ENABLED || intervalHandle) return;
    intervalHandle = setInterval(() => {
      void automationWorkerService.tick();
    }, env.AUTOMATION_WORKER_INTERVAL_MS);
    console.log(`⚡ Automation worker started (every ${env.AUTOMATION_WORKER_INTERVAL_MS}ms)`);
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
      await automationQueueService.processBatch(env.AUTOMATION_WORKER_BATCH_SIZE);
    } catch (error) {
      console.error('Automation worker error:', error);
    } finally {
      processing = false;
    }
  },
};
