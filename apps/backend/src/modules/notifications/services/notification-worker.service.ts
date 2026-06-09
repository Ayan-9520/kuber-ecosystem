import { env } from '../../../config/env.js';

import { notificationService } from './notification.service.js';

let intervalHandle: ReturnType<typeof setInterval> | null = null;
let processing = false;

export const notificationWorkerService = {
  start() {
    if (!env.NOTIFICATION_WORKER_ENABLED || intervalHandle) return;
    intervalHandle = setInterval(() => {
      void notificationWorkerService.tick();
    }, env.NOTIFICATION_WORKER_INTERVAL_MS);
    console.log(`📬 Notification worker started (every ${env.NOTIFICATION_WORKER_INTERVAL_MS}ms)`);
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
      await notificationService.processQueue(env.NOTIFICATION_WORKER_BATCH_SIZE);
    } catch (error) {
      console.error('Notification worker error:', error);
    } finally {
      processing = false;
    }
  },
};
