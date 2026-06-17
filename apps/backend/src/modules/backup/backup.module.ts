import { Router } from 'express';

import { backupRoutes } from './routes/backup.routes.js';
import { drRoutes } from './routes/dr.routes.js';

export function createBackupModule(): Router {
  const router = Router();
  router.use(backupRoutes);
  return router;
}

export function createDisasterRecoveryModule(): Router {
  const router = Router();
  router.use(drRoutes);
  return router;
}

export { backupWorkerService } from './services/backup-worker.service.js';
