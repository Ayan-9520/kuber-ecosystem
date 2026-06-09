import { Router } from 'express';

import { RBAC_PERMISSIONS } from '../../../shared/constants/rbac.constants.js';
import { asyncHandler } from '../../../shared/middleware/async-handler.middleware.js';
import { authenticateWithSessionMiddleware } from '../../../shared/middleware/authenticate.middleware.js';
import { requireAnyPermission } from '../../../shared/middleware/rbac.middleware.js';
import { validateMiddleware } from '../../../shared/middleware/validate.middleware.js';
import { voiceAiController } from '../controllers/voice-ai.controller.js';
import {
  createVoiceSessionSchema,
  voiceAudioSchema,
  voiceMessageSchema,
  voiceSessionIdSchema,
} from '../validators/voice-ai.validator.js';

export const voiceAiRoutes: Router = Router();

const voiceAccess = requireAnyPermission(
  RBAC_PERMISSIONS.ELIGIBILITY_READ,
  'eligibility.read',
  RBAC_PERMISSIONS.EMI_READ,
  'emi.read',
  RBAC_PERMISSIONS.LEADS_READ,
  'leads.read',
  RBAC_PERMISSIONS.APPLICATIONS_READ,
  'applications.read',
  RBAC_PERMISSIONS.CUSTOMERS_READ,
  'customers.read',
  RBAC_PERMISSIONS.ANALYTICS_READ,
  'analytics.read',
);

voiceAiRoutes.use(authenticateWithSessionMiddleware);

voiceAiRoutes.get('/health', asyncHandler(voiceAiController.health));

voiceAiRoutes.post(
  '/sessions',
  voiceAccess,
  validateMiddleware(createVoiceSessionSchema),
  asyncHandler(voiceAiController.createSession),
);

voiceAiRoutes.get(
  '/sessions/:sessionId',
  voiceAccess,
  validateMiddleware(voiceSessionIdSchema, 'params'),
  asyncHandler(voiceAiController.getSession),
);

voiceAiRoutes.post(
  '/sessions/:sessionId/end',
  voiceAccess,
  validateMiddleware(voiceSessionIdSchema, 'params'),
  asyncHandler(voiceAiController.endSession),
);

voiceAiRoutes.post(
  '/sessions/:sessionId/audio',
  voiceAccess,
  validateMiddleware(voiceSessionIdSchema, 'params'),
  validateMiddleware(voiceAudioSchema),
  asyncHandler(voiceAiController.receiveAudio),
);

voiceAiRoutes.post(
  '/sessions/:sessionId/message',
  voiceAccess,
  validateMiddleware(voiceSessionIdSchema, 'params'),
  validateMiddleware(voiceMessageSchema),
  asyncHandler(voiceAiController.sendMessage),
);
