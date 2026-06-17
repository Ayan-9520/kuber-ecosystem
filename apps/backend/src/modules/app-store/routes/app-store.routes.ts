import { Router } from 'express';

import { RBAC_PERMISSIONS } from '../../../shared/constants/rbac.constants.js';
import { asyncHandler } from '../../../shared/middleware/async-handler.middleware.js';
import { authenticateWithSessionMiddleware } from '../../../shared/middleware/authenticate.middleware.js';
import { requireAnyPermission } from '../../../shared/middleware/rbac.middleware.js';
import { validateMiddleware } from '../../../shared/middleware/validate.middleware.js';
import { appStoreController } from '../controllers/app-store.controller.js';
import {
  appStoreWebhookSchema,
  createAppStoreReleaseSchema,
  listAppStoreReleasesQuerySchema,
} from '../validators/app-store.validator.js';

const appStoreRead = requireAnyPermission(
  RBAC_PERMISSIONS.MOBILE_RELEASE,
  'mobile.release',
  RBAC_PERMISSIONS.MOBILE_PUBLISH,
  'mobile.publish',
);
const appStorePublish = requireAnyPermission(
  RBAC_PERMISSIONS.MOBILE_PUBLISH,
  'mobile.publish',
  RBAC_PERMISSIONS.RELEASE_MANAGE,
  'release.manage',
);

export const appStoreRoutes = Router();

appStoreRoutes.post(
  '/webhook',
  validateMiddleware(appStoreWebhookSchema),
  asyncHandler(appStoreController.webhook),
);

appStoreRoutes.use(authenticateWithSessionMiddleware);

appStoreRoutes.get('/health', appStoreRead, asyncHandler(appStoreController.health));
appStoreRoutes.get('/dashboard', appStoreRead, asyncHandler(appStoreController.dashboard));
appStoreRoutes.get('/testflight', appStoreRead, asyncHandler(appStoreController.testflightDashboard));
appStoreRoutes.get('/checklist', appStoreRead, asyncHandler(appStoreController.checklist));
appStoreRoutes.get('/reports', appStoreRead, asyncHandler(appStoreController.reports));

appStoreRoutes.get(
  '/releases',
  appStoreRead,
  validateMiddleware(listAppStoreReleasesQuerySchema, 'query'),
  asyncHandler(appStoreController.listReleases),
);
appStoreRoutes.post(
  '/releases',
  appStorePublish,
  validateMiddleware(createAppStoreReleaseSchema),
  asyncHandler(appStoreController.createRelease),
);
