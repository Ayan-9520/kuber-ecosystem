import { Router } from 'express';

import { RBAC_PERMISSIONS } from '../../../shared/constants/rbac.constants.js';
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
commissionRuleRoutes.get('/', read, validateMiddleware(listCommissionRulesQuerySchema, 'query'), commissionRuleController.list);
commissionRuleRoutes.post('/', write, validateMiddleware(createCommissionRuleSchema), commissionRuleController.create);
commissionRuleRoutes.get('/:id', read, validateMiddleware(uuidParamSchema, 'params'), commissionRuleController.getById);
commissionRuleRoutes.patch(
  '/:id',
  write,
  validateMiddleware(uuidParamSchema, 'params'),
  validateMiddleware(updateCommissionRuleSchema),
  commissionRuleController.update,
);
commissionRuleRoutes.delete('/:id', write, validateMiddleware(uuidParamSchema, 'params'), commissionRuleController.remove);

export const commissionLedgerRoutes = Router();
commissionLedgerRoutes.use(authenticateWithSessionMiddleware);
commissionLedgerRoutes.get('/', read, validateMiddleware(listCommissionLedgerQuerySchema, 'query'), commissionLedgerController.list);
commissionLedgerRoutes.get('/export', read, validateMiddleware(exportCommissionLedgerQuerySchema, 'query'), commissionLedgerController.export);
commissionLedgerRoutes.post('/calculate', write, validateMiddleware(calculateCommissionSchema), commissionLedgerController.calculate);
commissionLedgerRoutes.get('/:id', read, validateMiddleware(uuidParamSchema, 'params'), commissionLedgerController.getById);
commissionLedgerRoutes.delete('/:id', write, validateMiddleware(uuidParamSchema, 'params'), commissionLedgerController.remove);

export const commissionApprovalRoutes = Router();
commissionApprovalRoutes.use(authenticateWithSessionMiddleware);
commissionApprovalRoutes.get('/', read, validateMiddleware(listCommissionApprovalsQuerySchema, 'query'), commissionApprovalController.list);
commissionApprovalRoutes.post('/', write, validateMiddleware(createCommissionApprovalSchema), commissionApprovalController.request);
commissionApprovalRoutes.get('/:id', read, validateMiddleware(uuidParamSchema, 'params'), commissionApprovalController.getById);
commissionApprovalRoutes.post(
  '/:id/approve',
  approve,
  validateMiddleware(uuidParamSchema, 'params'),
  validateMiddleware(decideCommissionApprovalSchema),
  commissionApprovalController.approve,
);
commissionApprovalRoutes.post(
  '/:id/reject',
  approve,
  validateMiddleware(uuidParamSchema, 'params'),
  validateMiddleware(rejectApprovalSchema),
  commissionApprovalController.reject,
);

export const commissionPaymentRoutes = Router();
commissionPaymentRoutes.use(authenticateWithSessionMiddleware);
commissionPaymentRoutes.get('/', read, validateMiddleware(listCommissionPaymentsQuerySchema, 'query'), commissionPaymentController.list);
commissionPaymentRoutes.get('/report', read, validateMiddleware(payoutReportQuerySchema, 'query'), commissionPaymentController.report);
commissionPaymentRoutes.post('/', pay, validateMiddleware(createCommissionPaymentSchema), commissionPaymentController.create);
commissionPaymentRoutes.get('/:id', read, validateMiddleware(uuidParamSchema, 'params'), commissionPaymentController.getById);
commissionPaymentRoutes.post('/:id/approve', approve, validateMiddleware(uuidParamSchema, 'params'), commissionPaymentController.approve);
commissionPaymentRoutes.post(
  '/:id/release',
  pay,
  validateMiddleware(uuidParamSchema, 'params'),
  validateMiddleware(releaseCommissionPaymentSchema),
  commissionPaymentController.release,
);
commissionPaymentRoutes.delete('/:id', write, validateMiddleware(uuidParamSchema, 'params'), commissionPaymentController.remove);

export const commissionAdjustmentRoutes = Router();
commissionAdjustmentRoutes.use(authenticateWithSessionMiddleware);
commissionAdjustmentRoutes.get('/', read, validateMiddleware(listCommissionAdjustmentsQuerySchema, 'query'), commissionAdjustmentController.list);
commissionAdjustmentRoutes.post('/', write, validateMiddleware(createCommissionAdjustmentSchema), commissionAdjustmentController.create);
commissionAdjustmentRoutes.get('/:id', read, validateMiddleware(uuidParamSchema, 'params'), commissionAdjustmentController.getById);
commissionAdjustmentRoutes.post('/:id/approve', approve, validateMiddleware(uuidParamSchema, 'params'), commissionAdjustmentController.approve);
commissionAdjustmentRoutes.post('/:id/reject', approve, validateMiddleware(uuidParamSchema, 'params'), commissionAdjustmentController.reject);
commissionAdjustmentRoutes.delete('/:id', write, validateMiddleware(uuidParamSchema, 'params'), commissionAdjustmentController.remove);

export const commissionRecoveryRoutes = Router();
commissionRecoveryRoutes.use(authenticateWithSessionMiddleware);
commissionRecoveryRoutes.get('/', read, validateMiddleware(listCommissionRecoveriesQuerySchema, 'query'), commissionRecoveryController.list);
commissionRecoveryRoutes.post('/', recover, validateMiddleware(createCommissionRecoverySchema), commissionRecoveryController.create);
commissionRecoveryRoutes.get('/:id', read, validateMiddleware(uuidParamSchema, 'params'), commissionRecoveryController.getById);
commissionRecoveryRoutes.post('/:id/approve', recover, validateMiddleware(uuidParamSchema, 'params'), commissionRecoveryController.approve);
commissionRecoveryRoutes.post('/:id/reject', recover, validateMiddleware(uuidParamSchema, 'params'), commissionRecoveryController.reject);
commissionRecoveryRoutes.delete('/:id', write, validateMiddleware(uuidParamSchema, 'params'), commissionRecoveryController.remove);

export const commissionAnalyticsRoutes = Router();
commissionAnalyticsRoutes.use(authenticateWithSessionMiddleware);
commissionAnalyticsRoutes.get('/', read, validateMiddleware(commissionAnalyticsQuerySchema, 'query'), commissionAnalyticsController.summary);
