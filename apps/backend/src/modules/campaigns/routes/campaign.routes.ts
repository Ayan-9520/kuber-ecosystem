import { Router } from 'express';

import { RBAC_PERMISSIONS } from '../../../shared/constants/rbac.constants.js';
import { asyncHandler } from '../../../shared/middleware/async-handler.middleware.js';
import { authenticateWithSessionMiddleware } from '../../../shared/middleware/authenticate.middleware.js';
import { requireAnyPermission } from '../../../shared/middleware/rbac.middleware.js';
import { validateMiddleware } from '../../../shared/middleware/validate.middleware.js';
import { campaignController } from '../controllers/campaign.controller.js';
import {
  createCampaignSchema,
  listCampaignsQuerySchema,
  updateCampaignMetricsSchema,
  updateCampaignSchema,
  uuidParamSchema,
} from '../validators/campaign.validator.js';

const read = requireAnyPermission(
  RBAC_PERMISSIONS.NOTIFICATIONS_READ,
  'notifications.read',
  'analytics.read',
  'campaigns.read',
);
const write = requireAnyPermission(
  RBAC_PERMISSIONS.NOTIFICATIONS_WRITE,
  'notifications.write',
  'campaigns.write',
);

export const campaignRoutes: Router = Router();

campaignRoutes.use(authenticateWithSessionMiddleware);
campaignRoutes.get('/health', asyncHandler(campaignController.health));
campaignRoutes.get('/', read, validateMiddleware(listCampaignsQuerySchema, 'query'), asyncHandler(campaignController.list));
campaignRoutes.post('/', write, validateMiddleware(createCampaignSchema), asyncHandler(campaignController.create));
campaignRoutes.get('/:id', read, validateMiddleware(uuidParamSchema, 'params'), asyncHandler(campaignController.getById));
campaignRoutes.patch(
  '/:id',
  write,
  validateMiddleware(uuidParamSchema, 'params'),
  validateMiddleware(updateCampaignSchema),
  asyncHandler(campaignController.update),
);
campaignRoutes.patch(
  '/:id/metrics',
  write,
  validateMiddleware(uuidParamSchema, 'params'),
  validateMiddleware(updateCampaignMetricsSchema),
  asyncHandler(campaignController.updateMetrics),
);
campaignRoutes.delete(
  '/:id',
  write,
  validateMiddleware(uuidParamSchema, 'params'),
  asyncHandler(campaignController.remove),
);
