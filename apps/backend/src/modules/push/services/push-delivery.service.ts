import type { Prisma } from '@kuberone/database';
import type { ListPushLogsQuery } from '@kuberone/shared-validation';

import { prisma } from '../../../config/database.js';
import { NotFoundError } from '../../../shared/errors/app-error.js';
import { pushNotificationRepository } from '../../notifications/repositories/notification.repository.js';
import { pushDeliveryRepository } from '../repositories/push.repository.js';
import { buildPaginationMeta } from '../utils/push.utils.js';

export const pushDeliveryService = {
  async list(query: ListPushLogsQuery) {
    const where: Prisma.PushNotificationDeliveryWhereInput = {
      ...(query.status ? { status: query.status as never } : {}),
      ...(query.fromDate || query.toDate
        ? { createdAt: { ...(query.fromDate ? { gte: query.fromDate } : {}), ...(query.toDate ? { lte: query.toDate } : {}) } }
        : {}),
    };

    if (query.recipientUserId) {
      const notifications = await prisma.pushNotification.findMany({
        where: { userId: query.recipientUserId },
        select: { id: true },
      });
      where.pushNotificationId = { in: notifications.map((n) => n.id) };
    }

    if (query.templateCode) {
      const template = await prisma.pushTemplate.findFirst({ where: { code: query.templateCode } });
      if (template) where.templateId = template.id;
    }

    if (query.category) {
      const templates = await prisma.pushTemplate.findMany({
        where: { category: query.category as never },
        select: { id: true },
      });
      where.templateId = { in: templates.map((t) => t.id) };
    }

    const skip = (query.page - 1) * query.limit;
    const orderBy = { [query.sortBy]: query.sortOrder };
    const [rows, total] = await Promise.all([
      pushDeliveryRepository.list(where, skip, query.limit, orderBy),
      pushDeliveryRepository.count(where),
    ]);

    const notificationIds = rows.map((r) => r.pushNotificationId);
    const notifications = notificationIds.length
      ? await prisma.pushNotification.findMany({ where: { id: { in: notificationIds } } })
      : [];
    const notifById = new Map(notifications.map((n) => [n.id, n]));

    const items = rows.map((row) => ({
      ...row,
      pushNotification: notifById.get(row.pushNotificationId) ?? null,
      title: notifById.get(row.pushNotificationId)?.title,
      toUserId: notifById.get(row.pushNotificationId)?.userId,
      fcmToken: notifById.get(row.pushNotificationId)?.fcmToken,
    }));

    return { items, meta: buildPaginationMeta(query.page, query.limit, total) };
  },

  async getById(id: string) {
    const byDeliveryId = await pushDeliveryRepository.findById(id);
    if (byDeliveryId) return byDeliveryId;

    const byNotificationId = await pushDeliveryRepository.findByPushNotificationId(id);
    if (byNotificationId) return byNotificationId;

    const legacy = await pushNotificationRepository.findById(id);
    if (!legacy) throw new NotFoundError('PushNotification', id);
    return legacy;
  },
};
