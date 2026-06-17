import type { Request, Response } from 'express';

import { paginatedResponse, successResponse } from '../../../shared/responses/success-response.js';
import { settingService } from '../services/setting.service.js';
import type { RequestContext } from '../services/setting.service.js';

function ctx(req: Request): RequestContext {
  return { actorId: req.user!.id };
}

export const settingController = {
  health: async (_req: Request, res: Response): Promise<void> => {
    res.json(successResponse(await settingService.health()));
  },

  list: async (req: Request, res: Response): Promise<void> => {
    const result = await settingService.list(req.query as never);
    res.json(paginatedResponse(result.items, result.meta));
  },

  getByKey: async (req: Request, res: Response): Promise<void> => {
    res.json(successResponse(await settingService.getByKey(req.params.key as string)));
  },

  update: async (req: Request, res: Response): Promise<void> => {
    res.json(successResponse(await settingService.upsert(req.params.key as string, req.body, ctx(req))));
  },
};
