import { Router } from 'express';

import { RBAC_PERMISSIONS } from '../../../shared/constants/rbac.constants.js';
import { asyncHandler } from '../../../shared/middleware/async-handler.middleware.js';
import { authenticateWithSessionMiddleware } from '../../../shared/middleware/authenticate.middleware.js';
import { requireAnyPermission } from '../../../shared/middleware/rbac.middleware.js';
import { validateMiddleware } from '../../../shared/middleware/validate.middleware.js';
import { aiAdvisorController } from '../controllers/ai-advisor.controller.js';
import {
  aiChatSchema,
  aiContextSchema,
  aiEligibilitySchema,
  aiRecommendationSchema,
} from '../validators/ai-advisor.validator.js';

export const aiAdvisorRoutes: Router = Router();

const aiAccess = requireAnyPermission(
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

aiAdvisorRoutes.use(authenticateWithSessionMiddleware);

aiAdvisorRoutes.get('/advisor/health', asyncHandler(aiAdvisorController.health));

aiAdvisorRoutes.post('/chat', aiAccess, validateMiddleware(aiChatSchema), asyncHandler(aiAdvisorController.chat));

aiAdvisorRoutes.get(
  '/context',
  aiAccess,
  validateMiddleware(aiContextSchema, 'query'),
  asyncHandler(aiAdvisorController.context),
);

aiAdvisorRoutes.post(
  '/context',
  aiAccess,
  validateMiddleware(aiContextSchema),
  asyncHandler(aiAdvisorController.context),
);

aiAdvisorRoutes.post(
  '/recommendation',
  aiAccess,
  validateMiddleware(aiRecommendationSchema),
  asyncHandler(aiAdvisorController.recommendation),
);

aiAdvisorRoutes.post(
  '/eligibility',
  aiAccess,
  validateMiddleware(aiEligibilitySchema),
  asyncHandler(aiAdvisorController.eligibility),
);

aiAdvisorRoutes.get('/conversations', aiAccess, asyncHandler(aiAdvisorController.listConversations));
