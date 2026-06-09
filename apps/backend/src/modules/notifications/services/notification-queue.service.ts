import type { Prisma } from '@kuberone/database';

import { prisma } from '../../../config/database.js';
import { MAX_RETRY_COUNT, RETRY_DELAY_MS } from '../constants/notifications.constants.js';
import { notificationQueueRepository } from '../repositories/notification.repository.js';
import { buildPaginationMeta } from '../utils/notifications.utils.js';

import { deadLetterService } from './dead-letter.service.js';

export const notificationQueueService = {
  async enqueue(params: {
    queueType?: 'NOTIFICATION' | 'RETRY' | 'FAILED' | 'SCHEDULED';
    channel: string;
    eventType: string;
    recipientUserId?: string;
    payload: Record<string, unknown>;
    scheduledAt?: Date;
  }) {
    return notificationQueueRepository.enqueue({
      queueType: (params.queueType ?? (params.scheduledAt ? 'SCHEDULED' : 'NOTIFICATION')) as never,
      status: params.scheduledAt ? 'SCHEDULED' : 'PENDING',
      channel: params.channel as never,
      eventType: params.eventType as never,
      recipientUser: params.recipientUserId ? { connect: { id: params.recipientUserId } } : undefined,
      payload: params.payload as Prisma.InputJsonValue,
      scheduledAt: params.scheduledAt,
      maxRetries: MAX_RETRY_COUNT,
    });
  },

  async processBatch(limit = 20, processor: (item: { id: string; payload: unknown; channel: string; eventType: string; recipientUserId: string | null; retryCount: number }) => Promise<void>) {
    const items = await notificationQueueRepository.listPending(limit);
    const results: Array<{ id: string; success: boolean }> = [];

    for (const item of items) {
      await notificationQueueRepository.update(item.id, { status: 'PROCESSING' });
      try {
        await processor({
          id: item.id,
          payload: item.payload,
          channel: item.channel,
          eventType: item.eventType,
          recipientUserId: item.recipientUserId,
          retryCount: item.retryCount,
        });
        await notificationQueueRepository.update(item.id, { status: 'COMPLETED', processedAt: new Date() });
        results.push({ id: item.id, success: true });
      } catch (error) {
        const retryCount = item.retryCount + 1;
        const message = error instanceof Error ? error.message : 'Unknown error';
        if (retryCount >= item.maxRetries) {
          await notificationQueueRepository.update(item.id, {
            status: 'FAILED',
            queueType: 'FAILED',
            retryCount,
            lastError: message,
          });
          await deadLetterService.record({
            queueId: item.id,
            channel: item.channel,
            eventType: item.eventType,
            recipientUserId: item.recipientUserId ?? undefined,
            payload: item.payload as Record<string, unknown>,
            errorMessage: message,
            retryCount,
          });
        } else {
          await notificationQueueRepository.update(item.id, {
            status: 'PENDING',
            queueType: 'RETRY',
            retryCount,
            lastError: message,
            scheduledAt: new Date(Date.now() + RETRY_DELAY_MS * retryCount),
          });
        }
        results.push({ id: item.id, success: false });
      }
    }

    return results;
  },

  async listFailed(limit = 50) {
    return notificationQueueRepository.listFailed(limit);
  },

  async list(query: { page: number; limit: number; status?: string; channel?: string }) {
    const where: Prisma.NotificationQueueWhereInput = {
      ...(query.status ? { status: query.status as never } : {}),
      ...(query.channel ? { channel: query.channel as never } : {}),
    };
    const skip = (query.page - 1) * query.limit;
    const [items, total] = await Promise.all([
      prisma.notificationQueue.findMany({ where, skip, take: query.limit, orderBy: { createdAt: 'desc' } }),
      prisma.notificationQueue.count({ where }),
    ]);
    return { items, meta: buildPaginationMeta(query.page, query.limit, total) };
  },
};
