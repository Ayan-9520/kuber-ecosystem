import type { Prisma } from '@kuberone/database';
import type { ListPushQueueQuery } from '@kuberone/shared-validation';

import { pushQueueRepository } from '../repositories/push.repository.js';
import { buildPaginationMeta } from '../utils/push.utils.js';

import { pushOrchestratorService } from './push-orchestrator.service.js';

export const pushQueueService = {
  async list(query: ListPushQueueQuery) {
    const where: Prisma.PushQueueWhereInput = {
      ...(query.status ? { status: query.status as never } : {}),
      ...(query.queueType ? { queueType: query.queueType as never } : {}),
      ...(query.priority ? { priority: query.priority as never } : {}),
    };
    const skip = (query.page - 1) * query.limit;
    const [items, total] = await Promise.all([
      pushQueueRepository.list(where, skip, query.limit),
      pushQueueRepository.count(where),
    ]);
    return { items, meta: buildPaginationMeta(query.page, query.limit, total) };
  },

  async processBatch(limit = 25) {
    const items = await pushQueueRepository.listPending(limit);
    let processed = 0;
    for (const item of items) {
      await pushQueueRepository.update(item.id, { status: 'PROCESSING' });
      try {
        if (item.recipientUserId) {
          const payload = (item.payload as Record<string, unknown>) ?? undefined;
          const eventType = typeof payload?.eventType === 'string' ? payload.eventType : undefined;
          await pushOrchestratorService.send({
            userId: item.recipientUserId,
            pushDeviceId: item.pushDeviceId ?? undefined,
            templateCode: item.templateCode ?? undefined,
            title: item.title ?? undefined,
            body: item.body ?? undefined,
            variables: (item.variables as Record<string, unknown>) ?? undefined,
            payload,
            eventType,
            topicCode: item.topicCode ?? undefined,
            retryCount: item.retryCount,
            priority: item.priority as string,
          });
        } else if (item.topicCode) {
          const { pushTopicService } = await import('./push-topic.service.js');
          await pushTopicService.sendToTopic({
            topicCode: item.topicCode,
            templateCode: item.templateCode ?? undefined,
            title: item.title ?? undefined,
            body: item.body ?? undefined,
            variables: (item.variables as Record<string, unknown>) ?? undefined,
            payload: (item.payload as Record<string, unknown>) ?? undefined,
          });
        }
        await pushQueueRepository.update(item.id, { status: 'COMPLETED', processedAt: new Date() });
        processed += 1;
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        const failed = item.retryCount + 1 >= item.maxRetries;
        await pushQueueRepository.update(item.id, {
          status: failed ? 'FAILED' : 'PENDING',
          retryCount: item.retryCount + 1,
          lastError: message,
          queueType: failed ? 'FAILED' : 'RETRY',
        });
      }
    }
    return { processed, total: items.length };
  },
};
