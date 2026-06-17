import type { Request, Response } from 'express';

import { paginatedResponse, successResponse } from '../../../shared/responses/success-response.js';
import { drService } from '../services/dr.service.js';

export const drController = {
  overview: async (_req: Request, res: Response) => {
    res.json(successResponse(await drService.overview()));
  },

  listPlans: async (_req: Request, res: Response) => {
    res.json(successResponse(await drService.listPlans()));
  },

  getPlan: async (req: Request, res: Response) => {
    res.json(successResponse(await drService.getPlan(String(req.params.id))));
  },

  listDrills: async (req: Request, res: Response) => {
    const q = req.query as Record<string, unknown>;
    const result = await drService.listDrills({
      page: Number(q.page ?? 1), limit: Number(q.limit ?? 20),
      status: q.status as string | undefined, scenario: q.scenario as string | undefined,
    });
    res.json(paginatedResponse(result.items, result.meta));
  },

  startDrill: async (req: Request, res: Response) => {
    const body = req.body as Record<string, unknown>;
    res.status(201).json(successResponse(await drService.startDrill({
      planId: body.planId as string | undefined,
      scenario: String(body.scenario),
      auditType: String(body.auditType ?? 'QUARTERLY_DR_DRILL'),
      executedById: req.user?.id,
    })));
  },
};
