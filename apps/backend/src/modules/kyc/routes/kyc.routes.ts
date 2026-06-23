import { Router } from 'express';

import { RBAC_PERMISSIONS } from '../../../shared/constants/rbac.constants.js';
import { asyncHandler } from '../../../shared/middleware/async-handler.middleware.js';
import { authenticateWithSessionMiddleware } from '../../../shared/middleware/authenticate.middleware.js';
import { requireAnyPermission } from '../../../shared/middleware/rbac.middleware.js';
import { validateMiddleware } from '../../../shared/middleware/validate.middleware.js';
import {
  aadhaarController,
  kycProfileController,
  panController,
} from '../controllers/kyc.controller.js';
import {
  aadhaarSendOtpSchema,
  aadhaarVerifySchema,
  kycEntityQuerySchema,
  listKycAuditQuerySchema,
  submitPanSchema,
  upsertKycProfileSchema,
} from '../validators/kyc.validator.js';

const kycRead = requireAnyPermission(
  RBAC_PERMISSIONS.KYC_READ,
  'kyc.read:own',
  'kyc.read:all',
  RBAC_PERMISSIONS.CUSTOMERS_READ,
);
const kycWrite = requireAnyPermission(
  RBAC_PERMISSIONS.KYC_WRITE,
  'kyc.update:own',
  'kyc.write',
  RBAC_PERMISSIONS.CUSTOMERS_WRITE,
);

export const kycRoutes: Router = Router();

kycRoutes.use(authenticateWithSessionMiddleware);

kycRoutes.get('/profile', kycRead, validateMiddleware(kycEntityQuerySchema, 'query'), asyncHandler(kycProfileController.get));
kycRoutes.post('/profile', kycWrite, validateMiddleware(upsertKycProfileSchema), asyncHandler(kycProfileController.upsert));
kycRoutes.put('/profile', kycWrite, validateMiddleware(upsertKycProfileSchema), asyncHandler(kycProfileController.upsert));
kycRoutes.get('/profile/audit', kycRead, validateMiddleware(listKycAuditQuerySchema, 'query'), asyncHandler(kycProfileController.listAudit));

kycRoutes.post('/pan', kycWrite, validateMiddleware(submitPanSchema), asyncHandler(panController.submit));
kycRoutes.get('/pan', kycRead, validateMiddleware(kycEntityQuerySchema, 'query'), asyncHandler(panController.list));

kycRoutes.post('/aadhaar/send-otp', kycWrite, validateMiddleware(aadhaarSendOtpSchema), asyncHandler(aadhaarController.sendOtp));
kycRoutes.post('/aadhaar/verify', kycWrite, validateMiddleware(aadhaarVerifySchema), asyncHandler(aadhaarController.verify));
kycRoutes.get('/aadhaar', kycRead, validateMiddleware(kycEntityQuerySchema, 'query'), asyncHandler(aadhaarController.list));
