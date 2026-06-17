import type { Request, Response } from 'express';

import { env } from '../../../config/env.js';
import { paginatedResponse, successResponse } from '../../../shared/responses/success-response.js';
import { stagingService } from '../services/staging.service.js';

function meta(page: number, limit: number, total: number) {
  return { page, limit, total, totalPages: Math.ceil(total / limit) || 1 };
}

export const stagingController = {
  health: async (_req: Request, res: Response) => {
    res.json(successResponse({ module: 'staging', status: 'ok' }));
  },

  status: async (_req: Request, res: Response) => {
    res.json(successResponse(await stagingService.getStatus()));
  },

  stagingHealth: async (_req: Request, res: Response) => {
    res.json(successResponse(await stagingService.getHealth()));
  },

  listReleases: async (req: Request, res: Response) => {
    const q = req.query as Record<string, unknown>;
    const page = Number(q.page ?? 1);
    const limit = Number(q.limit ?? 20);
    const { items, total } = await stagingService.listReleases({
      page,
      limit,
      status: q.status as string | undefined,
      releaseVersion: q.releaseVersion as string | undefined,
    });
    res.json(paginatedResponse(items, meta(page, limit, total)));
  },

  createRelease: async (req: Request, res: Response) => {
    const body = req.body as Record<string, unknown>;
    const release = await stagingService.createReleaseValidation({
      releaseVersion: String(body.releaseVersion),
      branch: body.branch as string | undefined,
      validatedById: req.user?.id,
    });
    res.status(201).json(successResponse(release));
  },

  listDeployments: async (req: Request, res: Response) => {
    const q = req.query as Record<string, unknown>;
    const page = Number(q.page ?? 1);
    const limit = Number(q.limit ?? 20);
    const { items, total } = await stagingService.listDeployments({
      page,
      limit,
      component: q.component as string | undefined,
      status: q.status as string | undefined,
    });
    res.json(paginatedResponse(items, meta(page, limit, total)));
  },

  deploymentWebhook: async (req: Request, res: Response) => {
    const secret = req.headers['x-staging-webhook-secret'];
    if (env.STAGING_WEBHOOK_SECRET && secret !== env.STAGING_WEBHOOK_SECRET) {
      res.status(401).json({ success: false, message: 'Invalid webhook secret' });
      return;
    }

    const body = req.body as Record<string, unknown>;
    const deployment = await stagingService.recordDeploymentWebhook({
      component: String(body.component),
      version: String(body.version),
      branch: body.branch as string | undefined,
      commitSha: body.commitSha as string | undefined,
      buildStatus: body.buildStatus as 'PASSED' | 'FAILED' | undefined,
      testStatus: body.testStatus as 'PASSED' | 'FAILED' | undefined,
      migrationStatus: body.migrationStatus as 'PASSED' | 'FAILED' | undefined,
      healthStatus: body.healthStatus as 'PASSED' | 'FAILED' | undefined,
      report: body.report as Record<string, unknown> | undefined,
    });
    res.status(201).json(successResponse(deployment));
  },

  reports: async (_req: Request, res: Response) => {
    res.json(successResponse(await stagingService.getReports()));
  },

  dashboard: async (_req: Request, res: Response) => {
    res.json(successResponse(await stagingService.getDashboard()));
  },
};
