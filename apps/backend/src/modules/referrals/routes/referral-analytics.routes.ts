import { Router } from 'express';

import { asyncHandler } from '../../../shared/middleware/async-handler.middleware.js';
import { RBAC_PERMISSIONS } from '../../../shared/constants/rbac.constants.js';
import { authenticateWithSessionMiddleware } from '../../../shared/middleware/authenticate.middleware.js';
import { requireAnyPermission } from '../../../shared/middleware/rbac.middleware.js';
import { referralAnalyticsController } from '../controllers/referral-analytics.controller.js';

const referralsRead = requireAnyPermission(RBAC_PERMISSIONS.REFERRALS_READ, 'referrals.read');

export const referralAnalyticsRoutes = Router();
referralAnalyticsRoutes.use(authenticateWithSessionMiddleware);
referralAnalyticsRoutes.get('/', referralsRead, asyncHandler(referralAnalyticsController.summary));
