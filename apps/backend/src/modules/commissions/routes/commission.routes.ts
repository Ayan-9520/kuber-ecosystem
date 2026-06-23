import { Router } from 'express';

import { RBAC_PERMISSIONS } from '../../../shared/constants/rbac.constants.js';
import { asyncHandler } from '../../../shared/middleware/async-handler.middleware.js';
import { authenticateWithSessionMiddleware } from '../../../shared/middleware/authenticate.middleware.js';
import { requireAnyPermission } from '../../../shared/middleware/rbac.middleware.js';
import { validateMiddleware } from '../../../shared/middleware/validate.middleware.js';
import {
  commissionAnalyticsController,
  commissionAdjustmentController,
  commissionApprovalController,
  commissionLedgerController,
  commissionPaymentController,
  commissionRecoveryController,
  commissionRuleController,
} from '../controllers/commission.controller.js';
import {
  calculateCommissionSchema,
  commissionAnalyticsQuerySchema,
  createCommissionAdjustmentSchema,
  createCommissionApprovalSchema,
  createCommissionPaymentSchema,
  createCommissionRecoverySchema,
  createCommissionRuleSchema,
  decideCommissionApprovalSchema,
  exportCommissionLedgerQuerySchema,
  listCommissionAdjustmentsQuerySchema,
  listCommissionApprovalsQuerySchema,
  listCommissionLedgerQuerySchema,
  listCommissionPaymentsQuerySchema,
  listCommissionRecoveriesQuerySchema,
  listCommissionRulesQuerySchema,
  payoutReportQuerySchema,
  rejectApprovalSchema,
  releaseCommissionPaymentSchema,
  updateCommissionRuleSchema,
  uuidParamSchema,
} from '../validators/commission.validator.js';

const read = requireAnyPermission(RBAC_PERMISSIONS.COMMISSIONS_READ, 'commissions.read');
const write = requireAnyPermission(RBAC_PERMISSIONS.COMMISSIONS_WRITE, 'commissions.write');
const approve = requireAnyPermission(
  RBAC_PERMISSIONS.COMMISSIONS_APPROVE,
  'commissions.approve',
  RBAC_PERMISSIONS.COMMISSIONS_WRITE,
);
const pay = requireAnyPermission(
  RBAC_PERMISSIONS.COMMISSIONS_PAY,
  'commissions.pay',
  RBAC_PERMISSIONS.COMMISSIONS_APPROVE,
);
const recover = requireAnyPermission(
  RBAC_PERMISSIONS.COMMISSIONS_RECOVER,
  'commissions.recover',
  RBAC_PERMISSIONS.COMMISSIONS_APPROVE,
);

export const commissionRuleRoutes = Router();
commissionRuleRoutes.use(authenticateWithSessionMiddleware);
commissionRuleRoutes.get('/', read, validateMiddleware(listCommissionRulesQuerySchema, 'query'), asyncHandler(commissionRuleController.list));
commissionRuleRoutes.post('/', write, validateMiddleware(createCommissionRuleSchema), asyncHandler(commissionRuleController.create));
commissionRuleRoutes.get('/:id', read, validateMiddleware(uuidParamSchema, 'params'), asyncHandler(commissionRuleController.getById));
commissionRuleRoutes.patch(
  '/:id',
  write,
  validateMiddleware(uuidParamSchema, 'params'),
  validateMiddleware(updateCommissionRuleSchema),
  asyncHandler(commissionRuleController.update),
);
commissionRuleRoutes.delete('/:id', write, validateMiddleware(uuidParamSchema, 'params'), asyncHandler(commissionRuleController.remove));

export const commissionLedgerRoutes = Router();
commissionLedgerRoutes.use(authenticateWithSessionMiddleware);
commissionLedgerRoutes.get('/', read, validateMiddleware(listCommissionLedgerQuerySchema, 'query'), asyncHandler(commissionLedgerController.list));
commissionLedgerRoutes.get('/export', read, validateMiddleware(exportCommissionLedgerQuerySchema, 'query'), asyncHandler(commissionLedgerController.export));
commissionLedgerRoutes.post('/calculate', write, validateMiddleware(calculateCommissionSchema), asyncHandler(commissionLedgerController.calculate));
commissionLedgerRoutes.get('/:id', read, validateMiddleware(uuidParamSchema, 'params'), asyncHandler(commissionLedgerController.getById));
commissionLedgerRoutes.delete('/:id', write, validateMiddleware(uuidParamSchema, 'params'), asyncHandler(commissionLedgerController.remove));

