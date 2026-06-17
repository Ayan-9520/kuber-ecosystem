import type { Request, Response } from 'express';

import { paginatedResponse, successResponse } from '../../../shared/responses/success-response.js';
import { contentAnalyticsService } from '../services/content-analytics.service.js';
import { contentApprovalService } from '../services/content-approval.service.js';
import { contentFeedbackService } from '../services/content-feedback.service.js';
import { contentGenerationService } from '../services/content-generation.service.js';
import { contentHistoryService } from '../services/content-history.service.js';
import { contentTemplateService } from '../services/content-template.service.js';

function ctx(req: Request) {
  return {
    actorId: req.user!.id,
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
  };
}

export const contentController = {
  health: async (_req: Request, res: Response) => {
    res.json(successResponse({ module: 'content', status: 'ok' }));
  },

  generate: async (req: Request, res: Response) => {
    res.status(201).json(successResponse(await contentGenerationService.generate(req.user!, req.body, ctx(req))));
  },

  rewrite: async (req: Request, res: Response) => {
    res.status(201).json(successResponse(await contentGenerationService.rewrite(req.user!, req.body, ctx(req))));
  },

  summarize: async (req: Request, res: Response) => {
    res.status(201).json(successResponse(await contentGenerationService.summarize(req.user!, req.body, ctx(req))));
  },

  translate: async (req: Request, res: Response) => {
    res.status(201).json(successResponse(await contentGenerationService.translate(req.user!, req.body, ctx(req))));
  },

  listTemplates: async (req: Request, res: Response) => {
    const result = await contentTemplateService.list(req.user!, req.query as never);
    res.json(paginatedResponse(result.items, result.meta));
  },

  getTemplate: async (req: Request, res: Response) => {
    res.json(successResponse(await contentTemplateService.getById(req.user!, req.params.id as string)));
  },

  createTemplate: async (req: Request, res: Response) => {
    res.status(201).json(successResponse(await contentTemplateService.create(req.user!, req.body)));
  },

  updateTemplate: async (req: Request, res: Response) => {
    res.json(successResponse(await contentTemplateService.update(req.user!, req.params.id as string, req.body)));
  },

  history: async (req: Request, res: Response) => {
    const result = await contentHistoryService.list(req.user!, req.query as never);
    res.json(paginatedResponse(result.items, result.meta));
  },

  getHistoryItem: async (req: Request, res: Response) => {
    res.json(successResponse(await contentHistoryService.getById(req.user!, req.params.id as string)));
  },

  submitReview: async (req: Request, res: Response) => {
    res.json(successResponse(await contentHistoryService.submitForReview(req.user!, req.params.id as string)));
  },

  approve: async (req: Request, res: Response) => {
    res.json(
      successResponse(
        await contentApprovalService.approve(req.user!, req.body.requestId, req.body.comments, ctx(req)),
      ),
    );
  },

  reject: async (req: Request, res: Response) => {
    res.json(
      successResponse(
        await contentApprovalService.reject(req.user!, req.body.requestId, req.body.comments, ctx(req)),
      ),
    );
  },

  publish: async (req: Request, res: Response) => {
    res.json(
      successResponse(
        await contentApprovalService.publish(req.user!, req.body.requestId, req.body.channel, ctx(req)),
      ),
    );
  },

  approvalQueue: async (req: Request, res: Response) => {
    const page = Number(req.query.page ?? 1);
    const limit = Number(req.query.limit ?? 20);
    const result = await contentApprovalService.listPending(req.user!, page, limit);
    res.json(paginatedResponse(result.items, result.meta));
  },

  feedback: async (req: Request, res: Response) => {
    res.status(201).json(successResponse(await contentFeedbackService.submit(req.user!, req.body)));
  },

  analyticsDashboard: async (req: Request, res: Response) => {
    res.json(successResponse(await contentAnalyticsService.dashboard(req.user!, req.query as never)));
  },

  analytics: async (req: Request, res: Response) => {
    const result = await contentAnalyticsService.list(req.user!, req.query as never);
    res.json(paginatedResponse(result.items, result.meta));
  },
};
