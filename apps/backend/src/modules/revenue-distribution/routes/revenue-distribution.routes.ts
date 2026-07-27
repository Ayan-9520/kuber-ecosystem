import { type NextFunction, type Request, type Response, Router } from 'express';

import { UserType } from '@kuberone/shared-types';

import { RBAC_PERMISSIONS } from '../../../shared/constants/rbac.constants.js';
import { ForbiddenError } from '../../../shared/errors/app-error.js';
import { asyncHandler } from '../../../shared/middleware/async-handler.middleware.js';
import { authenticateWithSessionMiddleware } from '../../../shared/middleware/authenticate.middleware.js';
import { requireAnyPermission } from '../../../shared/middleware/rbac.middleware.js';
import { validateMiddleware } from '../../../shared/middleware/validate.middleware.js';
import { revenueDistributionController } from '../controllers/revenue-distribution.controller.js';
import {
  createRuleSchema,
  createRunSchema,
  listAuditQuerySchema,
  listRulesQuerySchema,
  listRunsQuerySchema,
  simulateSchema,
  updateRuleSchema,
  uuidParamSchema,
} from '../validators/revenue-distribution.validator.js';

const read = requireAnyPermission(
  RBAC_PERMISSIONS.COMMISSIONS_READ,
  'commissions.read',
  RBAC_PERMISSIONS.LOAN_FULFILLMENT_READ,
  'loan_fulfillment.read',
);

const write = requireAnyPermission(
  RBAC_PERMISSIONS.COMMISSIONS_WRITE,
  'commissions.write',
  RBAC_PERMISSIONS.LOAN_FULFILLMENT_CONFIGURE,
  'loan_fulfillment.configure',
);

/** DRDE rule engine is internal — partners only see their own commission share on cases. */
function forbidPartners(req: Request, _res: Response, next: NextFunction) {
  if (req.user?.userType === UserType.PARTNER || req.user?.roles?.includes('DSA_PARTNER')) {
    next(new ForbiddenError('Revenue distribution configuration is available to finance teams only'));
    return;
  }
  next();
}

export const revenueDistributionRoutes = Router();
revenueDistributionRoutes.use(authenticateWithSessionMiddleware);
revenueDistributionRoutes.use(forbidPartners);

revenueDistributionRoutes.get('/summary', read, asyncHandler(revenueDistributionController.summary));

revenueDistributionRoutes.get(
  '/rules',
  read,
  validateMiddleware(listRulesQuerySchema, 'query'),
  asyncHandler(revenueDistributionController.listRules),
);
revenueDistributionRoutes.get(
  '/rules/:id',
  read,
  validateMiddleware(uuidParamSchema, 'params'),
  asyncHandler(revenueDistributionController.getRule),
);
revenueDistributionRoutes.post(
  '/rules',
  write,
  validateMiddleware(createRuleSchema),
  asyncHandler(revenueDistributionController.createRule),
);
revenueDistributionRoutes.patch(
  '/rules/:id',
  write,
  validateMiddleware(uuidParamSchema, 'params'),
  validateMiddleware(updateRuleSchema),
  asyncHandler(revenueDistributionController.updateRule),
);
revenueDistributionRoutes.delete(
  '/rules/:id',
  write,
  validateMiddleware(uuidParamSchema, 'params'),
  asyncHandler(revenueDistributionController.deleteRule),
);

revenueDistributionRoutes.post(
  '/simulate',
  read,
  validateMiddleware(simulateSchema),
  asyncHandler(revenueDistributionController.simulate),
);

revenueDistributionRoutes.post(
  '/runs',
  write,
  validateMiddleware(createRunSchema),
  asyncHandler(revenueDistributionController.createRun),
);
revenueDistributionRoutes.get(
  '/runs',
  read,
  validateMiddleware(listRunsQuerySchema, 'query'),
  asyncHandler(revenueDistributionController.listRuns),
);
revenueDistributionRoutes.get(
  '/runs/:id',
  read,
  validateMiddleware(uuidParamSchema, 'params'),
  asyncHandler(revenueDistributionController.getRun),
);

revenueDistributionRoutes.get(
  '/audit',
  read,
  validateMiddleware(listAuditQuerySchema, 'query'),
  asyncHandler(revenueDistributionController.listAudit),
);
