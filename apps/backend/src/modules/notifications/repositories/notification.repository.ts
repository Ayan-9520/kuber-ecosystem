import type { Prisma } from '@kuberone/database';

import { prisma } from '../../../config/database.js';
import { communicationLogInclude, notificationInclude, templateInclude } from '../types/notifications.types.js';

export const notificationRepository = {
  list(where: Prisma.NotificationWhereInput, skip: number, take: number, orderBy: Prisma.NotificationOrderByWithRelationInput) {
    return prisma.notification.findMany({ where, skip, take, orderBy, include: notificationInclude });
  },
  count(where: Prisma.NotificationWhereInput) {
    return prisma.notification.count({ where });
  },
  findById(id: string) {
    return prisma.notification.findUnique({ where: { id }, include: notificationInclude });
  },
  create(data: Prisma.NotificationCreateInput) {
    return prisma.notification.create({ data, include: notificationInclude });
  },
  update(id: string, data: Prisma.NotificationUpdateInput) {
    return prisma.notification.update({ where: { id }, data, include: notificationInclude });
  },
  softDelete(id: string, deletedById: string) {
    return prisma.notification.update({ where: { id }, data: { deletedAt: new Date(), deletedById }, include: notificationInclude });
  },
  markAllRead(userId: string) {
    return prisma.notification.updateMany({ where: { userId, readAt: null, deletedAt: null }, data: { readAt: new Date(), status: 'READ' } });
  },
};

export const notificationTemplateRepository = {
  list(where: Prisma.NotificationTemplateWhereInput, skip: number, take: number, orderBy: Prisma.NotificationTemplateOrderByWithRelationInput) {
    return prisma.notificationTemplate.findMany({ where, skip, take, orderBy, include: templateInclude });
  },
  count(where: Prisma.NotificationTemplateWhereInput) {
    return prisma.notificationTemplate.count({ where });
  },
  findById(id: string) {
    return prisma.notificationTemplate.findUnique({ where: { id }, include: templateInclude });
  },
  findActiveByCode(code: string, channel?: string) {
    return prisma.notificationTemplate.findFirst({
      where: { code, isActive: true, deletedAt: null, ...(channel ? { channel: channel as never } : {}) },
      orderBy: { version: 'desc' },
    });
  },
  findActiveByEventAndChannel(eventType: string, channel: string) {
    return prisma.notificationTemplate.findFirst({
      where: { eventType: eventType as never, channel: channel as never, isActive: true, deletedAt: null },
      orderBy: { version: 'desc' },
    });
  },
  getLatestVersion(code: string) {
    return prisma.notificationTemplate.findFirst({ where: { code }, orderBy: { version: 'desc' }, select: { version: true } });
  },
  create(data: Prisma.NotificationTemplateCreateInput) {
    return prisma.notificationTemplate.create({ data, include: templateInclude });
  },
  update(id: string, data: Prisma.NotificationTemplateUpdateInput) {
    return prisma.notificationTemplate.update({ where: { id }, data, include: templateInclude });
  },
  softDelete(id: string, deletedById: string) {
    return prisma.notificationTemplate.update({ where: { id }, data: { deletedAt: new Date(), deletedById, isActive: false } });
  },
};

export const notificationPreferenceRepository = {
  list(where: Prisma.NotificationPreferenceWhereInput, skip: number, take: number, orderBy: Prisma.NotificationPreferenceOrderByWithRelationInput) {
    return prisma.notificationPreference.findMany({ where, skip, take, orderBy });
  },
  count(where: Prisma.NotificationPreferenceWhereInput) {
    return prisma.notificationPreference.count({ where });
  },
  findUnique(userId: string, eventType: string, channel: string) {
    return prisma.notificationPreference.findUnique({
      where: { userId_eventType_channel: { userId, eventType: eventType as never, channel: channel as never } },
    });
  },
  upsert(userId: string, eventType: string, channel: string, enabled: boolean) {
    return prisma.notificationPreference.upsert({
      where: { userId_eventType_channel: { userId, eventType: eventType as never, channel: channel as never } },
      update: { enabled },
      create: { userId, eventType: eventType as never, channel: channel as never, enabled },
    });
  },
};

export const communicationLogRepository = {
  list(where: Prisma.CommunicationLogWhereInput, skip: number, take: number, orderBy: Prisma.CommunicationLogOrderByWithRelationInput) {
    return prisma.communicationLog.findMany({ where, skip, take, orderBy, include: communicationLogInclude });
  },
  count(where: Prisma.CommunicationLogWhereInput) {
    return prisma.communicationLog.count({ where });
  },
  findById(id: string) {
    return prisma.communicationLog.findUnique({ where: { id }, include: communicationLogInclude });
  },
  create(data: Prisma.CommunicationLogCreateInput) {
    return prisma.communicationLog.create({ data, include: communicationLogInclude });
  },
  update(id: string, data: Prisma.CommunicationLogUpdateInput) {
    return prisma.communicationLog.update({ where: { id }, data, include: communicationLogInclude });
  },
  aggregateByChannel(where: Prisma.CommunicationLogWhereInput) {
    return prisma.communicationLog.groupBy({ by: ['channel', 'status'], where, _count: true });
  },
  findByProviderRef(providerRef: string) {
    return prisma.communicationLog.findFirst({ where: { providerRef } });
  },
};

