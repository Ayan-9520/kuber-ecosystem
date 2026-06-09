import type { Prisma } from '@kuberone/database';
import type { ListDeadLettersQuery } from '@kuberone/shared-validation';

import { deadLetterRepository } from '../repositories/communication-channels.repository.js';
import { buildPaginationMeta } from '../utils/notifications.utils.js';

export const deadLetterService = {
  async record(params: {
    queueId?: string;
    channel: string;
    eventType: string;
    recipientUserId?: string;
    payload: Record<string, unknown>;
    errorMessage: string;
    retryCount: number;
  }) {
    return deadLetterRepository.create({
      queueId: params.queueId,
      channel: params.channel as never,
      eventType: params.eventType as never,
      recipientUserId: params.recipientUserId,
      payload: params.payload as Prisma.InputJsonValue,
      errorMessage: params.errorMessage,
      retryCount: params.retryCount,
    });
  },

  async list(query: ListDeadLettersQuery) {
    const where: Prisma.NotificationDeadLetterWhereInput = {
      ...(query.channel ? { channel: query.channel as never } : {}),
      ...(query.resolved === false ? { resolvedAt: null } : {}),
      ...(query.resolved === true ? { resolvedAt: { not: null } } : {}),
    };
    const skip = (query.page - 1) * query.limit;
    const [items, total] = await Promise.all([
      deadLetterRepository.list(where, skip, query.limit),
      deadLetterRepository.count(where),
    ]);
    return { items, meta: buildPaginationMeta(query.page, query.limit, total) };
  },

  async resolve(id: string) {
    return deadLetterRepository.resolve(id);
  },
};
