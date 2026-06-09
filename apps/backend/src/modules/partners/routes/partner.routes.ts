import { Router } from 'express';

import { RBAC_PERMISSIONS } from '../../../shared/constants/rbac.constants.js';
import { protectStubRoute } from '../../../shared/middleware/stub-auth.middleware.js';
import { partnerController } from '../controllers/partner.controller.js';

export const partnerRoutes: Router = Router();

protectStubRoute(partnerRoutes, RBAC_PERMISSIONS.PARTNERS_READ);

partnerRoutes.get('/health', partnerController.health);
