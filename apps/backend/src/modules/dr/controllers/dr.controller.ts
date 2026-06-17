import type { Request, Response } from 'express';

import { env } from '../../../config/env.js';
import { UnauthorizedError } from '../../../shared/errors/app-error.js';
import { successResponse } from '../../../shared/responses/success-response.js';
import { drPlatformService } from '../services/dr-platform.service.js';

export const drController = {
  webhook: async (req: Request, res: Response) => {
    const secret = req.headers['x-dr-webhook-secret'];
    const expected = env.DR_WEBHOOK_SECRET ?? env.PRODUCTION_WEBHOOK_SECRET;
    if (!expected || secret !== expected) throw new UnauthorizedError('Invalid DR webhook secret');
    res.json(successResponse(await drPlatformService.recordWebhook(req.body)));
  },

  status: async (_req: Request, res: Response) => {
    res.json(successResponse(await drPlatformService.getStatus()));
  },

  dashboard: async (_req: Request, res: Response) => {
    res.json(successResponse(await drPlatformService.getDashboard()));
  },

  plans: async (_req: Request, res: Response) => {
    res.json(successResponse(await drPlatformService.listPlans()));
  },

  drills: async (req: Request, res: Response) => {
    const q = req.query as Record<string, unknown>;
    res.json(successResponse(await drPlatformService.listDrills({
      page: Number(q.page ?? 1),
      limit: Number(q.limit ?? 20),
      drillType: q.drillType as string | undefined,
      scenario: q.scenario as string | undefined,
      status: q.status as string | undefined,
    })));
  },

  startDrill: async (req: Request, res: Response) => {
    const body = req.body as Record<string, unknown>;
    const drill = await drPlatformService.startDrill({
      drillType: body.drillType as 'MONTHLY' | 'QUARTERLY' | 'ANNUAL',
      scenario: String(body.scenario),
      executedById: req.user?.id,
    });
    res.status(201).json(successResponse(drill));
  },

  failover: async (req: Request, res: Response) => {
    const body = req.body as Record<string, unknown>;
    const failover = await drPlatformService.startFailover({
      failoverType: body.failoverType as 'DNS' | 'TRAFFIC_SWITCH' | 'BLUE_GREEN' | 'READ_REPLICA_PROMOTION',
      primaryEnv: body.primaryEnv as string | undefined,
      standbyEnv: body.standbyEnv as string | undefined,
      executedById: req.user?.id,
    });
    res.status(201).json(successResponse(failover));
  },

  listFailover: async (req: Request, res: Response) => {
    const q = req.query as Record<string, unknown>;
    const page = Number(q.page ?? 1);
    const limit = Number(q.limit ?? 20);
    const skip = (page - 1) * limit;
    const { drRepository } = await import('../repositories/dr.repository.js');
    const [items, total] = await drRepository.listFailovers(skip, limit);
    res.json(successResponse({
      items,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
    }));
  },

  listRecovery: async (req: Request, res: Response) => {
    const q = req.query as Record<string, unknown>;
    const page = Number(q.page ?? 1);
    const limit = Number(q.limit ?? 20);
    const skip = (page - 1) * limit;
    const { drRepository } = await import('../repositories/dr.repository.js');
    const [items, total] = await drRepository.listRecoveries({}, skip, limit);
    res.json(successResponse({
      items,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
    }));
  },

  startRecovery: async (req: Request, res: Response) => {
    const body = req.body as Record<string, unknown>;
    const execution = await drPlatformService.startRecovery({
      scenario: String(body.scenario),
      runbookId: body.runbookId as string | undefined,
      executedById: req.user?.id,
    });
    res.status(201).json(successResponse(execution));
  },

  reports: async (_req: Request, res: Response) => {
    res.json(successResponse(await drPlatformService.getReports()));
  },
};
