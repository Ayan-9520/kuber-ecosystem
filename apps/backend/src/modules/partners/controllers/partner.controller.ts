import type { Request, Response } from 'express';

import { paginatedResponse, successResponse } from '../../../shared/responses/success-response.js';
import { partnerService } from '../services/partner.service.js';

export const partnerController = {
  health: async (_req: Request, res: Response): Promise<void> => {
    res.json(successResponse(await partnerService.health()));
  },

  list: async (req: Request, res: Response): Promise<void> => {
    const result = await partnerService.list(req.query as never);
    res.json(paginatedResponse(result.items, result.meta));
  },

  getById: async (req: Request, res: Response): Promise<void> => {
    res.json(successResponse(await partnerService.getById(req.params.id as string)));
  },

  create: async (req: Request, res: Response): Promise<void> => {
    res.status(201).json(successResponse(await partnerService.create(req.body)));
  },

  update: async (req: Request, res: Response): Promise<void> => {
    res.json(successResponse(await partnerService.update(req.params.id as string, req.body)));
  },

  remove: async (req: Request, res: Response): Promise<void> => {
    res.json(successResponse(await partnerService.remove(req.params.id as string)));
  },

  register: async (req: Request, res: Response): Promise<void> => {
    res.status(201).json(successResponse(await partnerService.register(req.body)));
  },
};
