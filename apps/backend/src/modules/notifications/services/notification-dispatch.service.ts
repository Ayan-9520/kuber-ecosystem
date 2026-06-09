import type { Prisma } from '@kuberone/database';

import { prisma } from '../../../config/database.js';
import { PUSH_TEMPLATE_MAP } from '../../push/constants/push.constants.js';
import { notificationRepository } from '../repositories/notification.repository.js';

import { emailService } from './email.service.js';
import { notificationQueueService } from './notification-queue.service.js';
import { preferenceEngineService } from './preference-engine.service.js';
import { pushService } from './push.service.js';
import { smsService } from './sms.service.js';
import { templateEngineService } from './template-engine.service.js';
import { whatsAppService } from './whatsapp.service.js';


export const notificationDispatchService = {
  async dispatchToChannel(params: {
    userId: string;
    channel: string;
    eventType: string;
    templateCode?: string;
    title?: string;
    body?: string;
    variables?: Record<string, unknown>;
    payload?: Record<string, unknown>;
    entityType?: string;
    entityId?: string;
    deviceId?: string;
  }) {
    const user = await prisma.user.findUnique({ where: { id: params.userId } });
    if (!user) throw new Error('User not found');

    const rendered = await templateEngineService.render({
      templateCode: params.templateCode,
      channel: params.channel,
      eventType: params.eventType,
      subject: params.title,
      body: params.body,
      variables: params.variables,
    });

    switch (params.channel) {
      case 'IN_APP':
        return notificationRepository.create({
          user: { connect: { id: params.userId } },
          eventType: params.eventType as never,
          channel: 'IN_APP',
          template: rendered.templateId ? { connect: { id: rendered.templateId } } : undefined,
          title: rendered.subject ?? params.title ?? params.eventType.replace(/_/g, ' '),
          body: rendered.body,
          payload: params.payload as Prisma.InputJsonValue,
          status: 'SENT',
          entityType: params.entityType,
          entityId: params.entityId,
          sentAt: new Date(),
        });
      case 'EMAIL':
        if (!user.email) throw new Error('User email not available');
        return emailService.send({
          userId: params.userId,
          toEmail: user.email,
          templateCode: params.templateCode,
          subject: rendered.subject ?? params.title,
          body: rendered.body,
          variables: params.variables,
          eventType: params.eventType,
        });
      case 'SMS':
        if (!user.phone) throw new Error('User phone not available');
        return smsService.send({
          userId: params.userId,
          toPhone: user.phone,
          templateCode: params.templateCode,
          body: rendered.body,
          variables: params.variables,
          eventType: params.eventType,
        });
      case 'WHATSAPP':
        if (!user.phone) throw new Error('User phone not available');
        return whatsAppService.send({
          userId: params.userId,
          toPhone: user.phone,
          templateCode: params.templateCode,
          body: rendered.body,
          variables: params.variables,
          eventType: params.eventType,
        });
      case 'PUSH':
        return pushService.send({
          userId: params.userId,
          deviceId: params.deviceId,
          templateCode: params.templateCode ?? PUSH_TEMPLATE_MAP[params.eventType],
          title: rendered.subject ?? params.title,
          body: rendered.body,
          variables: params.variables,
          payload: {
            ...(params.payload ?? {}),
            entityType: params.entityType,
            entityId: params.entityId,
            screen: params.entityType ? String(params.entityType).toLowerCase() : undefined,
          },
          eventType: params.eventType,
          category: 'TRANSACTIONAL',
        });
      default:
        throw new Error(`Unsupported channel: ${params.channel}`);
    }
  },

  async dispatchMultiChannel(params: {
    userId: string;
    eventType: string;
    channels: string[];
    templateCode?: string;
    title?: string;
    body?: string;
    variables?: Record<string, unknown>;
    payload?: Record<string, unknown>;
    entityType?: string;
    entityId?: string;
    scheduleAt?: Date;
  }) {
    const enabledChannels = await preferenceEngineService.filterEnabledChannels(
      params.userId,
      params.eventType,
      params.channels,
    );

    if (params.scheduleAt && params.scheduleAt.getTime() > Date.now()) {
      const queued = [];
      for (const channel of enabledChannels) {
        queued.push(
          await notificationQueueService.enqueue({
            queueType: 'SCHEDULED',
            channel,
            eventType: params.eventType,
            recipientUserId: params.userId,
            payload: { ...params, channels: [channel] },
            scheduledAt: params.scheduleAt,
          }),
        );
      }
      return { scheduled: true, queued };
    }

    const results = [];
    for (const channel of enabledChannels) {
      results.push(
        await notificationDispatchService.dispatchToChannel({
          userId: params.userId,
          channel,
          eventType: params.eventType,
          templateCode: params.templateCode,
          title: params.title,
          body: params.body,
          variables: params.variables,
          payload: params.payload,
          entityType: params.entityType,
          entityId: params.entityId,
        }),
      );
    }
    return { scheduled: false, results };
  },
};
