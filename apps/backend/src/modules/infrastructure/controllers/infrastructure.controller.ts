import type { Request, Response } from 'express';

import { paginatedResponse, successResponse } from '../../../shared/responses/success-response.js';
import { infrastructureService } from '../services/infrastructure.service.js';

function meta(page: number, limit: number, total: number) {
  return { page, limit, total, totalPages: Math.ceil(total / limit) || 1 };
}

export const infrastructureController = {
  health: async (_req: Request, res: Response) => {
    res.json(successResponse({ module: 'infrastructure', status: 'ok' }));
  },

  overview: async (_req: Request, res: Response) => {
    res.json(successResponse(await infrastructureService.getOverview()));
  },

  listEnvironments: async (req: Request, res: Response) => {
    const q = req.query as Record<string, unknown>;
    const page = Number(q.page ?? 1);
    const limit = Number(q.limit ?? 20);
    const { items, total } = await infrastructureService.listEnvironments({
      page,
      limit,
      type: q.type as string | undefined,
      isActive: q.isActive !== undefined ? q.isActive === 'true' : undefined,
    });
    res.json(paginatedResponse(items, meta(page, limit, total)));
  },

  getEnvironment: async (req: Request, res: Response) => {
    res.json(successResponse(await infrastructureService.getEnvironment(String(req.params.code))));
  },

  listServices: async (req: Request, res: Response) => {
    const q = req.query as Record<string, unknown>;
    const page = Number(q.page ?? 1);
    const limit = Number(q.limit ?? 20);
    const { items, total } = await infrastructureService.listServices({
      page,
      limit,
      environmentId: q.environmentId as string | undefined,
      serviceType: q.serviceType as string | undefined,
      status: q.status as string | undefined,
    });
    res.json(paginatedResponse(items, meta(page, limit, total)));
  },

  listDomains: async (req: Request, res: Response) => {
    const q = req.query as Record<string, unknown>;
    const page = Number(q.page ?? 1);
    const limit = Number(q.limit ?? 20);
    const { items, total } = await infrastructureService.listDomains({
      page,
      limit,
      environmentId: q.environmentId as string | undefined,
    });
    res.json(paginatedResponse(items, meta(page, limit, total)));
  },

  listHealth: async (req: Request, res: Response) => {
    const q = req.query as Record<string, unknown>;
    const page = Number(q.page ?? 1);
    const limit = Number(q.limit ?? 20);
    const { items, total } = await infrastructureService.listHealth({
      page,
      limit,
      environmentId: q.environmentId as string | undefined,
      serviceId: q.serviceId as string | undefined,
      hours: q.hours ? Number(q.hours) : undefined,
    });
    res.json(paginatedResponse(items, meta(page, limit, total)));
  },

  configs: async (req: Request, res: Response) => {
    const category = req.query.category as string | undefined;
    res.json(successResponse(await infrastructureService.getConfigs(category)));
  },

  deploymentStatus: async (_req: Request, res: Response) => {
    res.json(successResponse(await infrastructureService.getDeploymentStatus()));
  },
};
