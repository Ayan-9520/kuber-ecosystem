import type { Prisma } from '@kuberone/database';

import { prisma } from '../../../config/database.js';

export const communicationProviderRepository = {
  list(where: Prisma.CommunicationProviderWhereInput, skip: number, take: number) {
    return prisma.communicationProvider.findMany({ where, skip, take, orderBy: { channel: 'asc' } });
  },
  count(where: Prisma.CommunicationProviderWhereInput) {
    return prisma.communicationProvider.count({ where });
  },
  findById(id: string) {
    return prisma.communicationProvider.findUnique({ where: { id } });
  },
  findByCode(code: string) {
    return prisma.communicationProvider.findUnique({ where: { code } });
  },
  findDefault(channel: string) {
    return prisma.communicationProvider.findFirst({
      where: { channel: channel as never, isActive: true, isDefault: true },
    });
  },
  create(data: Prisma.CommunicationProviderCreateInput) {
    return prisma.communicationProvider.create({ data });
  },
  update(id: string, data: Prisma.CommunicationProviderUpdateInput) {
    return prisma.communicationProvider.update({ where: { id }, data });
  },
};

export const deadLetterRepository = {
  list(where: Prisma.NotificationDeadLetterWhereInput, skip: number, take: number) {
    return prisma.notificationDeadLetter.findMany({ where, skip, take, orderBy: { createdAt: 'desc' } });
  },
  count(where: Prisma.NotificationDeadLetterWhereInput) {
    return prisma.notificationDeadLetter.count({ where });
  },
  create(data: Prisma.NotificationDeadLetterCreateInput) {
    return prisma.notificationDeadLetter.create({ data });
  },
  resolve(id: string) {
    return prisma.notificationDeadLetter.update({ where: { id }, data: { resolvedAt: new Date() } });
  },
};

export const pushTopicRepository = {
  list(where: Prisma.PushTopicWhereInput, skip: number, take: number) {
    return prisma.pushTopic.findMany({ where, skip, take, orderBy: { code: 'asc' }, include: { _count: { select: { subscriptions: true } } } });
  },
  count(where: Prisma.PushTopicWhereInput) {
    return prisma.pushTopic.count({ where });
  },
  findByCode(code: string) {
    return prisma.pushTopic.findUnique({ where: { code } });
  },
  create(data: Prisma.PushTopicCreateInput) {
    return prisma.pushTopic.create({ data });
  },
  async subscribe(topicId: string, userId: string, deviceId?: string) {
    const existing = await prisma.pushTopicSubscription.findFirst({
      where: { topicId, userId, deviceId: deviceId ?? null },
    });
    if (existing) {
      return prisma.pushTopicSubscription.update({ where: { id: existing.id }, data: { isActive: true } });
    }
    return prisma.pushTopicSubscription.create({ data: { topicId, userId, deviceId } });
  },
  unsubscribe(topicId: string, userId: string, deviceId?: string) {
    return prisma.pushTopicSubscription.updateMany({
      where: { topicId, userId, ...(deviceId ? { deviceId } : {}) },
      data: { isActive: false },
    });
  },
  listSubscriptions(userId: string) {
    return prisma.pushTopicSubscription.findMany({
      where: { userId, isActive: true },
      include: { topic: true },
    });
  },
};

export const whatsAppTemplateRegistryRepository = {
  list(where: Prisma.WhatsAppTemplateRegistryWhereInput, skip: number, take: number) {
    return prisma.whatsAppTemplateRegistry.findMany({ where, skip, take, orderBy: { code: 'asc' } });
  },
  count(where: Prisma.WhatsAppTemplateRegistryWhereInput) {
    return prisma.whatsAppTemplateRegistry.count({ where });
  },
  findByCode(code: string) {
    return prisma.whatsAppTemplateRegistry.findUnique({ where: { code } });
  },
  findByEventType(eventType: string) {
    return prisma.whatsAppTemplateRegistry.findFirst({
      where: { eventType: eventType as never, isActive: true },
    });
  },
  create(data: Prisma.WhatsAppTemplateRegistryCreateInput) {
    return prisma.whatsAppTemplateRegistry.create({ data });
  },
  update(id: string, data: Prisma.WhatsAppTemplateRegistryUpdateInput) {
    return prisma.whatsAppTemplateRegistry.update({ where: { id }, data });
  },
};
