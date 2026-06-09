import { Router } from 'express';

import { RBAC_PERMISSIONS } from '../../../shared/constants/rbac.constants.js';
import { asyncHandler } from '../../../shared/middleware/async-handler.middleware.js';
import { authenticateWithSessionMiddleware } from '../../../shared/middleware/authenticate.middleware.js';
import { requireAnyPermission } from '../../../shared/middleware/rbac.middleware.js';
import { validateMiddleware } from '../../../shared/middleware/validate.middleware.js';
import { aiPlatformController } from '../controllers/ai-platform.controller.js';
import {
  chatSchema,
  completionSchema,
  embeddingSchema,
  modelsQuerySchema,
  speechSchema,
  transcribeSchema,
  usageQuerySchema,
} from '../validators/ai-platform.validator.js';

export const aiPlatformRoutes: Router = Router();

const aiRead = requireAnyPermission(
  RBAC_PERMISSIONS.AI_READ,
  'ai.read',
  RBAC_PERMISSIONS.ELIGIBILITY_READ,
  'eligibility.read',
  RBAC_PERMISSIONS.COPILOT_READ,
  'copilot.read',
  RBAC_PERMISSIONS.RAG_READ,
  'rag.read',
  RBAC_PERMISSIONS.ANALYTICS_READ,
  'analytics.read',
);

const aiWrite = requireAnyPermission(
  RBAC_PERMISSIONS.AI_WRITE,
  'ai.write',
  RBAC_PERMISSIONS.AI_MANAGE,
  'ai.manage',
);

const aiManage = requireAnyPermission(
  RBAC_PERMISSIONS.AI_MANAGE,
  'ai.manage',
);

aiPlatformRoutes.use(authenticateWithSessionMiddleware);

aiPlatformRoutes.get('/health', asyncHandler(aiPlatformController.health));
aiPlatformRoutes.post('/chat', aiRead, validateMiddleware(chatSchema), asyncHandler(aiPlatformController.chat));
aiPlatformRoutes.post('/completion', aiRead, validateMiddleware(completionSchema), asyncHandler(aiPlatformController.completion));
aiPlatformRoutes.post('/embedding', aiWrite, validateMiddleware(embeddingSchema), asyncHandler(aiPlatformController.embedding));
aiPlatformRoutes.post('/transcribe', aiWrite, validateMiddleware(transcribeSchema), asyncHandler(aiPlatformController.transcribe));
aiPlatformRoutes.post('/speech', aiRead, validateMiddleware(speechSchema), asyncHandler(aiPlatformController.speech));
aiPlatformRoutes.get('/models', aiRead, validateMiddleware(modelsQuerySchema, 'query'), asyncHandler(aiPlatformController.models));
aiPlatformRoutes.get('/prompts', aiManage, asyncHandler(aiPlatformController.prompts));
aiPlatformRoutes.get('/usage', aiManage, validateMiddleware(usageQuerySchema, 'query'), asyncHandler(aiPlatformController.usage));
aiPlatformRoutes.get('/costs', aiManage, validateMiddleware(usageQuerySchema, 'query'), asyncHandler(aiPlatformController.costs));
aiPlatformRoutes.get('/errors', aiManage, asyncHandler(aiPlatformController.errors));
