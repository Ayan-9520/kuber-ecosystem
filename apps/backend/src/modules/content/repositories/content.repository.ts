import type { Prisma } from '@kuberone/database';

import { prisma } from '../../../config/database.js';

export const contentRepository = {
  template: {
    findMany: (args: Prisma.ContentTemplateFindManyArgs) => prisma.contentTemplate.findMany(args),
    count: (where: Prisma.ContentTemplateWhereInput) => prisma.contentTemplate.count({ where }),
    findById: (id: string) => prisma.contentTemplate.findUnique({ where: { id } }),
    findByCode: (code: string) => prisma.contentTemplate.findUnique({ where: { code } }),
    create: (data: Prisma.ContentTemplateCreateInput) => prisma.contentTemplate.create({ data }),
    update: (id: string, data: Prisma.ContentTemplateUpdateInput) => prisma.contentTemplate.update({ where: { id }, data }),
    incrementUsage: (id: string) => prisma.contentTemplate.update({ where: { id }, data: { usageCount: { increment: 1 } } }),
  },
  request: {
    findMany: (args: Prisma.ContentGenerationRequestFindManyArgs) => prisma.contentGenerationRequest.findMany(args),
    count: (where: Prisma.ContentGenerationRequestWhereInput) => prisma.contentGenerationRequest.count({ where }),
    findById: (id: string) =>
      prisma.contentGenerationRequest.findUnique({
        where: { id },
        include: {
          results: true,
          versions: { orderBy: { version: 'desc' } },
          approvals: { orderBy: { createdAt: 'desc' }, take: 5 },
          feedback: { orderBy: { createdAt: 'desc' }, take: 10 },
          template: true,
          requestedBy: { select: { id: true, email: true } },
        },
      }),
    create: (data: Prisma.ContentGenerationRequestCreateInput) => prisma.contentGenerationRequest.create({ data }),
    update: (id: string, data: Prisma.ContentGenerationRequestUpdateInput) =>
      prisma.contentGenerationRequest.update({ where: { id }, data }),
  },
  result: {
    create: (data: Prisma.ContentGenerationResultCreateInput) => prisma.contentGenerationResult.create({ data }),
    findMany: (args: Prisma.ContentGenerationResultFindManyArgs) => prisma.contentGenerationResult.findMany(args),
  },
  version: {
    create: (data: Prisma.ContentVersionCreateInput) => prisma.contentVersion.create({ data }),
    getLatestVersion: (requestId: string) =>
      prisma.contentVersion.findFirst({ where: { requestId }, orderBy: { version: 'desc' } }),
  },
  approval: {
    create: (data: Prisma.ContentApprovalCreateInput) => prisma.contentApproval.create({ data }),
    findMany: (args: Prisma.ContentApprovalFindManyArgs) => prisma.contentApproval.findMany(args),
  },
  feedback: {
    create: (data: Prisma.ContentFeedbackCreateInput) => prisma.contentFeedback.create({ data }),
  },
  usage: {
    create: (data: Prisma.ContentUsageCreateInput) => prisma.contentUsage.create({ data }),
    count: (where: Prisma.ContentUsageWhereInput) => prisma.contentUsage.count({ where }),
  },
  analytics: {
    findMany: (args: Prisma.ContentAnalyticsFindManyArgs) => prisma.contentAnalytics.findMany(args),
    upsert: (periodStart: Date, periodEnd: Date, contentType: string | null, data: Prisma.ContentAnalyticsUpdateInput) =>
      prisma.contentAnalytics.upsert({
        where: {
          periodStart_periodEnd_contentType: {
            periodStart,
            periodEnd,
            contentType: contentType as never,
          },
        },
        create: {
          periodStart,
          periodEnd,
          contentType: contentType as never,
          totalGenerated: (data.totalGenerated as number) ?? 0,
          totalApproved: (data.totalApproved as number) ?? 0,
          totalRejected: (data.totalRejected as number) ?? 0,
          totalPublished: (data.totalPublished as number) ?? 0,
          totalTokens: (data.totalTokens as number) ?? 0,
          totalCost: (data.totalCost as number) ?? 0,
          avgGenerationMs: (data.avgGenerationMs as number) ?? 0,
          templateMetrics: data.templateMetrics as Prisma.InputJsonValue,
        },
        update: data,
      }),
  },
  audit: {
    create: (data: Prisma.ContentAuditCreateInput) => prisma.contentAudit.create({ data }),
  },
  queue: {
    enqueue: (data: Prisma.ContentQueueCreateInput) => prisma.contentQueue.create({ data }),
    findDue: (limit: number) =>
      prisma.contentQueue.findMany({
        where: { status: 'PENDING', scheduledAt: { lte: new Date() } },
        orderBy: { scheduledAt: 'asc' },
        take: limit,
        include: { request: { include: { template: true } } },
      }),
    update: (id: string, data: Prisma.ContentQueueUpdateInput) => prisma.contentQueue.update({ where: { id }, data }),
  },
};
