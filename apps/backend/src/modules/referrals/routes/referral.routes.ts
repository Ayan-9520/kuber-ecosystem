import { Router } from 'express';

import { RBAC_PERMISSIONS } from '../../../shared/constants/rbac.constants.js';
import { asyncHandler } from '../../../shared/middleware/async-handler.middleware.js';
import { authenticateWithSessionMiddleware } from '../../../shared/middleware/authenticate.middleware.js';
import { requireAnyPermission } from '../../../shared/middleware/rbac.middleware.js';
import { validateMiddleware } from '../../../shared/middleware/validate.middleware.js';
import { referralController, referralTypeController } from '../controllers/referral.controller.js';
import {
  convertReferralSchema,
  createReferralSchema,
  createReferralTypeSchema,
  listReferralsQuerySchema,
  listReferralTypesQuerySchema,
  rejectReferralSchema,
  updateReferralSchema,
  updateReferralTypeSchema,
  uuidParamSchema,
  validateReferralCodeSchema,
} from '../validators/referral.validator.js';

const referralsRead = requireAnyPermission(RBAC_PERMISSIONS.REFERRALS_READ, 'referrals.read');
const referralsWrite = requireAnyPermission(RBAC_PERMISSIONS.REFERRALS_WRITE, 'referrals.write');
const referralsApprove = requireAnyPermission(
  RBAC_PERMISSIONS.REFERRALS_APPROVE,
  'referrals.approve',
  RBAC_PERMISSIONS.REFERRALS_WRITE,
);

export const referralRoutes = Router();
referralRoutes.use(authenticateWithSessionMiddleware);
referralRoutes.get('/', referralsRead, validateMiddleware(listReferralsQuerySchema, 'query'), asyncHandler(referralController.list));
referralRoutes.post('/', referralsWrite, validateMiddleware(createReferralSchema), asyncHandler(referralController.create));
referralRoutes.post('/validate-code', referralsRead, validateMiddleware(validateReferralCodeSchema), asyncHandler(referralController.validateCode));
referralRoutes.get('/:id', referralsRead, validateMiddleware(uuidParamSchema, 'params'), asyncHandler(referralController.getById));
referralRoutes.patch(
  '/:id',
  referralsWrite,
  validateMiddleware(uuidParamSchema, 'params'),
  validateMiddleware(updateReferralSchema),
  asyncHandler(referralController.update),
);
referralRoutes.post(
  '/:id/convert',
  referralsWrite,
  validateMiddleware(uuidParamSchema, 'params'),
  validateMiddleware(convertReferralSchema),
  asyncHandler(referralController.convert),
);
referralRoutes.post('/:id/approve-reward', referralsApprove, validateMiddleware(uuidParamSchema, 'params'), asyncHandler(referralController.approveReward));
referralRoutes.post('/:id/mark-paid', referralsApprove, validateMiddleware(uuidParamSchema, 'params'), asyncHandler(referralController.markRewardPaid));
referralRoutes.post(
  '/:id/reject',
  referralsApprove,
  validateMiddleware(uuidParamSchema, 'params'),
  validateMiddleware(rejectReferralSchema),
  asyncHandler(referralController.reject),
);
referralRoutes.post('/:id/cancel', referralsWrite, validateMiddleware(uuidParamSchema, 'params'), asyncHandler(referralController.cancel));
referralRoutes.delete('/:id', referralsWrite, validateMiddleware(uuidParamSchema, 'params'), asyncHandler(referralController.remove));

export const referralTypeRoutes = Router();
referralTypeRoutes.use(authenticateWithSessionMiddleware);
referralTypeRoutes.get('/', referralsRead, validateMiddleware(listReferralTypesQuerySchema, 'query'), asyncHandler(referralTypeController.list));
referralTypeRoutes.post('/', referralsWrite, validateMiddleware(createReferralTypeSchema), asyncHandler(referralTypeController.create));
referralTypeRoutes.get('/:id', referralsRead, validateMiddleware(uuidParamSchema, 'params'), asyncHandler(referralTypeController.getById));
referralTypeRoutes.patch(
  '/:id',
  referralsWrite,
  validateMiddleware(uuidParamSchema, 'params'),
  validateMiddleware(updateReferralTypeSchema),
  asyncHandler(referralTypeController.update),
);
referralTypeRoutes.post('/:id/deactivate', referralsWrite, validateMiddleware(uuidParamSchema, 'params'), asyncHandler(referralTypeController.deactivate));
