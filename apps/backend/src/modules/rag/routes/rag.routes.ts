import { Router } from 'express';

import { RBAC_PERMISSIONS } from '../../../shared/constants/rbac.constants.js';
import { asyncHandler } from '../../../shared/middleware/async-handler.middleware.js';
import { authenticateWithSessionMiddleware } from '../../../shared/middleware/authenticate.middleware.js';
import { requireAnyPermission } from '../../../shared/middleware/rbac.middleware.js';
import { validateMiddleware } from '../../../shared/middleware/validate.middleware.js';
import { ragController } from '../controllers/rag.controller.js';
import {
  analyticsQuerySchema,
  contextSchema,
  documentParamSchema,
  feedbackSchema,
  ingestAllPublishedSchema,
  ingestArticleSchema,
  ingestSchema,
  listDocumentsQuerySchema,
  querySchema,
  searchSchema,
} from '../validators/rag.validator.js';

export const ragRoutes: Router = Router();

const ragRead = requireAnyPermission(
  RBAC_PERMISSIONS.RAG_READ,
  'rag.read',
  RBAC_PERMISSIONS.KNOWLEDGE_READ,
  RBAC_PERMISSIONS.COPILOT_READ,
);

const ragWrite = requireAnyPermission(
  RBAC_PERMISSIONS.RAG_WRITE,
  'rag.write',
  RBAC_PERMISSIONS.KNOWLEDGE_MANAGE,
);

const ragManage = requireAnyPermission(
  RBAC_PERMISSIONS.RAG_MANAGE,
  'rag.manage',
  RBAC_PERMISSIONS.KNOWLEDGE_MANAGE,
);

ragRoutes.use(authenticateWithSessionMiddleware);

ragRoutes.get('/health', asyncHandler(ragController.health));

ragRoutes.post('/ingest', ragWrite, validateMiddleware(ingestSchema), asyncHandler(ragController.ingest));
ragRoutes.post('/ingest/article', ragWrite, validateMiddleware(ingestArticleSchema), asyncHandler(ragController.ingestArticle));
ragRoutes.post('/ingest/published', ragManage, validateMiddleware(ingestAllPublishedSchema), asyncHandler(ragController.ingestAllPublished));

ragRoutes.get('/documents', ragRead, validateMiddleware(listDocumentsQuerySchema, 'query'), asyncHandler(ragController.listDocuments));
ragRoutes.get('/documents/:id', ragRead, validateMiddleware(documentParamSchema, 'params'), asyncHandler(ragController.getDocument));

ragRoutes.get('/search', ragRead, validateMiddleware(searchSchema, 'query'), asyncHandler(ragController.search));
ragRoutes.post('/query', ragRead, validateMiddleware(querySchema), asyncHandler(ragController.query));
ragRoutes.get('/context', ragRead, validateMiddleware(contextSchema, 'query'), asyncHandler(ragController.context));

ragRoutes.post('/feedback', ragRead, validateMiddleware(feedbackSchema), asyncHandler(ragController.feedback));
ragRoutes.get('/analytics', ragRead, validateMiddleware(analyticsQuerySchema, 'query'), asyncHandler(ragController.analytics));
