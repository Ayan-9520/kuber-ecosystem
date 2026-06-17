import { Router } from 'express';

import { RBAC_PERMISSIONS } from '../../../shared/constants/rbac.constants.js';
import { asyncHandler } from '../../../shared/middleware/async-handler.middleware.js';
import { authenticateWithSessionMiddleware } from '../../../shared/middleware/authenticate.middleware.js';
import { requireAnyPermission } from '../../../shared/middleware/rbac.middleware.js';
import { validateMiddleware } from '../../../shared/middleware/validate.middleware.js';
import { drController } from '../controllers/dr.controller.js';
import {
  createDrDrillSchema,
  drWebhookSchema,
  listDrDrillsQuerySchema,
  startFailoverSchema,
  startRecoverySchema,
} from '../validators/dr.validator.js';

const drRead = requireAnyPermission(
  RBAC_PERMISSIONS.DR_READ,
  'dr.read',
  RBAC_PERMISSIONS.BACKUP_READ,
  'backup.read',
);

const drExecute = requireAnyPermission(
  RBAC_PERMISSIONS.DR_EXECUTE,
  'dr.execute',
  RBAC_PERMISSIONS.DR_MANAGE,
  'dr.manage',
  RBAC_PERMISSIONS.RECOVERY_MANAGE,
  'recovery.manage',
);

const drManage = requireAnyPermission(
  RBAC_PERMISSIONS.DR_MANAGE,
  'dr.manage',
  RBAC_PERMISSIONS.RECOVERY_MANAGE,
  'recovery.manage',
);

export const drRoutes = Router();

drRoutes.post('/webhook', validateMiddleware(drWebhookSchema), asyncHandler(drController.webhook));

drRoutes.use(authenticateWithSessionMiddleware);

drRoutes.get('/status', drRead, asyncHandler(drController.status));
drRoutes.get('/dashboard', drRead, asyncHandler(drController.dashboard));
drRoutes.get('/plans', drRead, asyncHandler(drController.plans));
drRoutes.get('/reports', drRead, asyncHandler(drController.reports));

drRoutes.get('/drills', drRead, validateMiddleware(listDrDrillsQuerySchema, 'query'), asyncHandler(drController.drills));
drRoutes.post('/drills', drExecute, validateMiddleware(createDrDrillSchema), asyncHandler(drController.startDrill));

drRoutes.get('/failover', drRead, asyncHandler(drController.listFailover));
drRoutes.post('/failover', drExecute, validateMiddleware(startFailoverSchema), asyncHandler(drController.failover));

drRoutes.get('/recovery', drRead, asyncHandler(drController.listRecovery));
drRoutes.post('/recovery', drManage, validateMiddleware(startRecoverySchema), asyncHandler(drController.startRecovery));
