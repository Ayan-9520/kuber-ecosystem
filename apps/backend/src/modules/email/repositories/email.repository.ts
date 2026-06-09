import type { Prisma } from '@kuberone/database';

import { prisma } from '../../../config/database.js';

export const emailProviderRepository = {
  list(where: Prisma.EmailProviderWhereInput, skip: number, take: number) {
    return prisma.emailProvider.findMany({ where, skip, take, orderBy: { code: 'asc' } });
  },
  count(where: Prisma.EmailProviderWhereInput) {
    return prisma.emailProvider.count({ where });
  },
  findById(id: string) {
    return prisma.emailProvider.findUnique({ where: { id } });
  },
  findByCode(code: string) {
    return prisma.emailProvider.findUnique({ where: { code } });
  },
  findDefault() {
    return prisma.emailProvider.findFirst({ where: { isActive: true, isDefault: true } });
  },
  create(data: Prisma.EmailProviderCreateInput) {
    return prisma.emailProvider.create({ data });
  },
  update(id: string, data: Prisma.EmailProviderUpdateInput) {
    return prisma.emailProvider.update({ where: { id }, data });
  },
};

export const emailTemplateRepository = {
  list(where: Prisma.EmailTemplateWhereInput, skip: number, take: number, orderBy: Prisma.EmailTemplateOrderByWithRelationInput) {
    return prisma.emailTemplate.findMany({ where, skip, take, orderBy });
  },
  count(where: Prisma.EmailTemplateWhereInput) {
    return prisma.emailTemplate.count({ where });
  },
  findById(id: string) {
    return prisma.emailTemplate.findUnique({ where: { id }, include: { versions: { orderBy: { version: 'desc' }, take: 5 } } });
  },
  findByCode(code: string) {
    return prisma.emailTemplate.findFirst({ where: { code, isActive: true, deletedAt: null } });
  },
  findByEventType(eventType: string) {
    return prisma.emailTemplate.findFirst({ where: { eventType, isActive: true, deletedAt: null } });
  },
  create(data: Prisma.EmailTemplateCreateInput) {
    return prisma.emailTemplate.create({ data });
  },
  update(id: string, data: Prisma.EmailTemplateUpdateInput) {
    return prisma.emailTemplate.update({ where: { id }, data });
  },
  createVersion(data: Prisma.EmailTemplateVersionCreateInput) {
    return prisma.emailTemplateVersion.create({ data });
  },
};

export const emailQueueRepository = {
  enqueue(data: Prisma.EmailQueueCreateInput) {
    return prisma.emailQueue.create({ data });
  },
  listPending(limit: number) {
    return prisma.emailQueue.findMany({
      where: {
        status: { in: ['PENDING'] },
        OR: [{ scheduledAt: null }, { scheduledAt: { lte: new Date() } }],
      },
      orderBy: [{ priority: 'desc' }, { createdAt: 'asc' }],
      take: limit,
    });
  },
  list(where: Prisma.EmailQueueWhereInput, skip: number, take: number) {
    return prisma.emailQueue.findMany({ where, skip, take, orderBy: { createdAt: 'desc' } });
  },
  count(where: Prisma.EmailQueueWhereInput) {
    return prisma.emailQueue.count({ where });
  },
  update(id: string, data: Prisma.EmailQueueUpdateInput) {
    return prisma.emailQueue.update({ where: { id }, data });
  },
};

export const emailDeliveryRepository = {
  create(data: Prisma.EmailDeliveryCreateInput) {
    return prisma.emailDelivery.create({ data });
  },
  findByEmailLogId(emailLogId: string) {
    return prisma.emailDelivery.findUnique({ where: { emailLogId } });
  },
  findByProviderRef(providerRef: string) {
    return prisma.emailDelivery.findFirst({ where: { providerRef } });
  },
  update(id: string, data: Prisma.EmailDeliveryUpdateInput) {
    return prisma.emailDelivery.update({ where: { id }, data });
  },
  list(where: Prisma.EmailDeliveryWhereInput, skip: number, take: number, orderBy?: Prisma.EmailDeliveryOrderByWithRelationInput) {
    return prisma.emailDelivery.findMany({
      where,
      skip,
      take,
      orderBy: orderBy ?? { createdAt: 'desc' },
      include: { provider: true, events: { take: 5, orderBy: { occurredAt: 'desc' } } },
    });
  },
  count(where: Prisma.EmailDeliveryWhereInput) {
    return prisma.emailDelivery.count({ where });
  },
};

