import type { Prisma } from '@kuberone/database';

import { prisma } from '../../../config/database.js';

export const pushProviderRepository = {
  list(where: Prisma.PushProviderWhereInput, skip: number, take: number) {
    return prisma.pushProvider.findMany({ where, skip, take, orderBy: { code: 'asc' } });
  },
  count(where: Prisma.PushProviderWhereInput) {
    return prisma.pushProvider.count({ where });
  },
  findById(id: string) {
    return prisma.pushProvider.findUnique({ where: { id } });
  },
  findDefault() {
    return prisma.pushProvider.findFirst({ where: { isActive: true, isDefault: true } });
  },
  create(data: Prisma.PushProviderCreateInput) {
    return prisma.pushProvider.create({ data });
  },
  update(id: string, data: Prisma.PushProviderUpdateInput) {
    return prisma.pushProvider.update({ where: { id }, data });
  },
};

export const pushTemplateRepository = {
  list(where: Prisma.PushTemplateWhereInput, skip: number, take: number, orderBy: Prisma.PushTemplateOrderByWithRelationInput) {
    return prisma.pushTemplate.findMany({ where, skip, take, orderBy });
  },
  count(where: Prisma.PushTemplateWhereInput) {
    return prisma.pushTemplate.count({ where });
  },
  findById(id: string) {
    return prisma.pushTemplate.findUnique({ where: { id }, include: { versions: { orderBy: { version: 'desc' }, take: 5 } } });
  },
  findByCode(code: string) {
    return prisma.pushTemplate.findFirst({ where: { code, isActive: true, deletedAt: null } });
  },
  findByEventType(eventType: string) {
    return prisma.pushTemplate.findFirst({ where: { eventType, isActive: true, deletedAt: null } });
  },
  create(data: Prisma.PushTemplateCreateInput) {
    return prisma.pushTemplate.create({ data });
  },
  update(id: string, data: Prisma.PushTemplateUpdateInput) {
    return prisma.pushTemplate.update({ where: { id }, data });
  },
  createVersion(data: Prisma.PushTemplateVersionCreateInput) {
    return prisma.pushTemplateVersion.create({ data });
  },
};

export const pushDeviceRepository = {
  findByUserDevice(userId: string, deviceId: string, appTarget: string) {
    return prisma.pushDevice.findUnique({
      where: { userId_deviceId_appTarget: { userId, deviceId, appTarget: appTarget as never } },
      include: { tokens: { where: { isActive: true }, orderBy: { createdAt: 'desc' }, take: 1 } },
    });
  },
  listActiveForUser(userId: string, appTarget?: string) {
    return prisma.pushDevice.findMany({
      where: { userId, isActive: true, ...(appTarget ? { appTarget: appTarget as never } : {}) },
      include: { tokens: { where: { isActive: true } } },
    });
  },
  upsert(data: Prisma.PushDeviceCreateInput) {
    const userId = typeof data.user === 'object' && data.user && 'connect' in data.user ? data.user.connect?.id : undefined;
    if (!userId || !data.deviceId || !data.appTarget) throw new Error('Invalid push device upsert');
    return prisma.pushDevice.upsert({
      where: { userId_deviceId_appTarget: { userId, deviceId: data.deviceId, appTarget: data.appTarget as never } },
      update: {
        platform: data.platform,
        appVersion: data.appVersion,
        isActive: true,
        lastActiveAt: new Date(),
      },
      create: data,
    });
  },
  deactivate(userId: string, deviceId: string, appTarget?: string) {
    return prisma.pushDevice.updateMany({
      where: { userId, deviceId, ...(appTarget ? { appTarget: appTarget as never } : {}) },
      data: { isActive: false },
    });
  },
};

export const pushTokenRepository = {
  deactivateForDevice(pushDeviceId: string) {
    return prisma.pushToken.updateMany({ where: { pushDeviceId }, data: { isActive: false, rotatedAt: new Date() } });
  },
  create(data: Prisma.PushTokenCreateInput) {
    return prisma.pushToken.create({ data });
  },
  findActiveByToken(token: string) {
    return prisma.pushToken.findFirst({ where: { token, isActive: true }, include: { pushDevice: true } });
  },
};

