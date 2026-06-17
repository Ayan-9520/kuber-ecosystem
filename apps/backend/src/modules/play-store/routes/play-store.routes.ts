import { Router } from 'express';

import { RBAC_PERMISSIONS } from '../../../shared/constants/rbac.constants.js';
import { asyncHandler } from '../../../shared/middleware/async-handler.middleware.js';
import { authenticateWithSessionMiddleware } from '../../../shared/middleware/authenticate.middleware.js';
import { requireAnyPermission } from '../../../shared/middleware/rbac.middleware.js';
import { validateMiddleware } from '../../../shared/middleware/validate.middleware.js';
import { playStoreController } from '../controllers/play-store.controller.js';
import {
  createPlayStoreReleaseSchema,
  listPlayStoreReleasesQuerySchema,
  playStoreWebhookSchema,
} from '../validators/play-store.validator.js';

const playStoreRead = requireAnyPermission(
  RBAC_PERMISSIONS.MOBILE_RELEASE,
  'mobile.release',
  RBAC_PERMISSIONS.MOBILE_PUBLISH,
  'mobile.publish',
);
const playStorePublish = requireAnyPermission(
  RBAC_PERMISSIONS.MOBILE_PUBLISH,
  'mobile.publish',
  RBAC_PERMISSIONS.RELEASE_MANAGE,
  'release.manage',
);

export const playStoreRoutes = Router();

playStoreRoutes.post(
  '/webhook',
  validateMiddleware(playStoreWebhookSchema),
  asyncHandler(playStoreController.webhook),
);

playStoreRoutes.use(authenticateWithSessionMiddleware);

playStoreRoutes.get('/health', playStoreRead, asyncHandler(playStoreController.health));
playStoreRoutes.get('/dashboard', playStoreRead, asyncHandler(playStoreController.dashboard));
playStoreRoutes.get('/checklist', playStoreRead, asyncHandler(playStoreController.checklist));
playStoreRoutes.get('/reports', playStoreRead, asyncHandler(playStoreController.reports));

playStoreRoutes.get(
  '/releases',
  playStoreRead,
  validateMiddleware(listPlayStoreReleasesQuerySchema, 'query'),
  asyncHandler(playStoreController.listReleases),
);
playStoreRoutes.post(
  '/releases',
  playStorePublish,
  validateMiddleware(createPlayStoreReleaseSchema),
  asyncHandler(playStoreController.createRelease),
);
