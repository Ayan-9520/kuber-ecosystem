import type { Request, Response } from 'express';

import { paginatedResponse, successResponse } from '../../../shared/responses/success-response.js';
import { pushAnalyticsService } from '../services/push-analytics.service.js';
import { pushDeliveryService } from '../services/push-delivery.service.js';
import { pushDeviceService } from '../services/push-device.service.js';
import { pushOrchestratorService } from '../services/push-orchestrator.service.js';
import { pushPreferenceService } from '../services/push-preference.service.js';
import { pushProviderService } from '../services/push-provider.service.js';
import { pushQueueService } from '../services/push-queue.service.js';
import { pushTemplateService } from '../services/push-template.service.js';
import { pushTopicService } from '../services/push-topic.service.js';
import { pushTrackingService } from '../services/push-tracking.service.js';
import type { RequestContext } from '../types/push.types.js';

function ctx(req: Request): RequestContext {
  return {
    actorId: req.user?.id ?? 'system',
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
    requestId: req.requestId,
  };
}

export const pushDeviceController = {
  register: async (req: Request, res: Response) => {
    const userId = req.user!.id;
    res.status(201).json(successResponse(await pushDeviceService.register(userId, req.body)));
  },
  unregister: async (req: Request, res: Response) => {
    const userId = req.user!.id;
    res.json(successResponse(await pushDeviceService.unregister(userId, req.body)));
  },
  refreshToken: async (req: Request, res: Response) => {
    const userId = req.user!.id;
    res.json(successResponse(await pushDeviceService.refreshToken(userId, req.body)));
  },
};

export const pushSendController = {
  send: async (req: Request, res: Response) => {
    const result = await pushOrchestratorService.send(req.body);
    res.status(201).json(successResponse(result));
  },
  processQueue: async (_req: Request, res: Response) => {
    res.json(successResponse(await pushQueueService.processBatch()));
  },
  track: async (req: Request, res: Response) => {
    res.json(successResponse(await pushTrackingService.trackEvent(req.body)));
  },
};

export const pushTemplateController = {
  list: async (req: Request, res: Response) => {
    const result = await pushTemplateService.list(req.query as never);
    res.json(paginatedResponse(result.items, result.meta));
  },
  getById: async (req: Request, res: Response) => {
    res.json(successResponse(await pushTemplateService.getById(req.params.id as string)));
  },
  create: async (req: Request, res: Response) => {
    res.status(201).json(successResponse(await pushTemplateService.create(req.body, ctx(req))));
  },
  update: async (req: Request, res: Response) => {
    res.json(successResponse(await pushTemplateService.update(req.params.id as string, req.body, ctx(req))));
  },
  createVersion: async (req: Request, res: Response) => {
    res.status(201).json(successResponse(await pushTemplateService.createVersion(req.params.id as string, req.body, ctx(req))));
  },
  preview: async (req: Request, res: Response) => {
    res.json(successResponse(await pushTemplateService.preview(req.body)));
  },
};

export const pushLogController = {
  list: async (req: Request, res: Response) => {
    const result = await pushDeliveryService.list(req.query as never);
    res.json(paginatedResponse(result.items, result.meta));
  },
  getById: async (req: Request, res: Response) => {
    res.json(successResponse(await pushDeliveryService.getById(req.params.id as string)));
  },
};

export const pushAnalyticsController = {
  summary: async (req: Request, res: Response) => {
    res.json(successResponse(await pushAnalyticsService.getSummary(req.query as never)));
  },
};

export const pushProviderController = {
  list: async (req: Request, res: Response) => {
    const result = await pushProviderService.list(req.query as never);
    res.json(paginatedResponse(result.items, result.meta));
  },
  getById: async (req: Request, res: Response) => {
    res.json(successResponse(await pushProviderService.getById(req.params.id as string)));
  },
  create: async (req: Request, res: Response) => {
    res.status(201).json(successResponse(await pushProviderService.create(req.body)));
  },
  update: async (req: Request, res: Response) => {
    res.json(successResponse(await pushProviderService.update(req.params.id as string, req.body)));
  },
};

export const pushPreferenceController = {
  list: async (req: Request, res: Response) => {
    const result = await pushPreferenceService.list(req.query as never);
    res.json(paginatedResponse(result.items, result.meta));
  },
  upsert: async (req: Request, res: Response) => {
    res.json(successResponse(await pushPreferenceService.upsert(req.body)));
  },
};

export const pushQueueController = {
  list: async (req: Request, res: Response) => {
    const result = await pushQueueService.list(req.query as never);
    res.json(paginatedResponse(result.items, result.meta));
  },
};

export const pushTopicController = {
  list: async (req: Request, res: Response) => {
    const result = await pushTopicService.list(req.query as never);
    res.json(paginatedResponse(result.items, result.meta));
  },
  create: async (req: Request, res: Response) => {
    res.status(201).json(successResponse(await pushTopicService.create(req.body)));
  },
  subscribe: async (req: Request, res: Response) => {
    const userId = req.user!.id;
    res.status(201).json(successResponse(await pushTopicService.subscribe(userId, req.body)));
  },
  unsubscribe: async (req: Request, res: Response) => {
    const userId = req.user!.id;
    res.json(successResponse(await pushTopicService.unsubscribe(userId, req.body)));
  },
  subscriptions: async (req: Request, res: Response) => {
    const userId = req.user!.id;
    res.json(successResponse(await pushTopicService.listSubscriptions(userId)));
  },
};
