import type { Request, Response } from 'express';

import { env } from '../../../config/env.js';
import { UnauthorizedError } from '../../../shared/errors/app-error.js';
import { successResponse } from '../../../shared/responses/success-response.js';
import { backendDeploymentService } from '../services/backend-deployment.service.js';

export const backendDeploymentController = {
  webhook: async (req: Request, res: Response) => {
    const secret = req.headers['x-backend-deployment-webhook-secret'];
    const expected = env.BACKEND_DEPLOYMENT_WEBHOOK_SECRET ?? env.PRODUCTION_WEBHOOK_SECRET;
    if (!expected || secret !== expected) throw new UnauthorizedError('Invalid webhook secret');

    const deployment = await backendDeploymentService.recordWebhook(req.body);
    res.status(201).json(successResponse(deployment));
  },

  status: async (_req: Request, res: Response) => {
    res.json(successResponse(await backendDeploymentService.getStatus()));
  },

  health: async (_req: Request, res: Response) => {
    res.json(successResponse(await backendDeploymentService.getHealth()));
  },

  services: async (_req: Request, res: Response) => {
    res.json(successResponse(await backendDeploymentService.getServices()));
  },

  dashboard: async (_req: Request, res: Response) => {
    res.json(successResponse(await backendDeploymentService.getDashboard()));
  },

  reports: async (_req: Request, res: Response) => {
    res.json(successResponse(await backendDeploymentService.getReports()));
  },

  listReleases: async (req: Request, res: Response) => {
    const q = req.query as Record<string, unknown>;
    const page = Number(q.page ?? 1);
    const limit = Number(q.limit ?? 20);
    res.json(successResponse(await backendDeploymentService.listReleases({
      page,
      limit,
      status: q.status as string | undefined,
    })));
  },

  listDeployments: async (req: Request, res: Response) => {
    const q = req.query as Record<string, unknown>;
    const page = Number(q.page ?? 1);
    const limit = Number(q.limit ?? 20);
    res.json(successResponse(await backendDeploymentService.listDeployments({
      page,
      limit,
      status: q.status as string | undefined,
      strategy: q.strategy as string | undefined,
    })));
  },

  createDeployment: async (req: Request, res: Response) => {
    const deployment = await backendDeploymentService.createDeployment({
      ...req.body,
      deployedById: req.user?.id,
    });
    res.status(201).json(successResponse(deployment));
  },

  createVersion: async (req: Request, res: Response) => {
    const version = await backendDeploymentService.createVersion({
      ...req.body,
      releasedById: req.user?.id,
    });
    res.status(201).json(successResponse(version));
  },
};
