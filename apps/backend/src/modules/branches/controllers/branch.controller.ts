import type { Request, Response } from 'express';

import { paginatedResponse, successResponse } from '../../../shared/responses/success-response.js';
import { branchService, regionService } from '../services/branch.service.js';
import type { RequestContext } from '../types/branches.types.js';

function ctx(req: Request): RequestContext {
  return { actorId: req.user!.id };
}

export const regionController = {
  list: async (req: Request, res: Response): Promise<void> => {
    const result = await regionService.list(req.query as never);
    res.json(paginatedResponse(result.items, result.meta));
  },

  getById: async (req: Request, res: Response): Promise<void> => {
    res.json(successResponse(await regionService.getById(req.params.id as string)));
  },

  create: async (req: Request, res: Response): Promise<void> => {
    res.status(201).json(successResponse(await regionService.create(req.body)));
  },

  update: async (req: Request, res: Response): Promise<void> => {
    res.json(successResponse(await regionService.update(req.params.id as string, req.body)));
  },
};

export const branchController = {
  health: async (_req: Request, res: Response): Promise<void> => {
    res.json(successResponse(await branchService.health()));
  },

  list: async (req: Request, res: Response): Promise<void> => {
    const result = await branchService.list(req.query as never);
    res.json(paginatedResponse(result.items, result.meta));
  },

  getById: async (req: Request, res: Response): Promise<void> => {
    res.json(successResponse(await branchService.getById(req.params.id as string)));
  },

  create: async (req: Request, res: Response): Promise<void> => {
    res.status(201).json(successResponse(await branchService.create(req.body)));
  },

  update: async (req: Request, res: Response): Promise<void> => {
    res.json(successResponse(await branchService.update(req.params.id as string, req.body)));
  },

  remove: async (req: Request, res: Response): Promise<void> => {
    res.json(successResponse(await branchService.remove(req.params.id as string, ctx(req))));
  },
};
