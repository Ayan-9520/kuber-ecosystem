import type { Request, Response } from 'express';

import { successResponse } from '../../../shared/responses/success-response.js';
import { aiAdvisorService } from '../services/ai-advisor.service.js';
import type { RequestContext } from '../types/ai-advisor.types.js';

function ctx(req: Request): RequestContext {
  return {
    actorId: req.user!.id,
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
    requestId: req.requestId,
  };
}

export const aiAdvisorController = {
  health: async (_req: Request, res: Response) => {
    res.json(successResponse({ module: 'ai-advisor', agent: 'Kuber AI Advisor', status: 'ok' }));
  },

  chat: async (req: Request, res: Response) => {
    res.json(successResponse(await aiAdvisorService.chat(req.user!, req.body, ctx(req))));
  },

  context: async (req: Request, res: Response) => {
    const payload = req.method === 'GET' ? req.query : req.body;
    res.json(successResponse(await aiAdvisorService.getContext(req.user!, payload as never, ctx(req))));
  },

  recommendation: async (req: Request, res: Response) => {
    res.json(successResponse(await aiAdvisorService.getRecommendation(req.user!, req.body, ctx(req))));
  },

  eligibility: async (req: Request, res: Response) => {
    res.json(successResponse(await aiAdvisorService.assessEligibility(req.user!, req.body, ctx(req))));
  },

  listConversations: async (req: Request, res: Response) => {
    const limit = Number(req.query.limit ?? 20);
    res.json(successResponse(await aiAdvisorService.listConversations(req.user!, limit)));
  },
};
