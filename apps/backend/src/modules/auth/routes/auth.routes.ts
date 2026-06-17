import { emptyBodySchema, emptyQuerySchema } from '@kuberone/shared-validation';
import { Router } from 'express';

import { asyncHandler } from '../../../shared/middleware/async-handler.middleware.js';
import { authRateLimitMiddleware } from '../../../shared/middleware/auth-rate-limit.middleware.js';
import { authenticateWithSessionMiddleware } from '../../../shared/middleware/authenticate.middleware.js';
import { validateMiddleware } from '../../../shared/middleware/validate.middleware.js';
import { loginController } from '../controllers/login.controller.js';
import { otpController } from '../controllers/otp.controller.js';
import { sessionController } from '../controllers/session.controller.js';
import {
  changeMobileSendOtpSchema,
  changeMobileVerifySchema,
  loginSchema,
  refreshTokenSchema,
  sendOtpSchema,
  verifyOtpSchema,
} from '../validators/auth.validator.js';

export const authRoutes: Router = Router();

authRoutes.use(authRateLimitMiddleware);

authRoutes.post('/send-otp', validateMiddleware(sendOtpSchema), asyncHandler(otpController.sendOtp));
authRoutes.post('/verify-otp', validateMiddleware(verifyOtpSchema), asyncHandler(otpController.verifyOtp));
authRoutes.post('/login', validateMiddleware(loginSchema), asyncHandler(loginController.login));
authRoutes.post('/refresh', validateMiddleware(refreshTokenSchema), asyncHandler(sessionController.refresh));

authRoutes.post(
  '/logout',
  authenticateWithSessionMiddleware,
  validateMiddleware(refreshTokenSchema, 'body'),
  asyncHandler(sessionController.logout),
);

authRoutes.post(
  '/logout-all',
  authenticateWithSessionMiddleware,
  validateMiddleware(emptyBodySchema),
  asyncHandler(sessionController.logoutAll),
);

authRoutes.get(
  '/me',
  authenticateWithSessionMiddleware,
  validateMiddleware(emptyQuerySchema, 'query'),
  asyncHandler(sessionController.me),
);

authRoutes.post(
  '/change-mobile/send-otp',
  authenticateWithSessionMiddleware,
  validateMiddleware(changeMobileSendOtpSchema),
  asyncHandler(otpController.changeMobileSendOtp),
);

authRoutes.post(
  '/change-mobile/verify',
  authenticateWithSessionMiddleware,
  validateMiddleware(changeMobileVerifySchema),
  asyncHandler(otpController.changeMobileVerify),
);
