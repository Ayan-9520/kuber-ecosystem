import type { Request, Response } from 'express';

import { paginatedResponse, successResponse } from '../../../shared/responses/success-response.js';
import { backupRepository } from '../repositories/backup.repository.js';
import { backupDataService } from '../services/backup-data.service.js';
import { backupEngineService } from '../services/backup-engine.service.js';
import { backupRetentionService } from '../services/backup-retention.service.js';
import { restoreService } from '../services/restore.service.js';

export const backupController = {
  health: async (_req: Request, res: Response) => {
    res.json(successResponse({ module: 'backup', status: 'ok' }));
  },

  overview: async (req: Request, res: Response) => {
    res.json(successResponse(await backupDataService.overview(req.query as never)));
  },

  listJobs: async (req: Request, res: Response) => {
    const q = req.query as Record<string, unknown>;
    const result = await backupDataService.listJobs({
      page: Number(q.page ?? 1), limit: Number(q.limit ?? 20),
      scope: q.scope as string | undefined, schedule: q.schedule as string | undefined,
      status: q.status as string | undefined, search: q.search as string | undefined,
    });
    res.json(paginatedResponse(result.items, result.meta));
  },

  history: async (req: Request, res: Response) => {
    const q = req.query as Record<string, unknown>;
    const result = await backupDataService.listHistory({
      page: Number(q.page ?? 1), limit: Number(q.limit ?? 20),
      scope: q.scope as string | undefined, status: q.status as string | undefined,
      jobId: q.jobId as string | undefined,
    });
    res.json(paginatedResponse(result.items, result.meta));
  },

  retention: async (_req: Request, res: Response) => {
    res.json(successResponse(await backupRetentionService.list()));
  },

  trigger: async (req: Request, res: Response) => {
    const body = req.body as Record<string, unknown>;
    res.status(201).json(successResponse(await backupEngineService.runManual({
      jobId: body.jobId as string | undefined,
      scope: body.scope as string | undefined,
      backupType: body.backupType as string | undefined,
      userId: req.user?.id,
    })));
  },

  getExecution: async (req: Request, res: Response) => {
    const execution = await backupRepository.execution.findById(String(req.params.id));
    res.json(successResponse(execution));
  },

  verify: async (req: Request, res: Response) => {
    res.json(successResponse(await backupEngineService.verifyIntegrity(String(req.params.id))));
  },

  restore: async (req: Request, res: Response) => {
    const body = req.body as Record<string, unknown>;
    const request = await restoreService.createRequest({
      scope: String(body.scope),
      targetType: body.targetType as string | undefined,
      targetId: body.targetId as string | undefined,
      executionId: body.executionId as string | undefined,
      reason: body.reason as string | undefined,
      requestedById: req.user!.id,
    });
    const execution = await restoreService.execute(request.id);
    res.status(201).json(successResponse({ request, execution }));
  },

  listRestores: async (req: Request, res: Response) => {
    const q = req.query as Record<string, unknown>;
    const result = await restoreService.listRequests({
      page: Number(q.page ?? 1), limit: Number(q.limit ?? 20),
      status: q.status as string | undefined,
    });
    res.json(paginatedResponse(result.items, result.meta));
  },
};
