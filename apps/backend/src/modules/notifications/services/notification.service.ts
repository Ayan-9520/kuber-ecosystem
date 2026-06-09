import type { Prisma } from '@kuberone/database';
import type { ListNotificationsQuery, SendNotificationInput } from '@kuberone/shared-validation';

import { NotFoundError } from '../../../shared/errors/app-error.js';
import { authAuditRepository } from '../../auth/repositories/audit.repository.js';
import { notificationRepository } from '../repositories/notification.repository.js';
import type { RequestContext } from '../types/notifications.types.js';
import { auditNotificationMutation, buildPaginationMeta } from '../utils/notifications.utils.js';

import { notificationDispatchService } from './notification-dispatch.service.js';
import { notificationQueueService } from './notification-queue.service.js';

export const notificationService = {
  async list(query: ListNotificationsQuery) {
    const where: Prisma.NotificationWhereInput = {
      ...(query.includeDeleted ? {} : { deletedAt: null }),
      ...(query.userId ? { userId: query.userId } : {}),
      ...(query.eventType ? { eventType: query.eventType as never } : {}),
      ...(query.channel ? { channel: query.channel as never } : {}),
      ...(query.status ? { status: query.status as never } : {}),
      ...(query.unreadOnly ? { readAt: null } : {}),
    };
    const skip = (query.page - 1) * query.limit;
    const orderBy = { [query.sortBy]: query.sortOrder };

    const [items, total] = await Promise.all([
      notificationRepository.list(where, skip, query.limit, orderBy),
      notificationRepository.count(where),
    ]);

    return { items, meta: buildPaginationMeta(query.page, query.limit, total) };
  },

  async getById(id: string) {
    const item = await notificationRepository.findById(id);
    if (!item || item.deletedAt) throw new NotFoundError('Notification', id);
    return item;
  },

  async send(input: SendNotificationInput, ctx: RequestContext) {
    const result = await notificationDispatchService.dispatchMultiChannel(input);
    await auditNotificationMutation(authAuditRepository.log, ctx, 'NOTIFICATION_SENT', input.userId, {
      eventType: input.eventType,
      channels: input.channels,
    });
    return result;
  },

  async markRead(id: string, ctx: RequestContext) {
    await notificationService.getById(id);
    const item = await notificationRepository.update(id, { readAt: new Date(), status: 'READ' });
    await auditNotificationMutation(authAuditRepository.log, ctx, 'NOTIFICATION_READ', id);
    return item;
  },

  async markAllRead(userId: string, ctx: RequestContext) {
    const result = await notificationRepository.markAllRead(userId);
    await auditNotificationMutation(authAuditRepository.log, ctx, 'NOTIFICATIONS_READ_ALL', userId);
    return result;
  },

  async remove(id: string, ctx: RequestContext) {
    await notificationService.getById(id);
    await notificationRepository.softDelete(id, ctx.actorId);
    await auditNotificationMutation(authAuditRepository.log, ctx, 'NOTIFICATION_DELETED', id);
    return { id, deleted: true };
  },

  async processQueue(limit = 20) {
    return notificationQueueService.processBatch(limit, async (item) => {
      const payload = item.payload as SendNotificationInput & { channels?: string[] };
      await notificationDispatchService.dispatchToChannel({
        userId: payload.userId ?? item.recipientUserId!,
        channel: item.channel,
        eventType: item.eventType,
        templateCode: payload.templateCode,
        title: payload.title,
        body: payload.body,
        variables: payload.variables,
        payload: payload.payload,
        entityType: payload.entityType,
        entityId: payload.entityId,
      });
    });
  },
};