export const pushQueueRepository = {
  enqueue(data: Prisma.PushQueueCreateInput) {
    return prisma.pushQueue.create({ data });
  },
  listPending(limit: number) {
    return prisma.pushQueue.findMany({
      where: { status: { in: ['PENDING'] }, OR: [{ scheduledAt: null }, { scheduledAt: { lte: new Date() } }] },
      orderBy: [{ priority: 'desc' }, { createdAt: 'asc' }],
      take: limit,
    });
  },
  list(where: Prisma.PushQueueWhereInput, skip: number, take: number) {
    return prisma.pushQueue.findMany({ where, skip, take, orderBy: { createdAt: 'desc' } });
  },
  count(where: Prisma.PushQueueWhereInput) {
    return prisma.pushQueue.count({ where });
  },
  update(id: string, data: Prisma.PushQueueUpdateInput) {
    return prisma.pushQueue.update({ where: { id }, data });
  },
};

export const pushDeliveryRepository = {
  create(data: Prisma.PushNotificationDeliveryCreateInput) {
    return prisma.pushNotificationDelivery.create({ data });
  },
  findById(id: string) {
    return prisma.pushNotificationDelivery.findUnique({ where: { id }, include: { events: true, logs: true, provider: true } });
  },
  findByPushNotificationId(pushNotificationId: string) {
    return prisma.pushNotificationDelivery.findUnique({ where: { pushNotificationId } });
  },
  findByProviderRef(providerRef: string) {
    return prisma.pushNotificationDelivery.findFirst({ where: { providerRef } });
  },
  update(id: string, data: Prisma.PushNotificationDeliveryUpdateInput) {
    return prisma.pushNotificationDelivery.update({ where: { id }, data });
  },
  list(where: Prisma.PushNotificationDeliveryWhereInput, skip: number, take: number, orderBy?: Prisma.PushNotificationDeliveryOrderByWithRelationInput) {
    return prisma.pushNotificationDelivery.findMany({
      where,
      skip,
      take,
      orderBy: orderBy ?? { createdAt: 'desc' },
      include: { provider: true, events: { take: 5, orderBy: { occurredAt: 'desc' } } },
    });
  },
  count(where: Prisma.PushNotificationDeliveryWhereInput) {
    return prisma.pushNotificationDelivery.count({ where });
  },
};

export const pushEventRepository = {
  create(data: Prisma.PushEventCreateInput) {
    return prisma.pushEvent.create({ data });
  },
};

export const pushNotificationLogRepository = {
  create(data: Prisma.PushNotificationLogCreateInput) {
    return prisma.pushNotificationLog.create({ data });
  },
};

export const pushPreferenceRepository = {
  list(where: Prisma.PushPreferenceWhereInput, skip: number, take: number) {
    return prisma.pushPreference.findMany({ where, skip, take, orderBy: { createdAt: 'desc' } });
  },
  count(where: Prisma.PushPreferenceWhereInput) {
    return prisma.pushPreference.count({ where });
  },
  async upsert(
    userId: string,
    pushDeviceId: string | null,
    category: string | null,
    eventType: string | null,
    data: { enabled: boolean; marketingOptIn?: boolean; doNotDisturb?: boolean; muteUntil?: Date },
  ) {
    const existing = await prisma.pushPreference.findFirst({
      where: { userId, pushDeviceId, category: category as never, eventType },
    });
    if (existing) {
      return prisma.pushPreference.update({
        where: { id: existing.id },
        data: {
          enabled: data.enabled,
          ...(data.marketingOptIn !== undefined ? { marketingOptIn: data.marketingOptIn } : {}),
          ...(data.doNotDisturb !== undefined ? { doNotDisturb: data.doNotDisturb } : {}),
          ...(data.muteUntil !== undefined ? { muteUntil: data.muteUntil } : {}),
        },
      });
    }
    return prisma.pushPreference.create({
      data: {
        userId,
        pushDeviceId,
        category: category as never,
        eventType,
        enabled: data.enabled,
        marketingOptIn: data.marketingOptIn ?? false,
        doNotDisturb: data.doNotDisturb ?? false,
        muteUntil: data.muteUntil,
      },
    });
  },
  async findForUser(userId: string, category?: string, eventType?: string, pushDeviceId?: string) {
    const base = {
      userId,
      ...(category ? { category: category as never } : { category: null }),
      ...(eventType ? { eventType } : { eventType: null }),
    };

    if (pushDeviceId) {
      const devicePref = await prisma.pushPreference.findFirst({
        where: { ...base, pushDeviceId },
      });
      if (devicePref) return devicePref;
    }

    return prisma.pushPreference.findFirst({
      where: { ...base, pushDeviceId: null },
    });
  },
};

