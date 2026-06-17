import { Router } from 'express';

import { RBAC_PERMISSIONS } from '../../../shared/constants/rbac.constants.js';
import { asyncHandler } from '../../../shared/middleware/async-handler.middleware.js';
import { authenticateWithSessionMiddleware } from '../../../shared/middleware/authenticate.middleware.js';
import { requireAnyPermission } from '../../../shared/middleware/rbac.middleware.js';
import { validateMiddleware } from '../../../shared/middleware/validate.middleware.js';
import { mobileReleaseController } from '../controllers/mobile-release.controller.js';
import {
  createMobileReleaseSchema,
  listMobileBuildsQuerySchema,
  listMobileReleasesQuerySchema,
  mobileBuildWebhookSchema,
} from '../validators/mobile-release.validator.js';

const mobileRead = requireAnyPermission(
  RBAC_PERMISSIONS.MOBILE_RELEASE,
  'mobile.release',
  RBAC_PERMISSIONS.MOBILE_BUILD,
  'mobile.build',
);
const releaseManage = requireAnyPermission(
  RBAC_PERMISSIONS.RELEASE_MANAGE,
  'release.manage',
  RBAC_PERMISSIONS.MOBILE_RELEASE,
  'mobile.release',
);

export const mobileReleaseRoutes = Router();

mobileReleaseRoutes.post(
  '/builds/webhook',
  validateMiddleware(mobileBuildWebhookSchema),
  asyncHandler(mobileReleaseController.buildWebhook),
);

mobileReleaseRoutes.use(authenticateWithSessionMiddleware);

mobileReleaseRoutes.get('/health', mobileRead, asyncHandler(mobileReleaseController.health));
mobileReleaseRoutes.get('/dashboard', mobileRead, asyncHandler(mobileReleaseController.dashboard));
mobileReleaseRoutes.get('/checklist', mobileRead, asyncHandler(mobileReleaseController.checklist));

mobileReleaseRoutes.get(
  '/builds',
  mobileRead,
  validateMiddleware(listMobileBuildsQuerySchema, 'query'),
  asyncHandler(mobileReleaseController.listBuilds),
);
mobileReleaseRoutes.get('/builds/:id', mobileRead, asyncHandler(mobileReleaseController.getBuild));

mobileReleaseRoutes.get(
  '/releases',
  mobileRead,
  validateMiddleware(listMobileReleasesQuerySchema, 'query'),
  asyncHandler(mobileReleaseController.listReleases),
);
mobileReleaseRoutes.post(
  '/releases',
  releaseManage,
  validateMiddleware(createMobileReleaseSchema),
  asyncHandler(mobileReleaseController.createRelease),
);
mobileReleaseRoutes.get('/releases/:id', mobileRead, asyncHandler(mobileReleaseController.getRelease));
