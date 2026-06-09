import { Router } from 'express';

import { RBAC_PERMISSIONS } from '../../../shared/constants/rbac.constants.js';
import { asyncHandler } from '../../../shared/middleware/async-handler.middleware.js';
import { protectStubRoute } from '../../../shared/middleware/stub-auth.middleware.js';
import { settingController } from '../controllers/setting.controller.js';

export const settingRoutes: Router = Router();

protectStubRoute(settingRoutes, RBAC_PERMISSIONS.SETTINGS_READ);

settingRoutes.get('/health', asyncHandler(settingController.health));
