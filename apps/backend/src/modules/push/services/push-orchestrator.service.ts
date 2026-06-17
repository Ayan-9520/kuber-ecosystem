import type { Prisma } from '@kuberone/database';

import { ValidationError } from '../../../shared/errors/app-error.js';
import { communicationLogRepository, pushNotificationRepository } from '../../notifications/repositories/notification.repository.js';
import { channelStatusService } from '../../notifications/services/channel-status.service.js';
import { rateLimitService } from '../../notifications/services/rate-limit.service.js';
import { PUSH_MAX_RETRIES, TRANSACTIONAL_PUSH_EVENTS } from '../constants/push.constants.js';
import { resolveEnterprisePushProvider } from '../providers/push.factory.js';
import {
  pushAnalyticsRepository,
  pushDeliveryRepository,
  pushEventRepository,
  pushNotificationLogRepository,
  pushPreferenceRepository,
  pushProviderRepository,
  pushQueueRepository,
} from '../repositories/push.repository.js';
import type { SendPushParams } from '../types/push.types.js';
import { isInDoNotDisturb } from '../utils/push.utils.js';

import { pushDeviceService } from './push-device.service.js';
import { pushTemplateService } from './push-template.service.js';
import { pushTopicService } from './push-topic.service.js';

export const pushOrchestratorService = {
  async send(params: SendPushParams) {
    if (params.topicCode) {
      return pushTopicService.sendToTopic({
        topicCode: params.topicCode,
        templateCode: params.templateCode,
        title: params.title,
        body: params.body,
        variables: params.variables,
        payload: params.payload,
        eventType: params.eventType,
      });
    }

    const isTransactional = params.eventType && TRANSACTIONAL_PUSH_EVENTS.has(params.eventType);
    if (!isTransactional && params.category !== 'AUTH') {
      const pref = await pushPreferenceRepository.findForUser(
        params.userId,
        params.category,
        params.eventType,
        params.pushDeviceId,
      );
      if (pref && !pref.enabled) return { skipped: true, reason: 'User push preference disabled' };
      if (pref && isInDoNotDisturb(pref.muteUntil, pref.doNotDisturb)) {
        return { skipped: true, reason: 'Do not disturb active' };
      }
      if (params.category === 'MARKETING' && pref && !pref.marketingOptIn) {
        return { skipped: true, reason: 'Marketing opt-out' };
      }
    }

    if (params.scheduleAt && params.scheduleAt.getTime() > Date.now()) {
      const rendered = await pushTemplateService.render({
        templateCode: params.templateCode,
        eventType: params.eventType,
        title: params.title,
        body: params.body,
        variables: params.variables,
      });
      const queued = await pushQueueRepository.enqueue({
        queueType: 'SCHEDULED',
        status: 'PENDING',
        priority: (params.priority ?? 'NORMAL') as never,
        recipientUser: { connect: { id: params.userId } },
        templateCode: params.templateCode,
        title: rendered.title,
        body: rendered.body,
        variables: params.variables as Prisma.InputJsonValue,
        payload: params.payload as Prisma.InputJsonValue,
        scheduledAt: params.scheduleAt,
        maxRetries: PUSH_MAX_RETRIES,
      });
      return { scheduled: true, queueId: queued.id };
    }

    const tokens = await pushDeviceService.listActiveTokens(params.userId, params.deviceId, params.appTarget);
    if (tokens.length === 0) {
      return { skipped: true, reason: 'No active push devices' };
    }

    const results = [];
    for (const target of tokens) {
      results.push(
        await pushOrchestratorService.dispatchToToken({
          ...params,
          fcmToken: target.token,
          pushDeviceId: target.pushDeviceId,
          legacyDeviceId: target.legacyDeviceId ?? undefined,
        }),
      );
    }
    return results;
  },

  async dispatchToToken(
    params: SendPushParams & { fcmToken: string; pushDeviceId?: string; legacyDeviceId?: string },
  ) {
    const channel = channelStatusService.getStatus('push');
    if (!channel.deliverable) {
      return { skipped: true, reason: channelStatusService.skipReason('push') };
    }

    const rendered = await pushTemplateService.render({
      templateCode: params.templateCode,
      eventType: params.eventType,
      title: params.title,
      body: params.body,
      variables: params.variables,
    });

    const dbProvider = await pushProviderRepository.findDefault();
    const rateKey = `push:${params.userId}`;
    const rateLimit = dbProvider?.rateLimit ?? 100;
    if (rateLimit && !(await rateLimitService.checkAsync(rateKey, rateLimit))) {
      throw new ValidationError({ rateLimit: ['Push rate limit exceeded'] });
    }

    const notificationLog = await pushNotificationRepository.create({
      user: { connect: { id: params.userId } },
      device: params.legacyDeviceId ? { connect: { id: params.legacyDeviceId } } : undefined,
      fcmToken: params.fcmToken,
      title: rendered.title,
      body: rendered.body,
      payload: params.payload as Prisma.InputJsonValue,
      status: 'QUEUED',
    });

    const delivery = await pushDeliveryRepository.create({
      pushNotificationId: notificationLog.id,
      provider: dbProvider ? { connect: { id: dbProvider.id } } : undefined,
      pushDeviceId: params.pushDeviceId,
      templateId: rendered.templateId,
      status: 'QUEUED',
      queuedAt: new Date(),
    });

    await pushEventRepository.create({
      delivery: { connect: { id: delivery.id } },
      eventType: 'QUEUED',
    });

    const provider = resolveEnterprisePushProvider(dbProvider?.providerType);
    const result = await provider.send({
      token: params.fcmToken,
      title: rendered.title,
      body: rendered.body,
      data: {
        ...(params.payload ?? {}),
        eventType: params.eventType,
        deliveryId: delivery.id,
        templateCode: rendered.templateCode,
        screen: (params.payload?.screen as string | undefined) ?? undefined,
        entityId: (params.payload?.entityId as string | undefined) ?? undefined,
      },
    });

    const now = new Date();
    const failed = !result.success;
    const retryCount = notificationLog.retryCount;

    await pushNotificationRepository.update(notificationLog.id, {
      status: failed ? (retryCount >= PUSH_MAX_RETRIES ? 'FAILED' : 'QUEUED') : 'SENT',
      providerRef: result.providerRef,
      sentAt: failed ? undefined : now,
      failedAt: failed ? now : undefined,
      failureReason: result.error,
      retryCount: failed ? retryCount + 1 : retryCount,
    });

    await pushDeliveryRepository.update(delivery.id, {
      status: failed ? 'FAILED' : 'SENT',
      providerRef: result.providerRef,
      sentAt: failed ? undefined : now,
      failedAt: failed ? now : undefined,
      failureReason: result.error,
      retryCount: failed ? retryCount + 1 : retryCount,
    });

    await pushEventRepository.create({
      delivery: { connect: { id: delivery.id } },
      eventType: failed ? 'FAILED' : 'SENT',
      metadata: result.error ? { error: result.error } : undefined,
    });

    await pushNotificationLogRepository.create({
      delivery: { connect: { id: delivery.id } },
      action: failed ? 'SEND_FAILED' : 'SENT',
      status: failed ? 'FAILED' : 'SENT',
      metadata: { providerRef: result.providerRef },
    });

    await communicationLogRepository.create({
      channel: 'PUSH',
      eventType: params.eventType as never,
      recipientUser: { connect: { id: params.userId } },
      recipientAddress: params.fcmToken,
      subject: rendered.title,
      renderedBody: rendered.body,
      payload: params.payload as Prisma.InputJsonValue,
      status: failed ? 'FAILED' : 'SENT',
      providerRef: result.providerRef,
      sentAt: failed ? undefined : now,
      failedAt: failed ? now : undefined,
      failureReason: result.error,
      retryCount: failed ? retryCount + 1 : retryCount,
    });

    await pushAnalyticsRepository.upsertDaily({
      date: now,
      templateId: rendered.templateId,
      category: rendered.category ?? params.category,
      providerId: dbProvider?.id,
      field: failed ? 'failedCount' : 'sentCount',
    });

    if (failed && retryCount < PUSH_MAX_RETRIES) {
      await pushQueueRepository.enqueue({
        queueType: 'RETRY',
        status: 'PENDING',
        priority: (params.priority ?? 'NORMAL') as never,
        recipientUser: { connect: { id: params.userId } },
        pushDeviceId: params.pushDeviceId,
        templateCode: params.templateCode ?? rendered.templateCode,
        title: rendered.title,
        body: rendered.body,
        variables: params.variables as Prisma.InputJsonValue,
        payload: params.payload as Prisma.InputJsonValue,
        pushNotificationId: notificationLog.id,
        maxRetries: PUSH_MAX_RETRIES,
        lastError: result.error,
      });
    }

    return { ...notificationLog, delivery, providerRef: result.providerRef, success: result.success };
  },

  async dispatchNow(params: SendPushParams) {
    return pushOrchestratorService.send(params);
  },
};
