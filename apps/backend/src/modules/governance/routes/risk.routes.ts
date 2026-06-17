import { Router } from 'express';

import { RBAC_PERMISSIONS } from '../../../shared/constants/rbac.constants.js';
import { asyncHandler } from '../../../shared/middleware/async-handler.middleware.js';
import { authenticateWithSessionMiddleware } from '../../../shared/middleware/authenticate.middleware.js';
import { requireAnyPermission } from '../../../shared/middleware/rbac.middleware.js';
import { validateMiddleware } from '../../../shared/middleware/validate.middleware.js';
import { governanceController } from '../controllers/governance.controller.js';
import {
  createRiskAssessmentSchema,
  createRiskRegisterSchema,
  governanceAnalyticsQuerySchema,
  governanceIdParamSchema,
  listRiskRegisterQuerySchema,
} from '../validators/governance.validator.js';

export const riskRoutes: Router = Router();

const riskRead = requireAnyPermission(RBAC_PERMISSIONS.RISK_READ, 'risk.read');
const riskManage = requireAnyPermission(RBAC_PERMISSIONS.RISK_MANAGE, 'risk.manage');

riskRoutes.use(authenticateWithSessionMiddleware);

riskRoutes.get('/dashboard', riskRead, validateMiddleware(governanceAnalyticsQuerySchema, 'query'), asyncHandler(governanceController.riskDashboard));
riskRoutes.get('/register', riskRead, validateMiddleware(listRiskRegisterQuerySchema, 'query'), asyncHandler(governanceController.listRiskRegister));
riskRoutes.post('/register', riskManage, validateMiddleware(createRiskRegisterSchema), asyncHandler(governanceController.createRiskRegister));
riskRoutes.get('/register/:id', riskRead, validateMiddleware(governanceIdParamSchema, 'params'), asyncHandler(governanceController.getRiskRegister));
riskRoutes.post('/assessments', riskManage, validateMiddleware(createRiskAssessmentSchema), asyncHandler(governanceController.createRiskAssessment));
riskRoutes.get('/events', riskRead, asyncHandler(governanceController.listRiskEvents));
