import type { Prisma } from '@kuberone/database';
import type { ListCommunicationLogsQuery, NotificationAnalyticsQuery } from '@kuberone/shared-validation';

import { NotFoundError } from '../../../shared/errors/app-error.js';
import { communicationLogRepository } from '../repositories/notification.repository.js';
import { buildPaginationMeta, pct } from '../utils/notifications.utils.js';

export const communicationLogService = {
  async list(query: ListCommunicationLogsQuery) {
    const where: Prisma.CommunicationLogWhereInput = {
      ...(query.channel ? { channel: query.channel as never } : {}),
      ...(query.eventType ? { eventType: query.eventType as never } : {}),
      ...(query.status ? { status: query.status as never } : {}),
      ...(query.recipientUserId ? { recipientUserId: query.recipientUserId } : {}),
      ...(query.fromDate || query.toDate
        ? {
            createdAt: {
              ...(query.fromDate ? { gte: query.fromDate } : {}),
              ...(query.toDate ? { lte: query.toDate } : {}),
            },
          }
        : {}),
    };
    const skip = (query.page - 1) * query.limit;
    const orderBy = { [query.sortBy]: query.sortOrder };

    const [items, total] = await Promise.all([
      communicationLogRepository.list(where, skip, query.limit, orderBy),
      communicationLogRepository.count(where),
    ]);

    return { items, meta: buildPaginationMeta(query.page, query.limit, total) };
  },

  async getById(id: string) {
    const item = await communicationLogRepository.findById(id);
    if (!item) throw new NotFoundError('CommunicationLog', id);
    return item;
  },
};

export const notificationAnalyticsService = {
  async getSummary(query: NotificationAnalyticsQuery) {
    const where: Prisma.CommunicationLogWhereInput = {
      ...(query.channel ? { channel: query.channel as never } : {}),
      ...(query.fromDate || query.toDate
        ? {
            createdAt: {
              ...(query.fromDate ? { gte: query.fromDate } : {}),
              ...(query.toDate ? { lte: query.toDate } : {}),
            },
          }
        : {}),
    };

    const groups = await communicationLogRepository.aggregateByChannel(where);
    const total = groups.reduce((sum, g) => sum + g._count, 0);
    const sent = groups.filter((g) => ['SENT', 'DELIVERED', 'OPENED', 'CLICKED'].includes(g.status)).reduce((s, g) => s + g._count, 0);
    const delivered = groups.filter((g) => ['DELIVERED', 'OPENED', 'CLICKED'].includes(g.status)).reduce((s, g) => s + g._count, 0);
    const opened = groups.filter((g) => ['OPENED', 'CLICKED'].includes(g.status)).reduce((s, g) => s + g._count, 0);
    const clicked = groups.filter((g) => g.status === 'CLICKED').reduce((s, g) => s + g._count, 0);
    const failed = groups.filter((g) => g.status === 'FAILED').reduce((s, g) => s + g._count, 0);

    const channelPerformance = Object.values(
      groups.reduce<Record<string, { channel: string; total: number; sent: number; failed: number }>>((acc, g) => {
        const key = g.channel;
        const entry = acc[key] ?? { channel: key, total: 0, sent: 0, failed: 0 };
        entry.total += g._count;
        if (['SENT', 'DELIVERED', 'OPENED', 'CLICKED'].includes(g.status)) entry.sent += g._count;
        if (g.status === 'FAILED') entry.failed += g._count;
        acc[key] = entry;
        return acc;
      }, {}),
    ).map((c) => ({
      ...c,
      deliveryRate: pct(c.sent, c.total),
      failureRate: pct(c.failed, c.total),
    }));

    return {
      messagesSent: total,
      deliveryRate: pct(delivered, total),
      openRate: pct(opened, total),
      clickRate: pct(clicked, total),
      failureRate: pct(failed, total),
      channelPerformance,
      sentCount: sent,
      deliveredCount: delivered,
      openedCount: opened,
      clickedCount: clicked,
      failedCount: failed,
    };
  },
};
