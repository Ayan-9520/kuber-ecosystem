import type { Request, Response } from 'express';

import { paginatedResponse, successResponse } from '../../../shared/responses/success-response.js';
import { campaignService } from '../services/campaign.service.js';
import type { RequestContext } from '../services/campaign.service.js';

function ctx(req: Request): RequestContext {
  return { actorId: req.user!.id };
}

export const campaignController = {
  health: async (_req: Request, res: Response): Promise<void> => {
    res.json(successResponse(await campaignService.health()));
  },

  list: async (req: Request, res: Response): Promise<void> => {
    const result = await campaignService.list(req.query as never);
    res.json(paginatedResponse(result.items, result.meta));
  },

  getById: async (req: Request, res: Response): Promise<void> => {
    res.json(successResponse(await campaignService.getById(req.params.id as string)));
  },

  create: async (req: Request, res: Response): Promise<void> => {
    res.status(201).json(successResponse(await campaignService.create(req.body, ctx(req))));
  },

  update: async (req: Request, res: Response): Promise<void> => {
    res.json(successResponse(await campaignService.update(req.params.id as string, req.body, ctx(req))));
  },

  updateMetrics: async (req: Request, res: Response): Promise<void> => {
    res.json(successResponse(await campaignService.updateMetrics(req.params.id as string, req.body)));
  },

  remove: async (req: Request, res: Response): Promise<void> => {
    res.json(successResponse(await campaignService.remove(req.params.id as string, ctx(req))));
  },
};
