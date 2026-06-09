import type { Request, Response } from 'express';

import { successResponse } from '../../../shared/responses/success-response.js';
import {
  knowledgeAnalyticsService,
  knowledgeApprovalService,
  knowledgeArticleService,
  knowledgeCategoryService,
  knowledgeContextService,
  knowledgeSearchService,
  knowledgeTagService,
} from '../services/knowledge.service.js';
import type { RequestContext } from '../types/knowledge-base.types.js';

function ctx(req: Request): RequestContext {
  return {
    actorId: req.user!.id,
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
    requestId: req.requestId,
  };
}

function actorRole(req: Request): string {
  return req.user!.roles[0] ?? 'USER';
}

export const knowledgeController = {
  health: async (_req: Request, res: Response) => {
    res.json(successResponse({ module: 'knowledge-base', engine: 'KuberOne AI Knowledge Base', status: 'ok' }));
  },

  // Categories
  listCategories: async (req: Request, res: Response) => {
    res.json(successResponse(await knowledgeCategoryService.list(req.query as never)));
  },

  createCategory: async (req: Request, res: Response) => {
    res.status(201).json(successResponse(await knowledgeCategoryService.create(req.body, ctx(req))));
  },

  updateCategory: async (req: Request, res: Response) => {
    res.json(successResponse(await knowledgeCategoryService.update(req.params.id as string, req.body, ctx(req))));
  },

  // Articles
  listArticles: async (req: Request, res: Response) => {
    res.json(successResponse(await knowledgeArticleService.list(req.query as never)));
  },

  getArticle: async (req: Request, res: Response) => {
    res.json(successResponse(await knowledgeArticleService.getById(req.params.id as string, ctx(req), 'CRM')));
  },

  createArticle: async (req: Request, res: Response) => {
    res.status(201).json(successResponse(await knowledgeArticleService.create(req.body, req.user!.id, ctx(req))));
  },

  updateArticle: async (req: Request, res: Response) => {
    res.json(successResponse(await knowledgeArticleService.update(req.params.id as string, req.body, req.user!.id, ctx(req))));
  },

  rollbackArticle: async (req: Request, res: Response) => {
    res.json(successResponse(
      await knowledgeApprovalService.rollback(req.params.id as string, req.body.version, req.user!.id, ctx(req)),
    ));
  },

  // Search
  search: async (req: Request, res: Response) => {
    res.json(successResponse(await knowledgeSearchService.search(req.query as never, ctx(req))));
  },

  // Tags
  listTags: async (req: Request, res: Response) => {
    res.json(successResponse(await knowledgeTagService.list(req.query as never)));
  },

  createTag: async (req: Request, res: Response) => {
    res.status(201).json(successResponse(await knowledgeTagService.create(req.body, ctx(req))));
  },

  // Feedback
  addFeedback: async (req: Request, res: Response) => {
    res.status(201).json(successResponse(
      await knowledgeArticleService.addFeedback(
        req.body.articleId,
        req.user!.id,
        req.body.rating,
        req.body.comment,
        req.body.helpful,
        ctx(req),
      ),
    ));
  },

  // Reviews
  listReviews: async (req: Request, res: Response) => {
    res.json(successResponse(await knowledgeApprovalService.listReviews(req.query as never)));
  },

  createReview: async (req: Request, res: Response) => {
    res.status(201).json(successResponse(await knowledgeApprovalService.createReview(req.body, req.user!.id, ctx(req))));
  },

  // Approvals
  listApprovals: async (req: Request, res: Response) => {
    res.json(successResponse(await knowledgeApprovalService.listQueue(req.query as never)));
  },

  submitApproval: async (req: Request, res: Response) => {
    res.status(201).json(successResponse(
      await knowledgeApprovalService.submitAction(req.body, req.user!.id, actorRole(req), ctx(req)),
    ));
  },

  // AI Context
  aiContext: async (req: Request, res: Response) => {
    res.json(successResponse(await knowledgeContextService.buildForAi(req.query as never)));
  },

  // Analytics
  analytics: async (req: Request, res: Response) => {
    res.json(successResponse(await knowledgeAnalyticsService.getAnalytics(req.query as never)));
  },
};