export const emailLogRepository = {
  list(where: Prisma.EmailLogWhereInput, skip: number, take: number, orderBy: Prisma.EmailLogOrderByWithRelationInput) {
    return prisma.emailLog.findMany({ where, skip, take, orderBy, include: { template: true, recipientUser: { select: { id: true, email: true } } } });
  },
  count(where: Prisma.EmailLogWhereInput) {
    return prisma.emailLog.count({ where });
  },
  findById(id: string) {
    return prisma.emailLog.findUnique({ where: { id }, include: { template: true } });
  },
  create(data: Prisma.EmailLogCreateInput) {
    return prisma.emailLog.create({ data });
  },
  update(id: string, data: Prisma.EmailLogUpdateInput) {
    return prisma.emailLog.update({ where: { id }, data });
  },
  findByProviderRef(providerRef: string) {
    return prisma.emailLog.findFirst({ where: { providerRef } });
  },
};

export const smsLogRepository = {
  list(where: Prisma.SmsLogWhereInput, skip: number, take: number, orderBy: Prisma.SmsLogOrderByWithRelationInput) {
    return prisma.smsLog.findMany({ where, skip, take, orderBy, include: { template: true } });
  },
  count(where: Prisma.SmsLogWhereInput) {
    return prisma.smsLog.count({ where });
  },
  findById(id: string) {
    return prisma.smsLog.findUnique({ where: { id } });
  },
  create(data: Prisma.SmsLogCreateInput) {
    return prisma.smsLog.create({ data });
  },
  update(id: string, data: Prisma.SmsLogUpdateInput) {
    return prisma.smsLog.update({ where: { id }, data });
  },
  findByProviderRef(providerRef: string) {
    return prisma.smsLog.findFirst({ where: { providerRef } });
  },
};

export const whatsAppLogRepository = {
  list(where: Prisma.WhatsAppLogWhereInput, skip: number, take: number, orderBy: Prisma.WhatsAppLogOrderByWithRelationInput) {
    return prisma.whatsAppLog.findMany({ where, skip, take, orderBy, include: { template: true } });
  },
  count(where: Prisma.WhatsAppLogWhereInput) {
    return prisma.whatsAppLog.count({ where });
  },
  findById(id: string) {
    return prisma.whatsAppLog.findUnique({ where: { id } });
  },
  create(data: Prisma.WhatsAppLogCreateInput) {
    return prisma.whatsAppLog.create({ data });
  },
  update(id: string, data: Prisma.WhatsAppLogUpdateInput) {
    return prisma.whatsAppLog.update({ where: { id }, data });
  },
  findByProviderRef(providerRef: string) {
    return prisma.whatsAppLog.findFirst({ where: { providerRef } });
  },
};

export const pushNotificationRepository = {
  list(where: Prisma.PushNotificationWhereInput, skip: number, take: number, orderBy: Prisma.PushNotificationOrderByWithRelationInput) {
    return prisma.pushNotification.findMany({ where, skip, take, orderBy, include: { template: true, device: true } });
  },
  count(where: Prisma.PushNotificationWhereInput) {
    return prisma.pushNotification.count({ where });
  },
  findById(id: string) {
    return prisma.pushNotification.findUnique({ where: { id }, include: { template: true, device: true } });
  },
  create(data: Prisma.PushNotificationCreateInput) {
    return prisma.pushNotification.create({ data });
  },
  update(id: string, data: Prisma.PushNotificationUpdateInput) {
    return prisma.pushNotification.update({ where: { id }, data });
  },
};

export const notificationQueueRepository = {
  enqueue(data: Prisma.NotificationQueueCreateInput) {
    return prisma.notificationQueue.create({ data });
  },
  listPending(limit: number) {
    return prisma.notificationQueue.findMany({
      where: {
        status: { in: ['PENDING', 'SCHEDULED'] },
        OR: [{ scheduledAt: null }, { scheduledAt: { lte: new Date() } }],
      },
      orderBy: { createdAt: 'asc' },
      take: limit,
    });
  },
  listFailed(limit: number) {
    return prisma.notificationQueue.findMany({ where: { queueType: 'FAILED', status: 'FAILED' }, take: limit, orderBy: { updatedAt: 'desc' } });
  },
  update(id: string, data: Prisma.NotificationQueueUpdateInput) {
    return prisma.notificationQueue.update({ where: { id }, data });
  },
};
