import type { Request, Response } from 'express';

import { paginatedResponse, successResponse } from '../../../shared/responses/success-response.js';
import { emailWebhookService } from '../../email/email.module.js';
import { smsWebhookService } from '../../sms/sms.module.js';
import { deadLetterService } from '../services/dead-letter.service.js';
import { notificationQueueService } from '../services/notification-queue.service.js';
import { providerConfigService } from '../services/provider-config.service.js';
import { pushService } from '../services/push.service.js';
import { webhookService } from '../services/webhook.service.js';

export const providerConfigController = {
  list: async (req: Request, res: Response) => {
    const result = await providerConfigService.list(req.query as never);
    res.json(paginatedResponse(result.items, result.meta));
  },
  getById: async (req: Request, res: Response) => {
    res.json(successResponse(await providerConfigService.getById(req.params.id as string)));
  },
  create: async (req: Request, res: Response) => {
    res.status(201).json(successResponse(await providerConfigService.create(req.body)));
  },
  update: async (req: Request, res: Response) => {
    res.json(successResponse(await providerConfigService.update(req.params.id as string, req.body)));
  },
};

export const deadLetterController = {
  list: async (req: Request, res: Response) => {
    const result = await deadLetterService.list(req.query as never);
    res.json(paginatedResponse(result.items, result.meta));
  },
  resolve: async (req: Request, res: Response) => {
    res.json(successResponse(await deadLetterService.resolve(req.params.id as string)));
  },
};

export const notificationQueueController = {
  list: async (req: Request, res: Response) => {
    const result = await notificationQueueService.list(req.query as never);
    res.json(paginatedResponse(result.items, result.meta));
  },
};

export const pushTopicController = {
  subscribe: async (req: Request, res: Response) => {
    const { topicCode, deviceId } = req.body as { topicCode: string; deviceId?: string };
    res.status(201).json(successResponse(await pushService.subscribeTopic(req.user!.id, topicCode, deviceId)));
  },
  unsubscribe: async (req: Request, res: Response) => {
    const { topicCode, deviceId } = req.body as { topicCode: string; deviceId?: string };
    res.json(successResponse(await pushService.unsubscribeTopic(req.user!.id, topicCode, deviceId)));
  },
  listSubscriptions: async (req: Request, res: Response) => {
    res.json(successResponse(await pushService.listTopics(req.user!.id)));
  },
  sendToTopic: async (req: Request, res: Response) => {
    res.status(201).json(successResponse(await pushService.sendToTopic(req.body)));
  },
};

export const webhookController = {
  whatsapp: async (req: Request, res: Response) => {
    if (req.query['hub.mode'] === 'subscribe') {
      const challenge = req.query['hub.challenge'];
      res.status(200).send(challenge);
      return;
    }
    const result = await webhookService.handleWhatsApp(req.body);
    res.json(successResponse(result));
  },
  sendgrid: async (req: Request, res: Response) => {
    const events = Array.isArray(req.body) ? req.body : [req.body];
    const [legacy, enterprise] = await Promise.all([
      webhookService.handleSendGrid(events),
      emailWebhookService.handleSendGrid(events),
    ]);
    res.json(successResponse({ legacy, enterprise }));
  },
  smsDlr: async (req: Request, res: Response) => {
    const [legacy, enterprise] = await Promise.all([
      webhookService.handleSmsDlr(req.body),
      smsWebhookService.handleDlr(req.body),
    ]);
    res.json(successResponse({ legacy, enterprise }));
  },
};
