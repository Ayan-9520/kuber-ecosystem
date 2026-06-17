import { Router } from 'express';

import { RBAC_PERMISSIONS } from '../../../shared/constants/rbac.constants.js';
import { asyncHandler } from '../../../shared/middleware/async-handler.middleware.js';
import { authenticateWithSessionMiddleware } from '../../../shared/middleware/authenticate.middleware.js';
import { requireAnyPermission } from '../../../shared/middleware/rbac.middleware.js';
import { validateMiddleware } from '../../../shared/middleware/validate.middleware.js';
import { governanceController } from '../controllers/governance.controller.js';
import {
  createAuditReportSchema,
  exportAuditEventsQuerySchema,
  governanceAnalyticsQuerySchema,
  governanceIdParamSchema,
  listAuditEventsQuerySchema,
} from '../validators/governance.validator.js';

export const auditCenterRoutes: Router = Router();

const auditRead = requireAnyPermission(RBAC_PERMISSIONS.AUDIT_READ, 'audit.read');
const auditExport = requireAnyPermission(RBAC_PERMISSIONS.AUDIT_EXPORT, 'audit.export');

auditCenterRoutes.use(authenticateWithSessionMiddleware);

auditCenterRoutes.get('/health', asyncHandler(governanceController.health));
auditCenterRoutes.get('/events/dashboard', auditRead, validateMiddleware(governanceAnalyticsQuerySchema, 'query'), asyncHandler(governanceController.auditDashboard));
auditCenterRoutes.get('/events', auditRead, validateMiddleware(listAuditEventsQuerySchema, 'query'), asyncHandler(governanceController.listAuditEvents));
auditCenterRoutes.get('/events/:id', auditRead, validateMiddleware(governanceIdParamSchema, 'params'), asyncHandler(governanceController.getAuditEvent));
auditCenterRoutes.get('/export', auditExport, validateMiddleware(exportAuditEventsQuerySchema, 'query'), asyncHandler(governanceController.exportAuditEvents));
auditCenterRoutes.get('/reports', auditRead, asyncHandler(governanceController.listAuditReports));
auditCenterRoutes.post('/reports', auditExport, validateMiddleware(createAuditReportSchema), asyncHandler(governanceController.createAuditReport));
