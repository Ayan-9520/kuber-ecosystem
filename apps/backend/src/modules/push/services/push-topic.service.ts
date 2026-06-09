import type { Prisma } from '@kuberone/database';
import type { ListPushTopicsQuery, SubscribePushTopicInput } from '@kuberone/shared-validation';

import { NotFoundError } from '../../../shared/errors/app-error.js';
import { communicationLogRepository } from '../../notifications/repositories/notification.repository.js';
import { rateLimitService } from '../../notifications/services/rate-limit.service.js';
import { resolveEnterprisePushProvider } from '../providers/push.factory.js';
import {
  pushAnalyticsRepository,
  pushProviderRepository,
  pushTopicRepository,
} from '../repositories/push.repository.js';
import { buildPaginationMeta } from '../utils/push.utils.js';

import { pushDeviceService } from './push-device.service.js';
import { pushTemplateService } from './push-template.service.js';

type CreatePushTopicInput = {
  code: string;
  name: string;
  description?: string;
  topicType?: string;
  appTarget?: string;
  isActive?: boolean;
};

export const pushTopicService = {
  async list(query: ListPushTopicsQuery) {
    const where: Prisma.PushTopicWhereInput = {
      ...(query.topicType ? { topicType: query.topicType as never } : {}),
      ...(query.appTarget ? { appTarget: query.appTarget } : {}),
      ...(query.isActive !== undefined ? { isActive: query.isActive } : {}),
    };
    const skip = (query.page - 1) * query.limit;
    const [items, total] = await Promise.all([
      pushTopicRepository.list(where, skip, query.limit),
      pushTopicRepository.count(where),
    ]);
    return { items, meta: buildPaginationMeta(query.page, query.limit, total) };
  },

  async create(input: CreatePushTopicInput) {
    return pushTopicRepository.create({
      code: input.code,
      name: input.name,
      description: input.description,
      topicType: input.topicType as never,
      appTarget: input.appTarget,
      isActive: input.isActive,
    });
  },

  async subscribe(userId: string, input: SubscribePushTopicInput) {
    const topic = await pushTopicRepository.findByCode(input.topicCode);
    if (!topic || !topic.isActive) throw new NotFoundError('PushTopic', input.topicCode);

    const sub = await pushTopicRepository.subscribe(topic.id, userId, input.deviceId);

    const tokens = await pushDeviceService.listActiveTokens(userId, input.deviceId);
    const provider = resolveEnterprisePushProvider();
    for (const t of tokens) {
      if (provider.subscribeToTopic) {
        await provider.subscribeToTopic(t.token, input.topicCode);
      }
    }

    return sub;
  },

  async unsubscribe(userId: string, input: SubscribePushTopicInput) {
    const topic = await pushTopicRepository.findByCode(input.topicCode);
    if (!topic) throw new NotFoundError('PushTopic', input.topicCode);

    const result = await pushTopicRepository.unsubscribe(topic.id, userId, input.deviceId);

    const tokens = await pushDeviceService.listActiveTokens(userId, input.deviceId);
    const provider = resolveEnterprisePushProvider();
    for (const t of tokens) {
      if (provider.unsubscribeFromTopic) {
        await provider.unsubscribeFromTopic(t.token, input.topicCode);
      }
    }

    return result;
  },

  async listSubscriptions(userId: string) {
    return pushTopicRepository.listSubscriptions(userId);
  },

  async sendToTopic(params: {
    topicCode: string;
    templateCode?: string;
    title?: string;
    body?: string;
    variables?: Record<string, unknown>;
    payload?: Record<string, unknown>;
    eventType?: string;
  }) {
    const topic = await pushTopicRepository.findByCode(params.topicCode);
    if (!topic) throw new NotFoundError('PushTopic', params.topicCode);

    const rendered = await pushTemplateService.render({
      templateCode: params.templateCode,
      eventType: params.eventType,
      title: params.title,
      body: params.body,
      variables: params.variables,
    });

    const dbProvider = await pushProviderRepository.findDefault();
    const rateLimit = dbProvider?.rateLimit ?? 200;
    if (rateLimit && !rateLimitService.check(`push-topic:${params.topicCode}`, rateLimit)) {
      throw new Error('Push topic rate limit exceeded');
    }

    const provider = resolveEnterprisePushProvider(dbProvider?.providerType);
    const result = provider.sendToTopic
      ? await provider.sendToTopic({
          topic: params.topicCode,
          title: rendered.title,
          body: rendered.body,
          data: params.payload,
        })
      : { success: false, error: 'Topic push not supported' };

    const now = new Date();
    await communicationLogRepository.create({
      channel: 'PUSH',
      eventType: params.eventType as never,
      recipientAddress: `topic:${params.topicCode}`,
      subject: rendered.title,
      renderedBody: rendered.body,
      payload: params.payload as Prisma.InputJsonValue,
      status: result.success ? 'SENT' : 'FAILED',
      providerRef: result.providerRef,
      sentAt: result.success ? now : undefined,
      failedAt: result.success ? undefined : now,
      failureReason: result.error,
    });

    await pushAnalyticsRepository.upsertDaily({
      date: now,
      templateId: rendered.templateId,
      category: rendered.category,
      providerId: dbProvider?.id,
      topicCode: params.topicCode,
      field: result.success ? 'sentCount' : 'failedCount',
    });

    return result;
  },
};
