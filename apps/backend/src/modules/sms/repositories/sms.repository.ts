import type { Prisma } from '@kuberone/database';

import { prisma } from '../../../config/database.js';

export const smsProviderRepository = {
  list(where: Prisma.SmsProviderWhereInput, skip: number, take: number) {
    return prisma.smsProvider.findMany({ where, skip, take, orderBy: { code: 'asc' } });
  },
  count(where: Prisma.SmsProviderWhereInput) {
    return prisma.smsProvider.count({ where });
  },
  findById(id: string) {
    return prisma.smsProvider.findUnique({ where: { id } });
  },
  findByCode(code: string) {
    return prisma.smsProvider.findUnique({ where: { code } });
  },
  findDefault() {
    return prisma.smsProvider.findFirst({ where: { isActive: true, isDefault: true } });
  },
  create(data: Prisma.SmsProviderCreateInput) {
    return prisma.smsProvider.create({ data });
  },
  update(id: string, data: Prisma.SmsProviderUpdateInput) {
    return prisma.smsProvider.update({ where: { id }, data });
  },
};

export const smsTemplateRepository = {
  list(where: Prisma.SmsTemplateWhereInput, skip: number, take: number, orderBy: Prisma.SmsTemplateOrderByWithRelationInput) {
    return prisma.smsTemplate.findMany({ where, skip, take, orderBy });
  },
  count(where: Prisma.SmsTemplateWhereInput) {
    return prisma.smsTemplate.count({ where });
  },
  findById(id: string) {
    return prisma.smsTemplate.findUnique({ where: { id }, include: { versions: { orderBy: { version: 'desc' }, take: 5 } } });
  },
  findByCode(code: string) {
    return prisma.smsTemplate.findFirst({ where: { code, isActive: true, deletedAt: null } });
  },
  findByEventType(eventType: string) {
    return prisma.smsTemplate.findFirst({ where: { eventType, isActive: true, deletedAt: null } });
  },
  create(data: Prisma.SmsTemplateCreateInput) {
    return prisma.smsTemplate.create({ data });
  },
  update(id: string, data: Prisma.SmsTemplateUpdateInput) {
    return prisma.smsTemplate.update({ where: { id }, data });
  },
  createVersion(data: Prisma.SmsTemplateVersionCreateInput) {
    return prisma.smsTemplateVersion.create({ data });
  },
};

export const smsQueueRepository = {
  enqueue(data: Prisma.SmsQueueCreateInput) {
    return prisma.smsQueue.create({ data });
  },
  listPending(limit: number) {
    return prisma.smsQueue.findMany({
      where: {
        status: { in: ['PENDING'] },
        OR: [{ scheduledAt: null }, { scheduledAt: { lte: new Date() } }],
      },
      orderBy: [{ priority: 'desc' }, { createdAt: 'asc' }],
      take: limit,
    });
  },
  list(where: Prisma.SmsQueueWhereInput, skip: number, take: number) {
    return prisma.smsQueue.findMany({ where, skip, take, orderBy: { createdAt: 'desc' } });
  },
  count(where: Prisma.SmsQueueWhereInput) {
    return prisma.smsQueue.count({ where });
  },
  update(id: string, data: Prisma.SmsQueueUpdateInput) {
    return prisma.smsQueue.update({ where: { id }, data });
  },
};

export const smsDeliveryRepository = {
  create(data: Prisma.SmsDeliveryCreateInput) {
    return prisma.smsDelivery.create({ data });
  },
  findBySmsLogId(smsLogId: string) {
    return prisma.smsDelivery.findUnique({ where: { smsLogId } });
  },
  findByProviderRef(providerRef: string) {
    return prisma.smsDelivery.findFirst({ where: { providerRef } });
  },
  update(id: string, data: Prisma.SmsDeliveryUpdateInput) {
    return prisma.smsDelivery.update({ where: { id }, data });
  },
  list(where: Prisma.SmsDeliveryWhereInput, skip: number, take: number, orderBy?: Prisma.SmsDeliveryOrderByWithRelationInput) {
    return prisma.smsDelivery.findMany({
      where,
      skip,
      take,
      orderBy: orderBy ?? { createdAt: 'desc' },
      include: { provider: true, events: { take: 5, orderBy: { occurredAt: 'desc' } } },
    });
  },
  count(where: Prisma.SmsDeliveryWhereInput) {
    return prisma.smsDelivery.count({ where });
  },
};

