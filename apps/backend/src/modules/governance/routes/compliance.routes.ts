import { Router } from 'express';

import { RBAC_PERMISSIONS } from '../../../shared/constants/rbac.constants.js';
import { asyncHandler } from '../../../shared/middleware/async-handler.middleware.js';
import { authenticateWithSessionMiddleware } from '../../../shared/middleware/authenticate.middleware.js';
import { requireAnyPermission } from '../../../shared/middleware/rbac.middleware.js';
import { validateMiddleware } from '../../../shared/middleware/validate.middleware.js';
import { governanceController } from '../controllers/governance.controller.js';
import {
  createComplianceReportSchema,
  governanceAnalyticsQuerySchema,
  listComplianceViolationsQuerySchema,
  resolveViolationSchema,
} from '../validators/governance.validator.js';

export const complianceRoutes: Router = Router();

const complianceRead = requireAnyPermission(RBAC_PERMISSIONS.COMPLIANCE_READ, 'compliance.read');
const complianceManage = requireAnyPermission(RBAC_PERMISSIONS.COMPLIANCE_MANAGE, 'compliance.manage');

complianceRoutes.use(authenticateWithSessionMiddleware);

complianceRoutes.get('/dashboard', complianceRead, validateMiddleware(governanceAnalyticsQuerySchema, 'query'), asyncHandler(governanceController.complianceDashboard));
complianceRoutes.get('/violations', complianceRead, validateMiddleware(listComplianceViolationsQuerySchema, 'query'), asyncHandler(governanceController.listViolations));
complianceRoutes.post('/violations/resolve', complianceManage, validateMiddleware(resolveViolationSchema), asyncHandler(governanceController.resolveViolation));
complianceRoutes.get('/reports', complianceRead, asyncHandler(governanceController.listComplianceReports));
complianceRoutes.post('/reports', complianceManage, validateMiddleware(createComplianceReportSchema), asyncHandler(governanceController.generateComplianceReport));
complianceRoutes.get('/rules', complianceRead, asyncHandler(governanceController.listComplianceRules));
complianceRoutes.get('/retention-policies', complianceRead, asyncHandler(governanceController.listRetentionPolicies));
