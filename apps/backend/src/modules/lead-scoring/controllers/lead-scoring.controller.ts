import type { Request, Response } from 'express';

import { successResponse } from '../../../shared/responses/success-response.js';
import { leadScoringService } from '../services/lead-scoring.service.js';
import type { RequestContext } from '../types/lead-scoring.types.js';

function ctx(req: Request): RequestContext {
  return {
    actorId: req.user!.id,
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
    requestId: req.requestId,
  };
}

export const leadScoringController = {
  health: async (_req: Request, res: Response) => {
    res.json(successResponse({ module: 'lead-scoring', engine: 'KuberOne AI Lead Scoring', status: 'ok' }));
  },

  calculate: async (req: Request, res: Response) => {
    res.json(
      successResponse(
        await leadScoringService.calculate(req.user!, req.params.leadId as string, ctx(req), {
          aiScore: req.query.aiScore ? Number(req.query.aiScore) : undefined,
          force: req.query.force === 'true',
        }),
      ),
    );
  },

  bulkCalculate: async (req: Request, res: Response) => {
    res.status(201).json(successResponse(await leadScoringService.bulkCalculate(req.user!, req.body, ctx(req))));
  },

  history: async (req: Request, res: Response) => {
    res.json(successResponse(await leadScoringService.getHistory(req.user!, req.params.leadId as string)));
  },

  listRules: async (req: Request, res: Response) => {
    res.json(successResponse(await leadScoringService.rules.list(req.query as never)));
  },

  createRule: async (req: Request, res: Response) => {
    res.status(201).json(successResponse(await leadScoringService.rules.create(req.body, ctx(req))));
  },

  updateRule: async (req: Request, res: Response) => {
    res.json(successResponse(await leadScoringService.rules.update(req.params.id as string, req.body, ctx(req))));
  },

  listWeights: async (req: Request, res: Response) => {
    res.json(successResponse(await leadScoringService.weights.list(req.query as never)));
  },

  upsertWeights: async (req: Request, res: Response) => {
    res.json(successResponse(await leadScoringService.weights.upsert(req.body, ctx(req))));
  },

  analytics: async (req: Request, res: Response) => {
    res.json(successResponse(await leadScoringService.getAnalytics(req.user!, req.query as never)));
  },
};