export const smsEventRepository = {
  create(data: Prisma.SmsEventCreateInput) {
    return prisma.smsEvent.create({ data });
  },
};

export const smsPreferenceRepository = {
  list(where: Prisma.SmsPreferenceWhereInput, skip: number, take: number) {
    return prisma.smsPreference.findMany({ where, skip, take, orderBy: { createdAt: 'desc' } });
  },
  count(where: Prisma.SmsPreferenceWhereInput) {
    return prisma.smsPreference.count({ where });
  },
  async upsert(userId: string, category: string | null, eventType: string | null, data: { enabled: boolean; marketingOptIn?: boolean }) {
    const existing = await prisma.smsPreference.findFirst({
      where: { userId, category: category as never, eventType },
    });
    if (existing) {
      return prisma.smsPreference.update({
        where: { id: existing.id },
        data: { enabled: data.enabled, ...(data.marketingOptIn !== undefined ? { marketingOptIn: data.marketingOptIn } : {}) },
      });
    }
    return prisma.smsPreference.create({
      data: { userId, category: category as never, eventType, enabled: data.enabled, marketingOptIn: data.marketingOptIn ?? false },
    });
  },
  findForUser(userId: string, category?: string, eventType?: string) {
    return prisma.smsPreference.findFirst({
      where: { userId, ...(category ? { category: category as never } : {}), ...(eventType ? { eventType } : {}) },
    });
  },
};

export const smsAnalyticsRepository = {
  async upsertDaily(params: {
    date: Date;
    templateId?: string;
    category?: string;
    providerId?: string;
    field: 'sentCount' | 'deliveredCount' | 'failedCount' | 'rejectedCount' | 'otpSentCount' | 'otpVerifiedCount' | 'otpFailedCount';
  }) {
    const day = new Date(params.date);
    day.setUTCHours(0, 0, 0, 0);
    const existing = await prisma.smsAnalytics.findFirst({
      where: {
        date: day,
        templateId: params.templateId ?? null,
        category: (params.category as never) ?? null,
        providerId: params.providerId ?? null,
      },
    });
    if (existing) {
      return prisma.smsAnalytics.update({
        where: { id: existing.id },
        data: { [params.field]: { increment: 1 } },
      });
    }
    return prisma.smsAnalytics.create({
      data: {
        date: day,
        templateId: params.templateId,
        category: params.category as never,
        providerId: params.providerId,
        [params.field]: 1,
      },
    });
  },
  aggregate(from?: Date, to?: Date) {
    return prisma.smsAnalytics.groupBy({
      by: ['category'],
      where: { ...(from || to ? { date: { ...(from ? { gte: from } : {}), ...(to ? { lte: to } : {}) } } : {}) },
      _sum: {
        sentCount: true,
        deliveredCount: true,
        failedCount: true,
        rejectedCount: true,
        otpSentCount: true,
        otpVerifiedCount: true,
        otpFailedCount: true,
      },
    });
  },
  providerPerformance(from?: Date, to?: Date) {
    return prisma.smsAnalytics.groupBy({
      by: ['providerId'],
      where: { providerId: { not: null }, ...(from || to ? { date: { ...(from ? { gte: from } : {}), ...(to ? { lte: to } : {}) } } : {}) },
      _sum: { sentCount: true, deliveredCount: true, failedCount: true },
    });
  },
  templatePerformance(from?: Date, to?: Date, limit = 10) {
    return prisma.smsAnalytics.groupBy({
      by: ['templateId'],
      where: { templateId: { not: null }, ...(from || to ? { date: { ...(from ? { gte: from } : {}), ...(to ? { lte: to } : {}) } } : {}) },
      _sum: { sentCount: true, deliveredCount: true, failedCount: true },
      orderBy: { _sum: { sentCount: 'desc' } },
      take: limit,
    });
  },
};
