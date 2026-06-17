import type { Request, Response } from 'express';

import { env } from '../../../config/env.js';
import { paginatedResponse, successResponse } from '../../../shared/responses/success-response.js';
import { devOpsService } from '../services/devops.service.js';

function meta(page: number, limit: number, total: number) {
  return { page, limit, total, totalPages: Math.ceil(total / limit) || 1 };
}

export const devOpsController = {
  health: async (_req: Request, res: Response) => {
    res.json(successResponse({ module: 'devops', status: 'ok' }));
  },

  dashboard: async (_req: Request, res: Response) => {
    res.json(successResponse(await devOpsService.getDashboard()));
  },

  listPipelines: async (req: Request, res: Response) => {
    const q = req.query as Record<string, unknown>;
    const page = Number(q.page ?? 1);
    const limit = Number(q.limit ?? 20);
    const { items, total } = await devOpsService.listPipelines({
      page,
      limit,
      pipelineType: q.pipelineType as string | undefined,
      status: q.status as string | undefined,
      branch: q.branch as string | undefined,
    });
    res.json(paginatedResponse(items, meta(page, limit, total)));
  },

  getPipeline: async (req: Request, res: Response) => {
    res.json(successResponse(await devOpsService.getPipeline(String(req.params.id))));
  },

  pipelineWebhook: async (req: Request, res: Response) => {
    const secret = req.headers['x-devops-webhook-secret'];
    if (env.DEVOPS_WEBHOOK_SECRET && secret !== env.DEVOPS_WEBHOOK_SECRET) {
      res.status(401).json({ success: false, message: 'Invalid webhook secret' });
      return;
    }

    const body = req.body as Record<string, unknown>;
    const run = await devOpsService.recordPipelineWebhook({
      pipelineType: String(body.pipelineType),
      name: String(body.name),
      branch: body.branch as string | undefined,
      commitSha: body.commitSha as string | undefined,
      prNumber: body.prNumber as number | undefined,
      status: String(body.status),
      workflowUrl: body.workflowUrl as string | undefined,
      triggeredBy: body.triggeredBy as string | undefined,
      durationMs: body.durationMs as number | undefined,
      metadata: body.metadata as Record<string, unknown> | undefined,
    });
    res.status(201).json(successResponse(run));
  },

  listDeployments: async (req: Request, res: Response) => {
    const q = req.query as Record<string, unknown>;
    const page = Number(q.page ?? 1);
    const limit = Number(q.limit ?? 20);
    const { items, total } = await devOpsService.listDeployments({
      page,
      limit,
      environment: q.environment as string | undefined,
      status: q.status as string | undefined,
      component: q.component as string | undefined,
    });
    res.json(paginatedResponse(items, meta(page, limit, total)));
  },

  getDeployment: async (req: Request, res: Response) => {
    res.json(successResponse(await devOpsService.getDeployment(String(req.params.id))));
  },

  recordDeployment: async (req: Request, res: Response) => {
    const body = req.body as Record<string, unknown>;
    const deployment = await devOpsService.recordDeployment({
      environment: String(body.environment),
      component: String(body.component),
      version: String(body.version),
      strategy: body.strategy as string | undefined,
      commitSha: body.commitSha as string | undefined,
      deployedById: req.user?.id,
      pipelineRunId: body.pipelineRunId as string | undefined,
      metadata: body.metadata as Record<string, unknown> | undefined,
    });
    res.status(201).json(successResponse(deployment));
  },

  listReleases: async (req: Request, res: Response) => {
    const q = req.query as Record<string, unknown>;
    const page = Number(q.page ?? 1);
    const limit = Number(q.limit ?? 20);
    const { items, total } = await devOpsService.listReleases({
      page,
      limit,
      isPublished: q.isPublished !== undefined ? q.isPublished === 'true' : undefined,
    });
    res.json(paginatedResponse(items, meta(page, limit, total)));
  },

  createRelease: async (req: Request, res: Response) => {
    const body = req.body as Record<string, unknown>;
    const release = await devOpsService.createRelease({
      version: String(body.version),
      name: String(body.name),
      branch: body.branch as string | undefined,
      commitSha: body.commitSha as string | undefined,
      changelog: body.changelog as string | undefined,
      createdById: req.user?.id,
    });
    res.status(201).json(successResponse(release));
  },

  publishRelease: async (req: Request, res: Response) => {
    res.json(successResponse(await devOpsService.publishRelease(String(req.params.id), req.user?.id)));
  },

  listRollbacks: async (req: Request, res: Response) => {
    const q = req.query as Record<string, unknown>;
    const page = Number(q.page ?? 1);
    const limit = Number(q.limit ?? 20);
    const { items, total } = await devOpsService.listRollbacks({
      page,
      limit,
      status: q.status as string | undefined,
    });
    res.json(paginatedResponse(items, meta(page, limit, total)));
  },

  createRollback: async (req: Request, res: Response) => {
    const body = req.body as Record<string, unknown>;
    const rollback = await devOpsService.createRollback({
      deploymentId: body.deploymentId as string | undefined,
      fromVersion: String(body.fromVersion),
      toVersion: String(body.toVersion),
      reason: body.reason as string | undefined,
      executedById: req.user?.id,
    });
    res.status(201).json(successResponse(rollback));
  },

  history: async (req: Request, res: Response) => {
    const q = req.query as Record<string, unknown>;
    const page = Number(q.page ?? 1);
    const limit = Number(q.limit ?? 20);
    const { items, total } = await devOpsService.getHistory({
      page,
      limit,
      type: (q.type as string | undefined) ?? 'all',
    });
    res.json(paginatedResponse(items as Record<string, unknown>[], meta(page, limit, total)));
  },
};
