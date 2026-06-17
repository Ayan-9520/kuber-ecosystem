import { env } from '../../../config/env.js';

import { contentQueueService } from './content-queue.service.js';

let intervalHandle: ReturnType<typeof setInterval> | null = null;
let processing = false;

export const contentWorkerService = {
  start() {
    if (!env.CONTENT_WORKER_ENABLED || intervalHandle) return;
    intervalHandle = setInterval(() => {
      void contentWorkerService.tick();
    }, env.CONTENT_WORKER_INTERVAL_MS);
    console.log(`✍️ Content worker started (every ${env.CONTENT_WORKER_INTERVAL_MS}ms)`);
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
      await contentQueueService.processBatch(env.CONTENT_WORKER_BATCH_SIZE);
    } catch (error) {
      console.error('Content worker error:', error);
    } finally {
      processing = false;
    }
  },
};
