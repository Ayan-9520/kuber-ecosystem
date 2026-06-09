import { Router } from 'express';

import { RBAC_PERMISSIONS } from '../../../shared/constants/rbac.constants.js';
import { asyncHandler } from '../../../shared/middleware/async-handler.middleware.js';
import { authenticateWithSessionMiddleware } from '../../../shared/middleware/authenticate.middleware.js';
import { requireAnyPermission } from '../../../shared/middleware/rbac.middleware.js';
import { validateMiddleware } from '../../../shared/middleware/validate.middleware.js';
import { recommendationsController } from '../controllers/recommendations.controller.js';
import {
  actionsQuerySchema,
  analyticsQuerySchema,
  createRuleSchema,
  crossSellQuerySchema,
  entityParamSchema,
  listRulesQuerySchema,
  updateRuleSchema,
} from '../validators/recommendations.validator.js';

export const recommendationsRoutes: Router = Router();

const recRead = requireAnyPermission(
  RBAC_PERMISSIONS.LEADS_READ,
  RBAC_PERMISSIONS.CUSTOMERS_READ,
  RBAC_PERMISSIONS.APPLICATIONS_READ,
  RBAC_PERMISSIONS.RECOMMENDATIONS_READ,
  'recommendations.read',
);

const recAdmin = requireAnyPermission(
  RBAC_PERMISSIONS.LEADS_WRITE,
  RBAC_PERMISSIONS.RECOMMENDATIONS_CONFIGURE,
  'recommendations.configure',
);

recommendationsRoutes.use(authenticateWithSessionMiddleware);

recommendationsRoutes.get('/health', asyncHandler(recommendationsController.health));

recommendationsRoutes.get(
  '/customer/:id',
  recRead,
  validateMiddleware(entityParamSchema, 'params'),
  asyncHandler(recommendationsController.customer),
);

recommendationsRoutes.get(
  '/lead/:id',
  recRead,
  validateMiddleware(entityParamSchema, 'params'),
  asyncHandler(recommendationsController.lead),
);

recommendationsRoutes.get(
  '/application/:id',
  recRead,
  validateMiddleware(entityParamSchema, 'params'),
  asyncHandler(recommendationsController.application),
);

recommendationsRoutes.get(
  '/lender/:id',
  recRead,
  validateMiddleware(entityParamSchema, 'params'),
  asyncHandler(recommendationsController.lender),
);

recommendationsRoutes.get(
  '/cross-sell',
  recRead,
  validateMiddleware(crossSellQuerySchema, 'query'),
  asyncHandler(recommendationsController.crossSell),
);

recommendationsRoutes.get(
  '/actions',
  recRead,
  validateMiddleware(actionsQuerySchema, 'query'),
  asyncHandler(recommendationsController.actions),
);

recommendationsRoutes.get(
  '/analytics',
  recRead,
  validateMiddleware(analyticsQuerySchema, 'query'),
  asyncHandler(recommendationsController.analytics),
);

recommendationsRoutes.get(
  '/rules',
  recAdmin,
  validateMiddleware(listRulesQuerySchema, 'query'),
  asyncHandler(recommendationsController.listRules),
);

recommendationsRoutes.post(
  '/rules',
  recAdmin,
  validateMiddleware(createRuleSchema),
  asyncHandler(recommendationsController.createRule),
);

recommendationsRoutes.patch(
  '/rules/:id',
  recAdmin,
  validateMiddleware(updateRuleSchema),
  asyncHandler(recommendationsController.updateRule),
);