export const emailEventRepository = {
  create(data: Prisma.EmailEventCreateInput) {
    return prisma.emailEvent.create({ data });
  },
};

export const emailAttachmentRepository = {
  createMany(data: Prisma.EmailAttachmentCreateManyInput[]) {
    return prisma.emailAttachment.createMany({ data });
  },
  listByDelivery(deliveryId: string) {
    return prisma.emailAttachment.findMany({ where: { deliveryId } });
  },
};

export const emailPreferenceRepository = {
  list(where: Prisma.EmailPreferenceWhereInput, skip: number, take: number) {
    return prisma.emailPreference.findMany({ where, skip, take, orderBy: { createdAt: 'desc' } });
  },
  count(where: Prisma.EmailPreferenceWhereInput) {
    return prisma.emailPreference.count({ where });
  },
  async upsert(userId: string, category: string | null, eventType: string | null, data: { enabled: boolean; marketingOptIn?: boolean }) {
    const existing = await prisma.emailPreference.findFirst({
      where: { userId, category: category as never, eventType },
    });
    if (existing) {
      return prisma.emailPreference.update({
        where: { id: existing.id },
        data: { enabled: data.enabled, ...(data.marketingOptIn !== undefined ? { marketingOptIn: data.marketingOptIn } : {}) },
      });
    }
    return prisma.emailPreference.create({
      data: { userId, category: category as never, eventType, enabled: data.enabled, marketingOptIn: data.marketingOptIn ?? false },
    });
  },
  findForUser(userId: string, category?: string, eventType?: string) {
    return prisma.emailPreference.findFirst({
      where: { userId, ...(category ? { category: category as never } : {}), ...(eventType ? { eventType } : {}) },
    });
  },
};

export const emailAnalyticsRepository = {
  async upsertDaily(params: {
    date: Date;
    templateId?: string;
    category?: string;
    campaignId?: string;
    field: 'sentCount' | 'deliveredCount' | 'openedCount' | 'clickedCount' | 'bouncedCount' | 'failedCount' | 'unsubscribedCount';
  }) {
    const day = new Date(params.date);
    day.setUTCHours(0, 0, 0, 0);
    const existing = await prisma.emailAnalytics.findFirst({
      where: {
        date: day,
        templateId: params.templateId ?? null,
        category: (params.category as never) ?? null,
        campaignId: params.campaignId ?? null,
      },
    });
    if (existing) {
      return prisma.emailAnalytics.update({
        where: { id: existing.id },
        data: { [params.field]: { increment: 1 } },
      });
    }
    return prisma.emailAnalytics.create({
      data: {
        date: day,
        templateId: params.templateId,
        category: params.category as never,
        campaignId: params.campaignId,
        [params.field]: 1,
      },
    });
  },
  aggregate(from?: Date, to?: Date) {
    return prisma.emailAnalytics.groupBy({
      by: ['category'],
      where: {
        ...(from || to ? { date: { ...(from ? { gte: from } : {}), ...(to ? { lte: to } : {}) } } : {}),
      },
      _sum: {
        sentCount: true,
        deliveredCount: true,
        openedCount: true,
        clickedCount: true,
        bouncedCount: true,
        failedCount: true,
        unsubscribedCount: true,
      },
    });
  },
  templatePerformance(from?: Date, to?: Date, limit = 10) {
    return prisma.emailAnalytics.groupBy({
      by: ['templateId'],
      where: { templateId: { not: null }, ...(from || to ? { date: { ...(from ? { gte: from } : {}), ...(to ? { lte: to } : {}) } } : {}) },
      _sum: { sentCount: true, openedCount: true, clickedCount: true, failedCount: true },
      orderBy: { _sum: { sentCount: 'desc' } },
      take: limit,
    });
  },
};
