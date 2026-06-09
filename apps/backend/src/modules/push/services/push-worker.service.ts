import { env } from '../../../config/env.js';

import { pushQueueService } from './push-queue.service.js';

let intervalHandle: ReturnType<typeof setInterval> | null = null;
let processing = false;

export const pushWorkerService = {
  start() {
    if (!env.PUSH_WORKER_ENABLED || intervalHandle) return;
    intervalHandle = setInterval(() => {
      void pushWorkerService.tick();
    }, env.PUSH_WORKER_INTERVAL_MS);
    console.log(`🔔 Push worker started (every ${env.PUSH_WORKER_INTERVAL_MS}ms)`);
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
      await pushQueueService.processBatch(env.PUSH_WORKER_BATCH_SIZE);
    } catch (error) {
      console.error('Push worker error:', error);
    } finally {
      processing = false;
    }
  },
};
