import type { Request, Response } from 'express';

import { env } from '../../../config/env.js';
import { paginatedResponse, successResponse } from '../../../shared/responses/success-response.js';
import { appStoreService } from '../services/app-store.service.js';

function meta(page: number, limit: number, total: number) {
  return { page, limit, total, totalPages: Math.ceil(total / limit) || 1 };
}

export const appStoreController = {
  health: async (_req: Request, res: Response) => {
    res.json(successResponse({ module: 'app-store', status: 'ok' }));
  },

  dashboard: async (_req: Request, res: Response) => {
    res.json(successResponse(await appStoreService.getDashboard()));
  },

  testflightDashboard: async (_req: Request, res: Response) => {
    res.json(successResponse(await appStoreService.getTestFlightDashboard()));
  },

  checklist: async (_req: Request, res: Response) => {
    res.json(successResponse(await appStoreService.getChecklist()));
  },

  reports: async (req: Request, res: Response) => {
    const app = req.query.app as string | undefined;
    res.json(successResponse(await appStoreService.getReports(app as 'CUSTOMER' | 'DSA' | undefined)));
  },

  listReleases: async (req: Request, res: Response) => {
    const q = req.query as Record<string, unknown>;
    const page = Number(q.page ?? 1);
    const limit = Number(q.limit ?? 20);
    const { items, total } = await appStoreService.listReleases({
      page,
      limit,
      app: q.app as string | undefined,
      track: q.track as string | undefined,
      status: q.status as string | undefined,
    });
    res.json(paginatedResponse(items, meta(page, limit, total)));
  },

  createRelease: async (req: Request, res: Response) => {
    const body = req.body as Record<string, unknown>;
    const release = await appStoreService.createRelease({
      app: body.app as 'CUSTOMER' | 'DSA',
      versionName: String(body.versionName),
      buildNumber: String(body.buildNumber),
      track: body.track as 'TESTFLIGHT_INTERNAL' | 'TESTFLIGHT_EXTERNAL' | 'APP_STORE' | undefined,
      releaseNotes: body.releaseNotes as string | undefined,
      phasedRelease: body.phasedRelease as boolean | undefined,
      publishedById: req.user?.id,
    });
    res.status(201).json(successResponse(release));
  },

  webhook: async (req: Request, res: Response) => {
    const secret = req.headers['x-app-store-webhook-secret'] ?? req.headers['x-mobile-webhook-secret'];
    const expected = env.APP_STORE_WEBHOOK_SECRET ?? env.MOBILE_WEBHOOK_SECRET;
    if (expected && secret !== expected) {
      res.status(401).json({ success: false, message: 'Invalid webhook secret' });
      return;
    }

    const body = req.body as Record<string, unknown>;
    const release = await appStoreService.recordWebhook({
      app: String(body.app),
      versionName: String(body.versionName),
      buildNumber: String(body.buildNumber),
      track: String(body.track),
      status: body.status as string | undefined,
      ipaArtifactUrl: body.ipaArtifactUrl as string | undefined,
      releaseNotes: body.releaseNotes as string | undefined,
      commitSha: body.commitSha as string | undefined,
    });
    res.status(201).json(successResponse(release));
  },
};
