import type { Request, Response } from 'express';

import { successResponse } from '../../../shared/responses/success-response.js';
import { aiCopilotService } from '../services/ai-copilot.service.js';
import type { RequestContext } from '../types/ai-copilot.types.js';

function ctx(req: Request): RequestContext {
  return {
    actorId: req.user!.id,
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
    requestId: req.requestId,
  };
}

export const aiCopilotController = {
  health: async (_req: Request, res: Response) => {
    res.json(successResponse({ module: 'ai-copilot', agent: 'Kuber AI Sales Copilot', status: 'ok' }));
  },

  analyzeLead: async (req: Request, res: Response) => {
    res.json(successResponse(await aiCopilotService.analyzeLead(req.user!, req.params.id as string, ctx(req))));
  },

  analyzeApplication: async (req: Request, res: Response) => {
    res.json(successResponse(await aiCopilotService.analyzeApplication(req.user!, req.params.id as string, ctx(req))));
  },

  analyzeCustomer: async (req: Request, res: Response) => {
    res.json(successResponse(await aiCopilotService.analyzeCustomer(req.user!, req.params.id as string, ctx(req))));
  },

  analyzeExecutive: async (req: Request, res: Response) => {
    res.json(successResponse(await aiCopilotService.analyzeExecutive(req.user!, req.params.id as string, ctx(req))));
  },

  analyzeBranch: async (req: Request, res: Response) => {
    res.json(successResponse(await aiCopilotService.analyzeBranch(req.user!, req.params.id as string, ctx(req))));
  },

  listRecommendations: async (req: Request, res: Response) => {
    res.json(successResponse(await aiCopilotService.listRecommendations(req.user!, req.query as never)));
  },

  listInsights: async (req: Request, res: Response) => {
    res.json(successResponse(await aiCopilotService.listInsights(req.user!, req.query as never)));
  },

  submitFeedback: async (req: Request, res: Response) => {
    res.status(201).json(successResponse(await aiCopilotService.submitFeedback(req.user!, req.body, ctx(req))));
  },

  analytics: async (req: Request, res: Response) => {
    res.json(successResponse(await aiCopilotService.getAnalytics(req.user!, req.query as never)));
  },
};
