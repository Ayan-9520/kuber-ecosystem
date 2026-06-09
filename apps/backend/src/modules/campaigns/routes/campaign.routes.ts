import { Router } from 'express';

import { RBAC_PERMISSIONS } from '../../../shared/constants/rbac.constants.js';
import { asyncHandler } from '../../../shared/middleware/async-handler.middleware.js';
import { protectStubRoute } from '../../../shared/middleware/stub-auth.middleware.js';
import { campaignController } from '../controllers/campaign.controller.js';

export const campaignRoutes: Router = Router();

protectStubRoute(campaignRoutes, RBAC_PERMISSIONS.ANALYTICS_READ);

campaignRoutes.get('/health', asyncHandler(campaignController.health));
