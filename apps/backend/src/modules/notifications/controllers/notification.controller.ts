import type { Request, Response } from 'express';

import { paginatedResponse, successResponse } from '../../../shared/responses/success-response.js';
import { communicationLogService, notificationAnalyticsService } from '../services/communication-log.service.js';
import { emailService } from '../services/email.service.js';
import { notificationPreferenceService } from '../services/notification-preference.service.js';
import { notificationTemplateService } from '../services/notification-template.service.js';
import { notificationService } from '../services/notification.service.js';
import { pushService } from '../services/push.service.js';
import { smsService } from '../services/sms.service.js';
import { whatsAppService } from '../services/whatsapp.service.js';
import type { RequestContext } from '../types/notifications.types.js';

function ctx(req: Request): RequestContext {
  return {
    actorId: req.user!.id,
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
    requestId: req.requestId,
  };
}

export const notificationController = {
  list: async (req: Request, res: Response) => {
    const result = await notificationService.list(req.query as never);
    res.json(paginatedResponse(result.items, result.meta));
  },
  getById: async (req: Request, res: Response) => {
    res.json(successResponse(await notificationService.getById(req.params.id as string)));
  },
  send: async (req: Request, res: Response) => {
    res.status(201).json(successResponse(await notificationService.send(req.body, ctx(req))));
  },
  markRead: async (req: Request, res: Response) => {
    res.json(successResponse(await notificationService.markRead(req.params.id as string, ctx(req))));
  },
  markAllRead: async (req: Request, res: Response) => {
    res.json(successResponse(await notificationService.markAllRead(req.params.userId as string, ctx(req))));
  },
  remove: async (req: Request, res: Response) => {
    res.json(successResponse(await notificationService.remove(req.params.id as string, ctx(req))));
  },
  processQueue: async (_req: Request, res: Response) => {
    res.json(successResponse(await notificationService.processQueue()));
  },
};

export const notificationTemplateController = {
  list: async (req: Request, res: Response) => {
    const result = await notificationTemplateService.list(req.query as never);
    res.json(paginatedResponse(result.items, result.meta));
  },
  getById: async (req: Request, res: Response) => {
    res.json(successResponse(await notificationTemplateService.getById(req.params.id as string)));
  },
  create: async (req: Request, res: Response) => {
    res.status(201).json(successResponse(await notificationTemplateService.create(req.body, ctx(req))));
  },
  update: async (req: Request, res: Response) => {
    res.json(successResponse(await notificationTemplateService.update(req.params.id as string, req.body, ctx(req))));
  },
  createVersion: async (req: Request, res: Response) => {
    res.status(201).json(successResponse(await notificationTemplateService.createVersion(req.params.id as string, req.body, ctx(req))));
  },
  remove: async (req: Request, res: Response) => {
    res.json(successResponse(await notificationTemplateService.remove(req.params.id as string, ctx(req))));
  },
};

export const notificationPreferenceController = {
  list: async (req: Request, res: Response) => {
    const result = await notificationPreferenceService.list(req.query as never);
    res.json(paginatedResponse(result.items, result.meta));
  },
  upsert: async (req: Request, res: Response) => {
    res.json(successResponse(await notificationPreferenceService.upsert(req.body, ctx(req))));
  },
  bulkUpsert: async (req: Request, res: Response) => {
    res.json(successResponse(await notificationPreferenceService.bulkUpsert(req.body, ctx(req))));
  },
};

export const emailController = {
  list: async (req: Request, res: Response) => {
    const result = await emailService.list(req.query as never);
    res.json(paginatedResponse(result.items, result.meta));
  },
  getById: async (req: Request, res: Response) => {
    res.json(successResponse(await emailService.getById(req.params.id as string)));
  },
  send: async (req: Request, res: Response) => {
    res.status(201).json(successResponse(await emailService.send(req.body)));
  },
};

export const smsController = {
  list: async (req: Request, res: Response) => {
    const result = await smsService.list(req.query as never);
    res.json(paginatedResponse(result.items, result.meta));
  },
  getById: async (req: Request, res: Response) => {
    res.json(successResponse(await smsService.getById(req.params.id as string)));
  },
  send: async (req: Request, res: Response) => {
    res.status(201).json(successResponse(await smsService.send(req.body)));
  },
};

export const whatsAppController = {
  list: async (req: Request, res: Response) => {
    const result = await whatsAppService.list(req.query as never);
    res.json(paginatedResponse(result.items, result.meta));
  },
  getById: async (req: Request, res: Response) => {
    res.json(successResponse(await whatsAppService.getById(req.params.id as string)));
  },
  send: async (req: Request, res: Response) => {
    res.status(201).json(successResponse(await whatsAppService.send(req.body)));
  },
};

export const pushController = {
  list: async (req: Request, res: Response) => {
    const result = await pushService.list(req.query as never);
    res.json(paginatedResponse(result.items, result.meta));
  },
  getById: async (req: Request, res: Response) => {
    res.json(successResponse(await pushService.getById(req.params.id as string)));
  },
  send: async (req: Request, res: Response) => {
    res.status(201).json(successResponse(await pushService.send(req.body)));
  },
  registerDevice: async (req: Request, res: Response) => {
    res.status(201).json(successResponse(await pushService.registerDevice(req.user!.id, req.body)));
  },
};

export const communicationLogController = {
  list: async (req: Request, res: Response) => {
    const result = await communicationLogService.list(req.query as never);
    res.json(paginatedResponse(result.items, result.meta));
  },
  getById: async (req: Request, res: Response) => {
    res.json(successResponse(await communicationLogService.getById(req.params.id as string)));
  },
  analytics: async (req: Request, res: Response) => {
    res.json(successResponse(await notificationAnalyticsService.getSummary(req.query as never)));
  },
};