export const commissionApprovalRoutes = Router();
commissionApprovalRoutes.use(authenticateWithSessionMiddleware);
commissionApprovalRoutes.get('/', read, validateMiddleware(listCommissionApprovalsQuerySchema, 'query'), asyncHandler(commissionApprovalController.list));
commissionApprovalRoutes.post('/', write, validateMiddleware(createCommissionApprovalSchema), asyncHandler(commissionApprovalController.request));
commissionApprovalRoutes.get('/:id', read, validateMiddleware(uuidParamSchema, 'params'), asyncHandler(commissionApprovalController.getById));
commissionApprovalRoutes.post(
  '/:id/approve',
  approve,
  validateMiddleware(uuidParamSchema, 'params'),
  validateMiddleware(decideCommissionApprovalSchema),
  asyncHandler(commissionApprovalController.approve),
);
commissionApprovalRoutes.post(
  '/:id/reject',
  approve,
  validateMiddleware(uuidParamSchema, 'params'),
  validateMiddleware(rejectApprovalSchema),
  asyncHandler(commissionApprovalController.reject),
);

export const commissionPaymentRoutes = Router();
commissionPaymentRoutes.use(authenticateWithSessionMiddleware);
commissionPaymentRoutes.get('/', read, validateMiddleware(listCommissionPaymentsQuerySchema, 'query'), asyncHandler(commissionPaymentController.list));
commissionPaymentRoutes.get('/report', read, validateMiddleware(payoutReportQuerySchema, 'query'), asyncHandler(commissionPaymentController.report));
commissionPaymentRoutes.post('/', pay, validateMiddleware(createCommissionPaymentSchema), asyncHandler(commissionPaymentController.create));
commissionPaymentRoutes.get('/:id', read, validateMiddleware(uuidParamSchema, 'params'), asyncHandler(commissionPaymentController.getById));
commissionPaymentRoutes.post('/:id/approve', approve, validateMiddleware(uuidParamSchema, 'params'), asyncHandler(commissionPaymentController.approve));
commissionPaymentRoutes.post(
  '/:id/release',
  pay,
  validateMiddleware(uuidParamSchema, 'params'),
  validateMiddleware(releaseCommissionPaymentSchema),
  asyncHandler(commissionPaymentController.release),
);
commissionPaymentRoutes.delete('/:id', write, validateMiddleware(uuidParamSchema, 'params'), asyncHandler(commissionPaymentController.remove));

export const commissionAdjustmentRoutes = Router();
commissionAdjustmentRoutes.use(authenticateWithSessionMiddleware);
commissionAdjustmentRoutes.get('/', read, validateMiddleware(listCommissionAdjustmentsQuerySchema, 'query'), asyncHandler(commissionAdjustmentController.list));
commissionAdjustmentRoutes.post('/', write, validateMiddleware(createCommissionAdjustmentSchema), asyncHandler(commissionAdjustmentController.create));
commissionAdjustmentRoutes.get('/:id', read, validateMiddleware(uuidParamSchema, 'params'), asyncHandler(commissionAdjustmentController.getById));
commissionAdjustmentRoutes.post('/:id/approve', approve, validateMiddleware(uuidParamSchema, 'params'), asyncHandler(commissionAdjustmentController.approve));
commissionAdjustmentRoutes.post('/:id/reject', approve, validateMiddleware(uuidParamSchema, 'params'), asyncHandler(commissionAdjustmentController.reject));
commissionAdjustmentRoutes.delete('/:id', write, validateMiddleware(uuidParamSchema, 'params'), asyncHandler(commissionAdjustmentController.remove));

export const commissionRecoveryRoutes = Router();
commissionRecoveryRoutes.use(authenticateWithSessionMiddleware);
commissionRecoveryRoutes.get('/', read, validateMiddleware(listCommissionRecoveriesQuerySchema, 'query'), asyncHandler(commissionRecoveryController.list));
commissionRecoveryRoutes.post('/', recover, validateMiddleware(createCommissionRecoverySchema), asyncHandler(commissionRecoveryController.create));
commissionRecoveryRoutes.get('/:id', read, validateMiddleware(uuidParamSchema, 'params'), asyncHandler(commissionRecoveryController.getById));
commissionRecoveryRoutes.post('/:id/approve', recover, validateMiddleware(uuidParamSchema, 'params'), asyncHandler(commissionRecoveryController.approve));
commissionRecoveryRoutes.post('/:id/reject', recover, validateMiddleware(uuidParamSchema, 'params'), asyncHandler(commissionRecoveryController.reject));
commissionRecoveryRoutes.delete('/:id', write, validateMiddleware(uuidParamSchema, 'params'), asyncHandler(commissionRecoveryController.remove));

export const commissionAnalyticsRoutes = Router();
commissionAnalyticsRoutes.use(authenticateWithSessionMiddleware);
commissionAnalyticsRoutes.get('/', read, validateMiddleware(commissionAnalyticsQuerySchema, 'query'), asyncHandler(commissionAnalyticsController.summary));
