import { Router } from 'express';

import { RBAC_PERMISSIONS } from '../../../shared/constants/rbac.constants.js';
import { asyncHandler } from '../../../shared/middleware/async-handler.middleware.js';
import { authenticateWithSessionMiddleware } from '../../../shared/middleware/authenticate.middleware.js';
import { requireAnyPermission } from '../../../shared/middleware/rbac.middleware.js';
import { validateMiddleware } from '../../../shared/middleware/validate.middleware.js';
import { leadScoringController } from '../controllers/lead-scoring.controller.js';
import {
  bulkCalculateSchema,
  createScoringRuleSchema,
  leadScoringEntityParamSchema,
  listScoringRulesQuerySchema,
  listWeightConfigsQuerySchema,
  scoringAnalyticsQuerySchema,
  updateScoringRuleSchema,
  upsertWeightConfigSchema,
} from '../validators/lead-scoring.validator.js';

export const leadScoringRoutes: Router = Router();

const scoringRead = requireAnyPermission(
  RBAC_PERMISSIONS.LEADS_READ,
  'leads.read',
  RBAC_PERMISSIONS.ANALYTICS_READ,
  'analytics.read',
  'lead_scoring.read',
);

const scoringWrite = requireAnyPermission(
  RBAC_PERMISSIONS.LEADS_WRITE,
  'leads.write',
  'lead_scoring.write',
);

const scoringAdmin = requireAnyPermission(
  RBAC_PERMISSIONS.LEADS_WRITE,
  'leads.write',
  'lead_scoring.configure',
);

leadScoringRoutes.use(authenticateWithSessionMiddleware);

leadScoringRoutes.get('/health', asyncHandler(leadScoringController.health));

leadScoringRoutes.get(
  '/calculate/:leadId',
  scoringRead,
  validateMiddleware(leadScoringEntityParamSchema, 'params'),
  asyncHandler(leadScoringController.calculate),
);

leadScoringRoutes.post(
  '/bulk-calculate',
  scoringWrite,
  validateMiddleware(bulkCalculateSchema),
  asyncHandler(leadScoringController.bulkCalculate),
);

leadScoringRoutes.get(
  '/history/:leadId',
  scoringRead,
  validateMiddleware(leadScoringEntityParamSchema, 'params'),
  asyncHandler(leadScoringController.history),
);

leadScoringRoutes.get(
  '/rules',
  scoringAdmin,
  validateMiddleware(listScoringRulesQuerySchema, 'query'),
  asyncHandler(leadScoringController.listRules),
);

leadScoringRoutes.post(
  '/rules',
  scoringAdmin,
  validateMiddleware(createScoringRuleSchema),
  asyncHandler(leadScoringController.createRule),
);

leadScoringRoutes.patch(
  '/rules/:id',
  scoringAdmin,
  validateMiddleware(updateScoringRuleSchema),
  asyncHandler(leadScoringController.updateRule),
);

leadScoringRoutes.get(
  '/weights',
  scoringAdmin,
  validateMiddleware(listWeightConfigsQuerySchema, 'query'),
  asyncHandler(leadScoringController.listWeights),
);

leadScoringRoutes.post(
  '/weights',
  scoringAdmin,
  validateMiddleware(upsertWeightConfigSchema),
  asyncHandler(leadScoringController.upsertWeights),
);

leadScoringRoutes.get(
  '/analytics',
  scoringRead,
  validateMiddleware(scoringAnalyticsQuerySchema, 'query'),
  asyncHandler(leadScoringController.analytics),
);
