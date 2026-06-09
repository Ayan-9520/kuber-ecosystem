import { Router } from 'express';

import { auditLogRoutes } from './routes/audit-log.routes.js';

export function createAuditLogsModule(): Router {
  const router = Router();
  router.use(auditLogRoutes);
  return router;
}
