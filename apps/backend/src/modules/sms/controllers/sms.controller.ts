import type { Request, Response } from 'express';

import { paginatedResponse, successResponse } from '../../../shared/responses/success-response.js';
import { smsAnalyticsService } from '../services/sms-analytics.service.js';
import { smsDeliveryService } from '../services/sms-delivery.service.js';
import { smsOrchestratorService } from '../services/sms-orchestrator.service.js';
import { smsOtpService } from '../services/sms-otp.service.js';
import { smsPreferenceService } from '../services/sms-preference.service.js';
import { smsProviderService } from '../services/sms-provider.service.js';
import { smsQueueService } from '../services/sms-queue.service.js';
import { smsTemplateService } from '../services/sms-template.service.js';
import type { RequestContext } from '../types/sms.types.js';

function ctx(req: Request): RequestContext {
  return {
    actorId: req.user?.id ?? 'system',
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
    requestId: req.requestId,
  };
}

export const smsSendController = {
  send: async (req: Request, res: Response) => {
    const result = await smsOrchestratorService.send(req.body);
    res.status(201).json(successResponse(result));
  },
  processQueue: async (_req: Request, res: Response) => {
    res.json(successResponse(await smsQueueService.processBatch()));
  },
};

export const smsOtpController = {
  send: async (req: Request, res: Response) => {
    res.status(201).json(successResponse(await smsOtpService.sendOtp(req.body, ctx(req))));
  },
  verify: async (req: Request, res: Response) => {
    res.json(successResponse(await smsOtpService.verifyOtp(req.body, ctx(req))));
  },
};

export const smsTemplateController = {
  list: async (req: Request, res: Response) => {
    const result = await smsTemplateService.list(req.query as never);
    res.json(paginatedResponse(result.items, result.meta));
  },
  getById: async (req: Request, res: Response) => {
    res.json(successResponse(await smsTemplateService.getById(req.params.id as string)));
  },
  create: async (req: Request, res: Response) => {
    res.status(201).json(successResponse(await smsTemplateService.create(req.body, ctx(req))));
  },
  update: async (req: Request, res: Response) => {
    res.json(successResponse(await smsTemplateService.update(req.params.id as string, req.body, ctx(req))));
  },
  createVersion: async (req: Request, res: Response) => {
    res.status(201).json(successResponse(await smsTemplateService.createVersion(req.params.id as string, req.body, ctx(req))));
  },
  preview: async (req: Request, res: Response) => {
    res.json(successResponse(await smsTemplateService.preview(req.body)));
  },
};

export const smsLogController = {
  list: async (req: Request, res: Response) => {
    const result = await smsDeliveryService.list(req.query as never);
    res.json(paginatedResponse(result.items, result.meta));
  },
  getById: async (req: Request, res: Response) => {
    res.json(successResponse(await smsDeliveryService.getById(req.params.id as string)));
  },
};

export const smsAnalyticsController = {
  summary: async (req: Request, res: Response) => {
    res.json(successResponse(await smsAnalyticsService.getSummary(req.query as never)));
  },
};

export const smsProviderController = {
  list: async (req: Request, res: Response) => {
    const result = await smsProviderService.list(req.query as never);
    res.json(paginatedResponse(result.items, result.meta));
  },
  getById: async (req: Request, res: Response) => {
    res.json(successResponse(await smsProviderService.getById(req.params.id as string)));
  },
  create: async (req: Request, res: Response) => {
    res.status(201).json(successResponse(await smsProviderService.create(req.body)));
  },
  update: async (req: Request, res: Response) => {
    res.json(successResponse(await smsProviderService.update(req.params.id as string, req.body)));
  },
};

export const smsPreferenceController = {
  list: async (req: Request, res: Response) => {
    const result = await smsPreferenceService.list(req.query as never);
    res.json(paginatedResponse(result.items, result.meta));
  },
  upsert: async (req: Request, res: Response) => {
    res.json(successResponse(await smsPreferenceService.upsert(req.body)));
  },
};

export const smsQueueController = {
  list: async (req: Request, res: Response) => {
    const result = await smsQueueService.list(req.query as never);
    res.json(paginatedResponse(result.items, result.meta));
  },
};
