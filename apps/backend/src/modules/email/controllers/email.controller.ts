import type { Request, Response } from 'express';

import { paginatedResponse, successResponse } from '../../../shared/responses/success-response.js';
import { emailAnalyticsService } from '../services/email-analytics.service.js';
import { emailDeliveryService } from '../services/email-delivery.service.js';
import { emailOrchestratorService } from '../services/email-orchestrator.service.js';
import { emailPreferenceService } from '../services/email-preference.service.js';
import { emailProviderService } from '../services/email-provider.service.js';
import { emailQueueService } from '../services/email-queue.service.js';
import { emailTemplateService } from '../services/email-template.service.js';
import type { RequestContext } from '../types/email.types.js';

function ctx(req: Request): RequestContext {
  return {
    actorId: req.user!.id,
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
    requestId: req.requestId,
  };
}

export const emailSendController = {
  send: async (req: Request, res: Response) => {
    const result = await emailOrchestratorService.send(req.body);
    res.status(201).json(successResponse(result));
  },
  processQueue: async (_req: Request, res: Response) => {
    res.json(successResponse(await emailQueueService.processBatch()));
  },
};

export const emailTemplateController = {
  list: async (req: Request, res: Response) => {
    const result = await emailTemplateService.list(req.query as never);
    res.json(paginatedResponse(result.items, result.meta));
  },
  getById: async (req: Request, res: Response) => {
    res.json(successResponse(await emailTemplateService.getById(req.params.id as string)));
  },
  create: async (req: Request, res: Response) => {
    res.status(201).json(successResponse(await emailTemplateService.create(req.body, ctx(req))));
  },
  update: async (req: Request, res: Response) => {
    res.json(successResponse(await emailTemplateService.update(req.params.id as string, req.body, ctx(req))));
  },
  createVersion: async (req: Request, res: Response) => {
    res.status(201).json(successResponse(await emailTemplateService.createVersion(req.params.id as string, req.body, ctx(req))));
  },
  preview: async (req: Request, res: Response) => {
    res.json(successResponse(await emailTemplateService.preview(req.body)));
  },
};

export const emailLogController = {
  list: async (req: Request, res: Response) => {
    const result = await emailDeliveryService.list(req.query as never);
    res.json(paginatedResponse(result.items, result.meta));
  },
  getById: async (req: Request, res: Response) => {
    res.json(successResponse(await emailDeliveryService.getById(req.params.id as string)));
  },
};

export const emailAnalyticsController = {
  summary: async (req: Request, res: Response) => {
    res.json(successResponse(await emailAnalyticsService.getSummary(req.query as never)));
  },
};

export const emailProviderController = {
  list: async (req: Request, res: Response) => {
    const result = await emailProviderService.list(req.query as never);
    res.json(paginatedResponse(result.items, result.meta));
  },
  getById: async (req: Request, res: Response) => {
    res.json(successResponse(await emailProviderService.getById(req.params.id as string)));
  },
  create: async (req: Request, res: Response) => {
    res.status(201).json(successResponse(await emailProviderService.create(req.body)));
  },
  update: async (req: Request, res: Response) => {
    res.json(successResponse(await emailProviderService.update(req.params.id as string, req.body)));
  },
};

export const emailPreferenceController = {
  list: async (req: Request, res: Response) => {
    const result = await emailPreferenceService.list(req.query as never);
    res.json(paginatedResponse(result.items, result.meta));
  },
  upsert: async (req: Request, res: Response) => {
    res.json(successResponse(await emailPreferenceService.upsert(req.body)));
  },
};

export const emailQueueController = {
  list: async (req: Request, res: Response) => {
    const result = await emailQueueService.list(req.query as never);
    res.json(paginatedResponse(result.items, result.meta));
  },
};
