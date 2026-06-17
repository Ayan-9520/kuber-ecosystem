import { Router } from 'express';

import { RBAC_PERMISSIONS } from '../../../shared/constants/rbac.constants.js';
import { asyncHandler } from '../../../shared/middleware/async-handler.middleware.js';
import { authenticateWithSessionMiddleware } from '../../../shared/middleware/authenticate.middleware.js';
import { requireAnyPermission } from '../../../shared/middleware/rbac.middleware.js';
import { validateMiddleware } from '../../../shared/middleware/validate.middleware.js';
import { settingController } from '../controllers/setting.controller.js';
import {
  listSettingsQuerySchema,
  settingKeyParamSchema,
  updateSettingSchema,
} from '../validators/setting.validator.js';

const read = requireAnyPermission(
  RBAC_PERMISSIONS.SETTINGS_READ,
  'settings.read',
  RBAC_PERMISSIONS.USERS_READ,
  'users.read',
  'users.read:all',
);
const write = requireAnyPermission(
  RBAC_PERMISSIONS.SETTINGS_WRITE,
  'settings.write',
  RBAC_PERMISSIONS.USERS_WRITE,
  'users.write',
  'users.update:all',
);

export const settingRoutes: Router = Router();

settingRoutes.use(authenticateWithSessionMiddleware);
settingRoutes.get('/health', asyncHandler(settingController.health));
settingRoutes.get('/', read, validateMiddleware(listSettingsQuerySchema, 'query'), asyncHandler(settingController.list));
settingRoutes.get(
  '/:key',
  read,
  validateMiddleware(settingKeyParamSchema, 'params'),
  asyncHandler(settingController.getByKey),
);
settingRoutes.patch(
  '/:key',
  write,
  validateMiddleware(settingKeyParamSchema, 'params'),
  validateMiddleware(updateSettingSchema),
  asyncHandler(settingController.update),
);
