import type { Request, Response } from 'express';

import { env } from '../../../config/env.js';
import { paginatedResponse, successResponse } from '../../../shared/responses/success-response.js';
import { mobileReleaseService } from '../services/mobile-release.service.js';

function meta(page: number, limit: number, total: number) {
  return { page, limit, total, totalPages: Math.ceil(total / limit) || 1 };
}

export const mobileReleaseController = {
  health: async (_req: Request, res: Response) => {
    res.json(successResponse({ module: 'mobile-release', status: 'ok' }));
  },

  dashboard: async (_req: Request, res: Response) => {
    res.json(successResponse(await mobileReleaseService.getDashboard()));
  },

  checklist: async (_req: Request, res: Response) => {
    res.json(successResponse(await mobileReleaseService.getChecklist()));
  },

  listBuilds: async (req: Request, res: Response) => {
    const q = req.query as Record<string, unknown>;
    const page = Number(q.page ?? 1);
    const limit = Number(q.limit ?? 20);
    const { items, total } = await mobileReleaseService.listBuilds({
      page,
      limit,
      app: q.app as string | undefined,
      environment: q.environment as string | undefined,
      buildFormat: q.buildFormat as string | undefined,
      status: q.status as string | undefined,
      versionName: q.versionName as string | undefined,
    });
    res.json(paginatedResponse(items, meta(page, limit, total)));
  },

  getBuild: async (req: Request, res: Response) => {
    res.json(successResponse(await mobileReleaseService.getBuild(String(req.params.id))));
  },

  listReleases: async (req: Request, res: Response) => {
    const q = req.query as Record<string, unknown>;
    const page = Number(q.page ?? 1);
    const limit = Number(q.limit ?? 20);
    const { items, total } = await mobileReleaseService.listReleases({
      page,
      limit,
      app: q.app as string | undefined,
      status: q.status as string | undefined,
      versionName: q.versionName as string | undefined,
    });
    res.json(paginatedResponse(items, meta(page, limit, total)));
  },

  createRelease: async (req: Request, res: Response) => {
    const body = req.body as Record<string, unknown>;
    const release = await mobileReleaseService.createRelease({
      app: body.app as 'CUSTOMER' | 'DSA',
      versionName: String(body.versionName),
      versionCode: Number(body.versionCode),
      track: body.track as string | undefined,
      releaseNotes: body.releaseNotes as string | undefined,
      releasedById: req.user?.id,
    });
    res.status(201).json(successResponse(release));
  },

  getRelease: async (req: Request, res: Response) => {
    res.json(successResponse(await mobileReleaseService.getRelease(String(req.params.id))));
  },

  buildWebhook: async (req: Request, res: Response) => {
    const secret = req.headers['x-mobile-webhook-secret'];
    if (env.MOBILE_WEBHOOK_SECRET && secret !== env.MOBILE_WEBHOOK_SECRET) {
      res.status(401).json({ success: false, message: 'Invalid webhook secret' });
      return;
    }

    const body = req.body as Record<string, unknown>;
    const build = await mobileReleaseService.recordBuildWebhook({
      app: String(body.app),
      buildType: String(body.buildType),
      environment: String(body.environment),
      versionName: String(body.versionName),
      versionCode: Number(body.versionCode),
      status: body.status as string | undefined,
      artifactUrl: body.artifactUrl as string | undefined,
      commitSha: body.commitSha as string | undefined,
      branch: body.branch as string | undefined,
      packageId: body.packageId as string | undefined,
      signed: body.signed as boolean | undefined,
      report: body.report as Record<string, unknown> | undefined,
    });
    res.status(201).json(successResponse(build));
  },
};
