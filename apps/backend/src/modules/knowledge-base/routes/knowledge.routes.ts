import { Router } from 'express';

import { RBAC_PERMISSIONS } from '../../../shared/constants/rbac.constants.js';
import { asyncHandler } from '../../../shared/middleware/async-handler.middleware.js';
import { authenticateWithSessionMiddleware } from '../../../shared/middleware/authenticate.middleware.js';
import { requireAnyPermission } from '../../../shared/middleware/rbac.middleware.js';
import { validateMiddleware } from '../../../shared/middleware/validate.middleware.js';
import { knowledgeController } from '../controllers/knowledge.controller.js';
import {
  aiContextQuerySchema,
  analyticsQuerySchema,
  approvalActionSchema,
  articleParamSchema,
  createArticleSchema,
  createCategorySchema,
  createTagSchema,
  feedbackSchema,
  listApprovalsQuerySchema,
  listArticlesQuerySchema,
  listCategoriesQuerySchema,
  listReviewsQuerySchema,
  listTagsQuerySchema,
  reviewSchema,
  rollbackSchema,
  searchQuerySchema,
  updateArticleSchema,
  updateCategorySchema,
} from '../validators/knowledge.validator.js';

export const knowledgeRoutes: Router = Router();

const kbRead = requireAnyPermission(
  RBAC_PERMISSIONS.KNOWLEDGE_READ,
  'knowledge.read',
  RBAC_PERMISSIONS.COPILOT_READ,
);

const kbWrite = requireAnyPermission(
  RBAC_PERMISSIONS.KNOWLEDGE_WRITE,
  'knowledge.write',
);

const kbReview = requireAnyPermission(
  RBAC_PERMISSIONS.KNOWLEDGE_REVIEW,
  'knowledge.review',
);

const kbApprove = requireAnyPermission(
  RBAC_PERMISSIONS.KNOWLEDGE_APPROVE,
  'knowledge.approve',
  RBAC_PERMISSIONS.KNOWLEDGE_PUBLISH,
  'knowledge.publish',
);

const kbManage = requireAnyPermission(
  RBAC_PERMISSIONS.KNOWLEDGE_MANAGE,
  'knowledge.manage',
);

knowledgeRoutes.use(authenticateWithSessionMiddleware);

knowledgeRoutes.get('/health', asyncHandler(knowledgeController.health));

// AI Context — accessible to AI modules
knowledgeRoutes.get(
  '/context',
  kbRead,
  validateMiddleware(aiContextQuerySchema, 'query'),
  asyncHandler(knowledgeController.aiContext),
);

// Categories
knowledgeRoutes.get(
  '/categories',
  kbRead,
  validateMiddleware(listCategoriesQuerySchema, 'query'),
  asyncHandler(knowledgeController.listCategories),
);

knowledgeRoutes.post(
  '/categories',
  kbManage,
  validateMiddleware(createCategorySchema),
  asyncHandler(knowledgeController.createCategory),
);

knowledgeRoutes.patch(
  '/categories/:id',
  kbManage,
  validateMiddleware(updateCategorySchema),
  asyncHandler(knowledgeController.updateCategory),
);

// Articles
knowledgeRoutes.get(
  '/articles',
  kbRead,
  validateMiddleware(listArticlesQuerySchema, 'query'),
  asyncHandler(knowledgeController.listArticles),
);

knowledgeRoutes.get(
  '/articles/:id',
  kbRead,
  validateMiddleware(articleParamSchema, 'params'),
  asyncHandler(knowledgeController.getArticle),
);

knowledgeRoutes.post(
  '/articles',
  kbWrite,
  validateMiddleware(createArticleSchema),
  asyncHandler(knowledgeController.createArticle),
);

knowledgeRoutes.patch(
  '/articles/:id',
  kbWrite,
  validateMiddleware(updateArticleSchema),
  asyncHandler(knowledgeController.updateArticle),
);

knowledgeRoutes.post(
  '/articles/:id/rollback',
  kbManage,
  validateMiddleware(rollbackSchema),
  asyncHandler(knowledgeController.rollbackArticle),
);

// Search
knowledgeRoutes.get(
  '/search',
  kbRead,
  validateMiddleware(searchQuerySchema, 'query'),
  asyncHandler(knowledgeController.search),
);

// Tags
knowledgeRoutes.get(
  '/tags',
  kbRead,
  validateMiddleware(listTagsQuerySchema, 'query'),
  asyncHandler(knowledgeController.listTags),
);

knowledgeRoutes.post(
  '/tags',
  kbManage,
  validateMiddleware(createTagSchema),
  asyncHandler(knowledgeController.createTag),
);

// Feedback
knowledgeRoutes.post(
  '/feedback',
  kbRead,
  validateMiddleware(feedbackSchema),
  asyncHandler(knowledgeController.addFeedback),
);

// Reviews
knowledgeRoutes.get(
  '/reviews',
  kbReview,
  validateMiddleware(listReviewsQuerySchema, 'query'),
  asyncHandler(knowledgeController.listReviews),
);

knowledgeRoutes.post(
  '/reviews',
  kbReview,
  validateMiddleware(reviewSchema),
  asyncHandler(knowledgeController.createReview),
);

// Approvals
knowledgeRoutes.get(
  '/approvals',
  kbApprove,
  validateMiddleware(listApprovalsQuerySchema, 'query'),
  asyncHandler(knowledgeController.listApprovals),
);

knowledgeRoutes.post(
  '/approvals',
  kbApprove,
  validateMiddleware(approvalActionSchema),
  asyncHandler(knowledgeController.submitApproval),
);

// Analytics
knowledgeRoutes.get(
  '/analytics',
  kbRead,
  validateMiddleware(analyticsQuerySchema, 'query'),
  asyncHandler(knowledgeController.analytics),
);
