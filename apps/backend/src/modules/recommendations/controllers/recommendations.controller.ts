import type { Request, Response } from 'express';

import { successResponse } from '../../../shared/responses/success-response.js';
import { recommendationOrchestratorService } from '../services/recommendation-orchestrator.service.js';
import type { RequestContext } from '../types/recommendations.types.js';

function ctx(req: Request): RequestContext {
  return {
    actorId: req.user!.id,
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
    requestId: req.requestId,
  };
}

export const recommendationsController = {
  health: async (_req: Request, res: Response) => {
    res.json(successResponse({ module: 'recommendations', engine: 'KuberOne AI Recommendation Engine', status: 'ok' }));
  },

  customer: async (req: Request, res: Response) => {
    res.json(successResponse(await recommendationOrchestratorService.forCustomer(req.user!, req.params.id as string, ctx(req))));
  },

  lead: async (req: Request, res: Response) => {
    res.json(successResponse(await recommendationOrchestratorService.forLead(req.user!, req.params.id as string, ctx(req))));
  },

  application: async (req: Request, res: Response) => {
    res.json(successResponse(await recommendationOrchestratorService.forApplication(req.user!, req.params.id as string, ctx(req))));
  },

  lender: async (req: Request, res: Response) => {
    const entityType = (req.query.entityType as 'CUSTOMER' | 'LEAD' | 'APPLICATION') ?? 'LEAD';
    res.json(
      successResponse(
        await recommendationOrchestratorService.lenderMatches(req.user!, entityType, req.params.id as string, ctx(req)),
      ),
    );
  },

  crossSell: async (req: Request, res: Response) => {
    res.json(
      successResponse(
        await recommendationOrchestratorService.crossSell(
          { entityType: req.query.entityType as never, entityId: String(req.query.entityId) },
          req.user!,
          ctx(req),
        ),
      ),
    );
  },

  actions: async (req: Request, res: Response) => {
    res.json(
      successResponse(
        await recommendationOrchestratorService.actions(
          { entityType: req.query.entityType as never, entityId: String(req.query.entityId) },
          req.user!,
          ctx(req),
        ),
      ),
    );
  },

  analytics: async (req: Request, res: Response) => {
    res.json(successResponse(await recommendationOrchestratorService.analytics(req.user!, req.query as never)));
  },

  listRules: async (req: Request, res: Response) => {
    res.json(successResponse(await recommendationOrchestratorService.rules.list(req.query as never)));
  },

  createRule: async (req: Request, res: Response) => {
    res.status(201).json(successResponse(await recommendationOrchestratorService.rules.create(req.body, ctx(req))));
  },

  updateRule: async (req: Request, res: Response) => {
    res.json(successResponse(await recommendationOrchestratorService.rules.update(req.params.id as string, req.body, ctx(req))));
  },
};
