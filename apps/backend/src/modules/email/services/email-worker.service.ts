import { env } from '../../../config/env.js';

import { emailQueueService } from './email-queue.service.js';

let intervalHandle: ReturnType<typeof setInterval> | null = null;
let processing = false;

export const emailWorkerService = {
  start() {
    if (!env.EMAIL_WORKER_ENABLED || intervalHandle) return;
    intervalHandle = setInterval(() => {
      void emailWorkerService.tick();
    }, env.EMAIL_WORKER_INTERVAL_MS);
    console.log(`📧 Email worker started (every ${env.EMAIL_WORKER_INTERVAL_MS}ms)`);
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
      await emailQueueService.processBatch(env.EMAIL_WORKER_BATCH_SIZE);
    } catch (error) {
      console.error('Email worker error:', error);
    } finally {
      processing = false;
    }
  },
};
