import { Router } from 'express';

import { asyncHandler } from '../../../shared/middleware/async-handler.middleware.js';
import { RBAC_PERMISSIONS } from '../../../shared/constants/rbac.constants.js';
import { authenticateWithSessionMiddleware } from '../../../shared/middleware/authenticate.middleware.js';
import { requireAnyPermission } from '../../../shared/middleware/rbac.middleware.js';
import { validateMiddleware } from '../../../shared/middleware/validate.middleware.js';
import { auditLogController } from '../controllers/audit-log.controller.js';
import { exportAuditLogsQuerySchema, listAuditLogsQuerySchema } from '../validators/audit.validator.js';

export const auditLogRoutes: Router = Router();

auditLogRoutes.use(authenticateWithSessionMiddleware);

auditLogRoutes.get(
  '/export',
  requireAnyPermission(RBAC_PERMISSIONS.AUDIT_EXPORT, RBAC_PERMISSIONS.AUDIT_READ),
  validateMiddleware(exportAuditLogsQuerySchema, 'query'),
  asyncHandler(auditLogController.export),
);

auditLogRoutes.get(
  '/',
  requireAnyPermission(RBAC_PERMISSIONS.AUDIT_READ),
  validateMiddleware(listAuditLogsQuerySchema, 'query'),
  asyncHandler(auditLogController.list),
);

auditLogRoutes.get(
  '/:id',
  requireAnyPermission(RBAC_PERMISSIONS.AUDIT_READ),
  asyncHandler(auditLogController.getById),
);
