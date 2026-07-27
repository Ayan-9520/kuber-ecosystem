import type { Request, Response } from 'express';

import { paginatedResponse, successResponse } from '../../../shared/responses/success-response.js';
import { revenueDistributionService } from '../services/revenue-distribution.service.js';
import type { RequestContext } from '../types/revenue-distribution.types.js';

function ctx(req: Request): RequestContext {
  return {
    actorId: req.user!.id,
    actorName: req.user!.email ?? req.user!.phone ?? req.user!.id,
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
    requestId: req.requestId,
  };
}

export const revenueDistributionController = {
  summary: async (_req: Request, res: Response) => {
    res.json(successResponse(revenueDistributionService.summary()));
  },

  listRules: async (req: Request, res: Response) => {
    const result = revenueDistributionService.listRules(req.user!, req.query as never);
    res.json(paginatedResponse(result.items, result.meta));
  },

  getRule: async (req: Request, res: Response) => {
    res.json(successResponse(revenueDistributionService.getRule(req.user!, req.params.id as string)));
  },

  createRule: async (req: Request, res: Response) => {
    res
      .status(201)
      .json(successResponse(revenueDistributionService.createRule(req.user!, req.body, ctx(req))));
  },

  updateRule: async (req: Request, res: Response) => {
    res.json(
      successResponse(
        revenueDistributionService.updateRule(req.user!, req.params.id as string, req.body, ctx(req)),
      ),
    );
  },

  deleteRule: async (req: Request, res: Response) => {
    res.json(
      successResponse(
        revenueDistributionService.deleteRule(req.user!, req.params.id as string, ctx(req)),
      ),
    );
  },

  simulate: async (req: Request, res: Response) => {
    res.json(successResponse(revenueDistributionService.simulate(req.user!, req.body)));
  },

  createRun: async (req: Request, res: Response) => {
    res
      .status(201)
      .json(successResponse(revenueDistributionService.createRun(req.user!, req.body, ctx(req))));
  },

  listRuns: async (req: Request, res: Response) => {
    const result = revenueDistributionService.listRuns(req.user!, req.query as never);
    res.json(paginatedResponse(result.items, result.meta));
  },

  getRun: async (req: Request, res: Response) => {
    res.json(successResponse(revenueDistributionService.getRun(req.user!, req.params.id as string)));
  },

  listAudit: async (req: Request, res: Response) => {
    const result = revenueDistributionService.listAudit(req.user!, req.query as never);
    res.json(paginatedResponse(result.items, result.meta));
  },
};
