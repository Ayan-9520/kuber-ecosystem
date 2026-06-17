import { Router } from 'express';

import { RBAC_PERMISSIONS } from '../../../shared/constants/rbac.constants.js';
import { asyncHandler } from '../../../shared/middleware/async-handler.middleware.js';
import { authenticateWithSessionMiddleware } from '../../../shared/middleware/authenticate.middleware.js';
import { requireAnyPermission } from '../../../shared/middleware/rbac.middleware.js';
import { validateMiddleware } from '../../../shared/middleware/validate.middleware.js';
import { contentController } from '../controllers/content.controller.js';
import {
  contentAnalyticsQuerySchema,
  contentApprovalSchema,
  contentFeedbackSchema,
  contentGenerateSchema,
  contentIdParamSchema,
  contentPublishSchema,
  contentRewriteSchema,
  contentSummarizeSchema,
  contentTranslateSchema,
  createContentTemplateSchema,
  listContentHistoryQuerySchema,
  listContentTemplatesQuerySchema,
  updateContentTemplateSchema,
} from '../validators/content.validator.js';

export const contentRoutes: Router = Router();

const contentRead = requireAnyPermission(RBAC_PERMISSIONS.CONTENT_READ, 'content.read');
const contentWrite = requireAnyPermission(RBAC_PERMISSIONS.CONTENT_WRITE, 'content.write');
const contentApprove = requireAnyPermission(RBAC_PERMISSIONS.CONTENT_APPROVE, 'content.approve');
const contentPublish = requireAnyPermission(RBAC_PERMISSIONS.CONTENT_PUBLISH, 'content.publish');
const contentAnalytics = requireAnyPermission(RBAC_PERMISSIONS.CONTENT_ANALYTICS, 'content.analytics');
const contentManage = requireAnyPermission(RBAC_PERMISSIONS.CONTENT_MANAGE, 'content.manage');

contentRoutes.use(authenticateWithSessionMiddleware);

contentRoutes.get('/health', asyncHandler(contentController.health));

contentRoutes.post('/generate', contentWrite, validateMiddleware(contentGenerateSchema), asyncHandler(contentController.generate));
contentRoutes.post('/rewrite', contentWrite, validateMiddleware(contentRewriteSchema), asyncHandler(contentController.rewrite));
contentRoutes.post('/summarize', contentWrite, validateMiddleware(contentSummarizeSchema), asyncHandler(contentController.summarize));
contentRoutes.post('/translate', contentWrite, validateMiddleware(contentTranslateSchema), asyncHandler(contentController.translate));

contentRoutes.get('/templates', contentRead, validateMiddleware(listContentTemplatesQuerySchema, 'query'), asyncHandler(contentController.listTemplates));
contentRoutes.post('/templates', contentManage, validateMiddleware(createContentTemplateSchema), asyncHandler(contentController.createTemplate));
contentRoutes.get('/templates/:id', contentRead, validateMiddleware(contentIdParamSchema, 'params'), asyncHandler(contentController.getTemplate));
contentRoutes.patch('/templates/:id', contentManage, validateMiddleware(updateContentTemplateSchema), asyncHandler(contentController.updateTemplate));

contentRoutes.get('/history', contentRead, validateMiddleware(listContentHistoryQuerySchema, 'query'), asyncHandler(contentController.history));
contentRoutes.get('/history/:id', contentRead, validateMiddleware(contentIdParamSchema, 'params'), asyncHandler(contentController.getHistoryItem));
contentRoutes.post('/history/:id/review', contentWrite, validateMiddleware(contentIdParamSchema, 'params'), asyncHandler(contentController.submitReview));

contentRoutes.get('/approvals', contentApprove, asyncHandler(contentController.approvalQueue));
contentRoutes.post('/approve', contentApprove, validateMiddleware(contentApprovalSchema), asyncHandler(contentController.approve));
contentRoutes.post('/reject', contentApprove, validateMiddleware(contentApprovalSchema), asyncHandler(contentController.reject));
contentRoutes.post('/publish', contentPublish, validateMiddleware(contentPublishSchema), asyncHandler(contentController.publish));

contentRoutes.post('/feedback', contentWrite, validateMiddleware(contentFeedbackSchema), asyncHandler(contentController.feedback));

contentRoutes.get('/analytics/dashboard', contentAnalytics, validateMiddleware(contentAnalyticsQuerySchema, 'query'), asyncHandler(contentController.analyticsDashboard));
contentRoutes.get('/analytics', contentAnalytics, validateMiddleware(contentAnalyticsQuerySchema, 'query'), asyncHandler(contentController.analytics));
