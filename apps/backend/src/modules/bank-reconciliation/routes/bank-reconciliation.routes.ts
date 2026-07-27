import { type NextFunction, type Request, type Response, Router } from 'express';

import { UserType } from '@kuberone/shared-types';

import { RBAC_PERMISSIONS } from '../../../shared/constants/rbac.constants.js';
import { ForbiddenError } from '../../../shared/errors/app-error.js';
import { asyncHandler } from '../../../shared/middleware/async-handler.middleware.js';
import { authenticateWithSessionMiddleware } from '../../../shared/middleware/authenticate.middleware.js';
import { requireAnyPermission } from '../../../shared/middleware/rbac.middleware.js';
import { validateMiddleware } from '../../../shared/middleware/validate.middleware.js';
import { bankReconciliationController } from '../controllers/bank-reconciliation.controller.js';
import {
  createDisputeSchema,
  createStatementSchema,
  listAuditQuerySchema,
  listDisputesQuerySchema,
  listMatchesQuerySchema,
  listStatementsQuerySchema,
  reviewMatchSchema,
  updateDisputeSchema,
  uuidParamSchema,
} from '../validators/bank-reconciliation.validator.js';

const read = requireAnyPermission(
  RBAC_PERMISSIONS.COMMISSIONS_READ,
  'commissions.read',
  RBAC_PERMISSIONS.LOAN_FULFILLMENT_READ,
  'loan_fulfillment.read',
);
const write = requireAnyPermission(
  RBAC_PERMISSIONS.COMMISSIONS_WRITE,
  'commissions.write',
  RBAC_PERMISSIONS.LOAN_FULFILLMENT_WRITE,
  'loan_fulfillment.write',
);
const approve = requireAnyPermission(
  RBAC_PERMISSIONS.COMMISSIONS_APPROVE,
  'commissions.approve',
  RBAC_PERMISSIONS.LOAN_FULFILLMENT_APPROVE,
  'loan_fulfillment.approve',
);

/** Bank recon is an internal finance tool — partners must not access it. */
function forbidPartners(req: Request, _res: Response, next: NextFunction) {
  if (req.user?.userType === UserType.PARTNER || req.user?.roles?.includes('DSA_PARTNER')) {
    next(new ForbiddenError('Bank reconciliation is available to finance teams only'));
    return;
  }
  next();
}

export const bankReconciliationRoutes = Router();
bankReconciliationRoutes.use(authenticateWithSessionMiddleware);
bankReconciliationRoutes.use(forbidPartners);

bankReconciliationRoutes.get('/summary', read, asyncHandler(bankReconciliationController.summary));

bankReconciliationRoutes.get(
  '/statements',
  read,
  validateMiddleware(listStatementsQuerySchema, 'query'),
  asyncHandler(bankReconciliationController.listStatements),
);
bankReconciliationRoutes.post(
  '/statements',
  write,
  validateMiddleware(createStatementSchema),
  asyncHandler(bankReconciliationController.createStatement),
);
bankReconciliationRoutes.get(
  '/statements/:id',
  read,
  validateMiddleware(uuidParamSchema, 'params'),
  asyncHandler(bankReconciliationController.getStatement),
);
bankReconciliationRoutes.post(
  '/statements/:id/reconcile',
  write,
  validateMiddleware(uuidParamSchema, 'params'),
  asyncHandler(bankReconciliationController.reconcileStatement),
);

bankReconciliationRoutes.get(
  '/matches',
  read,
  validateMiddleware(listMatchesQuerySchema, 'query'),
  asyncHandler(bankReconciliationController.listMatches),
);
bankReconciliationRoutes.patch(
  '/matches/:id',
  approve,
  validateMiddleware(uuidParamSchema, 'params'),
  validateMiddleware(reviewMatchSchema),
  asyncHandler(bankReconciliationController.reviewMatch),
);
bankReconciliationRoutes.post(
  '/matches/:id/dispute',
  approve,
  validateMiddleware(uuidParamSchema, 'params'),
  validateMiddleware(createDisputeSchema),
  asyncHandler(bankReconciliationController.createDispute),
);

bankReconciliationRoutes.get(
  '/disputes',
  read,
  validateMiddleware(listDisputesQuerySchema, 'query'),
  asyncHandler(bankReconciliationController.listDisputes),
);
bankReconciliationRoutes.patch(
  '/disputes/:id',
  approve,
  validateMiddleware(uuidParamSchema, 'params'),
  validateMiddleware(updateDisputeSchema),
  asyncHandler(bankReconciliationController.updateDispute),
);

bankReconciliationRoutes.get(
  '/audit',
  read,
  validateMiddleware(listAuditQuerySchema, 'query'),
  asyncHandler(bankReconciliationController.listAudit),
);
