import type { Request, Response } from 'express';

import { env } from '../../../config/env.js';
import { paginatedResponse, successResponse } from '../../../shared/responses/success-response.js';
import { productionService } from '../services/production.service.js';

function meta(page: number, limit: number, total: number) {
  return { page, limit, total, totalPages: Math.ceil(total / limit) || 1 };
}

export const productionController = {
  status: async (_req: Request, res: Response) => {
    res.json(successResponse(await productionService.getStatus()));
  },

  health: async (_req: Request, res: Response) => {
    res.json(successResponse(await productionService.getHealth()));
  },

  goLiveGates: async (_req: Request, res: Response) => {
    res.json(successResponse(await productionService.evaluateGoLiveGates()));
  },

  listReleases: async (req: Request, res: Response) => {
    const q = req.query as Record<string, unknown>;
    const page = Number(q.page ?? 1);
    const limit = Number(q.limit ?? 20);
    const { items, total } = await productionService.listReleases({
      page,
      limit,
      status: q.status as string | undefined,
      version: q.version as string | undefined,
    });
    res.json(paginatedResponse(items, meta(page, limit, total)));
  },

  createRelease: async (req: Request, res: Response) => {
    const body = req.body as Record<string, unknown>;
    const result = await productionService.createRelease({
      version: String(body.version),
      name: String(body.name),
      branch: body.branch as string | undefined,
      changelog: body.changelog as string | undefined,
      releasedById: req.user?.id,
    });
    res.status(201).json(successResponse(result));
  },

  listDeployments: async (req: Request, res: Response) => {
    const q = req.query as Record<string, unknown>;
    const page = Number(q.page ?? 1);
    const limit = Number(q.limit ?? 20);
    const { items, total } = await productionService.listDeployments({
      page,
      limit,
      component: q.component as string | undefined,
      status: q.status as string | undefined,
    });
    res.json(paginatedResponse(items, meta(page, limit, total)));
  },

  deploymentWebhook: async (req: Request, res: Response) => {
    const secret = req.headers['x-production-webhook-secret'];
    if (env.PRODUCTION_WEBHOOK_SECRET && secret !== env.PRODUCTION_WEBHOOK_SECRET) {
      res.status(401).json({ success: false, message: 'Invalid webhook secret' });
      return;
    }

    const body = req.body as Record<string, unknown>;
    const deployment = await productionService.recordDeploymentWebhook({
      component: String(body.component),
      version: String(body.version),
      strategy: body.strategy as string | undefined,
      branch: body.branch as string | undefined,
      commitSha: body.commitSha as string | undefined,
      status: body.status as string | undefined,
      validationReport: body.validationReport as Record<string, unknown> | undefined,
    });
    res.status(201).json(successResponse(deployment));
  },

  listIncidents: async (req: Request, res: Response) => {
    const q = req.query as Record<string, unknown>;
    const page = Number(q.page ?? 1);
    const limit = Number(q.limit ?? 20);
    const { items, total } = await productionService.listIncidents({
      page,
      limit,
      severity: q.severity as string | undefined,
      status: q.status as string | undefined,
    });
    res.json(paginatedResponse(items, meta(page, limit, total)));
  },

  createIncident: async (req: Request, res: Response) => {
    const body = req.body as Record<string, unknown>;
    const incident = await productionService.createIncident({
      title: String(body.title),
      severity: String(body.severity ?? 'MEDIUM'),
      description: body.description as string | undefined,
      assignedToId: body.assignedToId as string | undefined,
      actorId: req.user?.id,
    });
    res.status(201).json(successResponse(incident));
  },

  reports: async (_req: Request, res: Response) => {
    res.json(successResponse(await productionService.getReports()));
  },

  dashboard: async (_req: Request, res: Response) => {
    res.json(successResponse(await productionService.getDashboard()));
  },
};
