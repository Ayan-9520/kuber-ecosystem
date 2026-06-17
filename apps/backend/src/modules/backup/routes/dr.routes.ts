import { Router } from 'express';

import { RBAC_PERMISSIONS } from '../../../shared/constants/rbac.constants.js';
import { asyncHandler } from '../../../shared/middleware/async-handler.middleware.js';
import { authenticateWithSessionMiddleware } from '../../../shared/middleware/authenticate.middleware.js';
import { requireAnyPermission } from '../../../shared/middleware/rbac.middleware.js';
import { validateMiddleware } from '../../../shared/middleware/validate.middleware.js';
import { drController } from '../controllers/dr.controller.js';
import { backupIdParamSchema, createDrDrillSchema, listDrDrillsQuerySchema } from '../validators/backup.validator.js';

export const drRoutes: Router = Router();

const drRead = requireAnyPermission(RBAC_PERMISSIONS.DR_READ, 'dr.read');
const drManage = requireAnyPermission(RBAC_PERMISSIONS.DR_MANAGE, 'dr.manage');

drRoutes.use(authenticateWithSessionMiddleware);

drRoutes.get('/', drRead, asyncHandler(drController.overview));
drRoutes.get('/plans', drRead, asyncHandler(drController.listPlans));
drRoutes.get('/plans/:id', drRead, validateMiddleware(backupIdParamSchema, 'params'), asyncHandler(drController.getPlan));
drRoutes.get('/drills', drRead, validateMiddleware(listDrDrillsQuerySchema, 'query'), asyncHandler(drController.listDrills));
drRoutes.post('/drills', drManage, validateMiddleware(createDrDrillSchema), asyncHandler(drController.startDrill));
