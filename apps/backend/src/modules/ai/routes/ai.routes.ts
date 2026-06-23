import { Router } from 'express';

import { asyncHandler } from '../../../shared/middleware/async-handler.middleware.js';
import { RBAC_PERMISSIONS } from '../../../shared/constants/rbac.constants.js';
import { protectStubRoute } from '../../../shared/middleware/stub-auth.middleware.js';
import { aiController } from '../controllers/ai.controller.js';

export const aiRoutes: Router = Router();

protectStubRoute(aiRoutes, RBAC_PERMISSIONS.ANALYTICS_READ);

aiRoutes.get('/health', asyncHandler(aiController.health));
