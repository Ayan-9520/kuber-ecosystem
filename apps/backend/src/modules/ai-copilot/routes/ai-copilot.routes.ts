import { Router } from 'express';

import { RBAC_PERMISSIONS } from '../../../shared/constants/rbac.constants.js';
import { asyncHandler } from '../../../shared/middleware/async-handler.middleware.js';
import { authenticateWithSessionMiddleware } from '../../../shared/middleware/authenticate.middleware.js';
import { requireAnyPermission } from '../../../shared/middleware/rbac.middleware.js';
import { validateMiddleware } from '../../../shared/middleware/validate.middleware.js';
import { aiCopilotController } from '../controllers/ai-copilot.controller.js';
import {
  copilotAnalyticsQuerySchema,
  copilotEntityParamSchema,
  copilotFeedbackSchema,
  copilotInsightsQuerySchema,
  copilotRecommendationsQuerySchema,
} from '../validators/ai-copilot.validator.js';

export const aiCopilotRoutes: Router = Router();

const copilotAccess = requireAnyPermission(
  RBAC_PERMISSIONS.COPILOT_READ,
  'copilot.read',
  RBAC_PERMISSIONS.LEADS_READ,
  'leads.read',
  RBAC_PERMISSIONS.APPLICATIONS_READ,
  'applications.read',
  RBAC_PERMISSIONS.CUSTOMERS_READ,
  'customers.read',
  RBAC_PERMISSIONS.ELIGIBILITY_READ,
  'eligibility.read',
  RBAC_PERMISSIONS.ANALYTICS_READ,
  'analytics.read',
);

aiCopilotRoutes.use(authenticateWithSessionMiddleware);

aiCopilotRoutes.get('/health', asyncHandler(aiCopilotController.health));

aiCopilotRoutes.get(
  '/lead/:id',
  copilotAccess,
  validateMiddleware(copilotEntityParamSchema, 'params'),
  asyncHandler(aiCopilotController.analyzeLead),
);

aiCopilotRoutes.get(
  '/application/:id',
  copilotAccess,
  validateMiddleware(copilotEntityParamSchema, 'params'),
  asyncHandler(aiCopilotController.analyzeApplication),
);

aiCopilotRoutes.get(
  '/customer/:id',
  copilotAccess,
  validateMiddleware(copilotEntityParamSchema, 'params'),
  asyncHandler(aiCopilotController.analyzeCustomer),
);

aiCopilotRoutes.get(
  '/executive/:id',
  copilotAccess,
  validateMiddleware(copilotEntityParamSchema, 'params'),
  asyncHandler(aiCopilotController.analyzeExecutive),
);

aiCopilotRoutes.get(
  '/branch/:id',
  copilotAccess,
  validateMiddleware(copilotEntityParamSchema, 'params'),
  asyncHandler(aiCopilotController.analyzeBranch),
);

aiCopilotRoutes.get(
  '/recommendations',
  copilotAccess,
  validateMiddleware(copilotRecommendationsQuerySchema, 'query'),
  asyncHandler(aiCopilotController.listRecommendations),
);

aiCopilotRoutes.get(
  '/insights',
  copilotAccess,
  validateMiddleware(copilotInsightsQuerySchema, 'query'),
  asyncHandler(aiCopilotController.listInsights),
);

aiCopilotRoutes.post(
  '/feedback',
  copilotAccess,
  validateMiddleware(copilotFeedbackSchema),
  asyncHandler(aiCopilotController.submitFeedback),
);

aiCopilotRoutes.get(
  '/analytics',
  copilotAccess,
  validateMiddleware(copilotAnalyticsQuerySchema, 'query'),
  asyncHandler(aiCopilotController.analytics),
);
