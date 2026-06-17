import { backupRepository } from '../repositories/backup.repository.js';

import { backupEngineService } from './backup-engine.service.js';
import { backupRetentionService } from './backup-retention.service.js';

const SCHEDULE_MS: Record<string, number> = {
  HOURLY: 60 * 60 * 1000,
  DAILY: 24 * 60 * 60 * 1000,
  WEEKLY: 7 * 24 * 60 * 60 * 1000,
  MONTHLY: 30 * 24 * 60 * 60 * 1000,
};

let intervalHandle: ReturnType<typeof setInterval> | null = null;
let processing = false;

export const backupWorkerService = {
  start() {
    if (process.env.BACKUP_WORKER_ENABLED === 'false' || intervalHandle) return;
    const intervalMs = Number(process.env.BACKUP_WORKER_INTERVAL_MS ?? 3_600_000);
    intervalHandle = setInterval(() => void backupWorkerService.tick(), intervalMs);
    console.log(`💾 Backup worker started (every ${intervalMs}ms)`);
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
      const jobs = await backupRepository.job.findMany({ where: { status: 'ACTIVE', schedule: { not: 'MANUAL' } } });
      const now = Date.now();

      for (const job of jobs) {
        const interval = SCHEDULE_MS[job.schedule] ?? 24 * 60 * 60 * 1000;
        const lastRun = job.lastRunAt?.getTime() ?? 0;
        if (now - lastRun >= interval) {
          try {
            await backupEngineService.runJob(job.id, 'scheduler');
          } catch (err) {
            console.error(`Backup job ${job.code} failed:`, err);
          }
        }
      }

      await backupRetentionService.cleanup();
    } catch (error) {
      console.error('Backup worker error:', error);
    } finally {
      processing = false;
    }
  },
};