export const pushAnalyticsRepository = {
  async upsertDaily(params: {
    date: Date;
    templateId?: string;
    category?: string;
    providerId?: string;
    topicCode?: string;
    field: 'sentCount' | 'deliveredCount' | 'openedCount' | 'clickedCount' | 'failedCount' | 'dismissedCount';
  }) {
    const day = new Date(params.date);
    day.setUTCHours(0, 0, 0, 0);
    const existing = await prisma.pushAnalytics.findFirst({
      where: {
        date: day,
        templateId: params.templateId ?? null,
        category: (params.category as never) ?? null,
        providerId: params.providerId ?? null,
        topicCode: params.topicCode ?? null,
      },
    });
    if (existing) {
      return prisma.pushAnalytics.update({
        where: { id: existing.id },
        data: { [params.field]: { increment: 1 } },
      });
    }
    return prisma.pushAnalytics.create({
      data: {
        date: day,
        templateId: params.templateId,
        category: params.category as never,
        providerId: params.providerId,
        topicCode: params.topicCode,
        [params.field]: 1,
      },
    });
  },
  aggregate(from?: Date, to?: Date) {
    return prisma.pushAnalytics.groupBy({
      by: ['category'],
      where: { ...(from || to ? { date: { ...(from ? { gte: from } : {}), ...(to ? { lte: to } : {}) } } : {}) },
      _sum: { sentCount: true, deliveredCount: true, openedCount: true, clickedCount: true, failedCount: true, dismissedCount: true },
    });
  },
  providerPerformance(from?: Date, to?: Date) {
    return prisma.pushAnalytics.groupBy({
      by: ['providerId'],
      where: { providerId: { not: null }, ...(from || to ? { date: { ...(from ? { gte: from } : {}), ...(to ? { lte: to } : {}) } } : {}) },
      _sum: { sentCount: true, deliveredCount: true, failedCount: true, openedCount: true },
    });
  },
  templatePerformance(from?: Date, to?: Date, limit = 10) {
    return prisma.pushAnalytics.groupBy({
      by: ['templateId'],
      where: { templateId: { not: null }, ...(from || to ? { date: { ...(from ? { gte: from } : {}), ...(to ? { lte: to } : {}) } } : {}) },
      _sum: { sentCount: true, deliveredCount: true, failedCount: true, openedCount: true },
      orderBy: { _sum: { sentCount: 'desc' } },
      take: limit,
    });
  },
  topicPerformance(from?: Date, to?: Date, limit = 10) {
    return prisma.pushAnalytics.groupBy({
      by: ['topicCode'],
      where: { topicCode: { not: null }, ...(from || to ? { date: { ...(from ? { gte: from } : {}), ...(to ? { lte: to } : {}) } } : {}) },
      _sum: { sentCount: true, deliveredCount: true, failedCount: true },
      orderBy: { _sum: { sentCount: 'desc' } },
      take: limit,
    });
  },
};

export const pushTopicRepository = {
  list(where: Prisma.PushTopicWhereInput, skip: number, take: number) {
    return prisma.pushTopic.findMany({ where, skip, take, orderBy: { code: 'asc' } });
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
