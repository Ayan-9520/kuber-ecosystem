import type { Prisma } from '@kuberone/database';

import { prisma } from '../../../config/database.js';

export const automationRepository = {
  workflow: {
    findMany: (args: Prisma.AutomationWorkflowFindManyArgs) => prisma.automationWorkflow.findMany(args),
    count: (where: Prisma.AutomationWorkflowWhereInput) => prisma.automationWorkflow.count({ where }),
    findById: (id: string) =>
      prisma.automationWorkflow.findFirst({
        where: { id, deletedAt: null },
        include: {
          nodes: { include: { conditions: true, actions: true }, orderBy: { sortOrder: 'asc' } },
          triggers: true,
          goals: true,
          createdBy: { select: { id: true, email: true } },
          approvedBy: { select: { id: true, email: true } },
        },
      }),
    create: (data: Prisma.AutomationWorkflowCreateInput) => prisma.automationWorkflow.create({ data }),
    update: (id: string, data: Prisma.AutomationWorkflowUpdateInput) =>
      prisma.automationWorkflow.update({ where: { id }, data }),
  },

  template: {
    findMany: (args: Prisma.AutomationTemplateFindManyArgs) => prisma.automationTemplate.findMany(args),
    count: (where: Prisma.AutomationTemplateWhereInput) => prisma.automationTemplate.count({ where }),
    findById: (id: string) => prisma.automationTemplate.findUnique({ where: { id } }),
    create: (data: Prisma.AutomationTemplateCreateInput) => prisma.automationTemplate.create({ data }),
    update: (id: string, data: Prisma.AutomationTemplateUpdateInput) =>
      prisma.automationTemplate.update({ where: { id }, data }),
    incrementUsage: (id: string) =>
      prisma.automationTemplate.update({ where: { id }, data: { usageCount: { increment: 1 } } }),
  },

  execution: {
    findMany: (args: Prisma.AutomationExecutionFindManyArgs) => prisma.automationExecution.findMany(args),
    count: (where: Prisma.AutomationExecutionWhereInput) => prisma.automationExecution.count({ where }),
    findById: (id: string) =>
      prisma.automationExecution.findUnique({
        where: { id },
        include: { workflow: { select: { id: true, name: true, journeyType: true } }, logs: { orderBy: { createdAt: 'asc' }, take: 100 } },
      }),
    create: (data: Prisma.AutomationExecutionCreateInput) => prisma.automationExecution.create({ data }),
    update: (id: string, data: Prisma.AutomationExecutionUpdateInput) =>
      prisma.automationExecution.update({ where: { id }, data }),
  },

  trigger: {
    findMany: (args: Prisma.AutomationTriggerFindManyArgs) => prisma.automationTrigger.findMany(args),
    count: (where: Prisma.AutomationTriggerWhereInput) => prisma.automationTrigger.count({ where }),
    findActiveByType: (triggerType: string) =>
      prisma.automationTrigger.findMany({
        where: { triggerType: triggerType as never, isActive: true, workflow: { status: 'ACTIVE', deletedAt: null } },
        include: { workflow: { include: { nodes: { include: { conditions: true, actions: true } }, goals: true } } },
      }),
    create: (data: Prisma.AutomationTriggerCreateInput) => prisma.automationTrigger.create({ data }),
    update: (id: string, data: Prisma.AutomationTriggerUpdateInput) =>
      prisma.automationTrigger.update({ where: { id }, data }),
    delete: (id: string) => prisma.automationTrigger.delete({ where: { id } }),
  },

  log: {
    findMany: (args: Prisma.AutomationLogFindManyArgs) => prisma.automationLog.findMany(args),
    count: (where: Prisma.AutomationLogWhereInput) => prisma.automationLog.count({ where }),
    create: (data: Prisma.AutomationLogCreateInput) => prisma.automationLog.create({ data }),
  },

  analytics: {
    findMany: (args: Prisma.AutomationAnalyticsFindManyArgs) => prisma.automationAnalytics.findMany(args),
    count: (where: Prisma.AutomationAnalyticsWhereInput) => prisma.automationAnalytics.count({ where }),
    upsert: (workflowId: string, periodStart: Date, periodEnd: Date, data: Prisma.AutomationAnalyticsUpdateInput) =>
      prisma.automationAnalytics.upsert({
        where: { workflowId_periodStart_periodEnd: { workflowId, periodStart, periodEnd } },
        create: {
          workflow: { connect: { id: workflowId } },
          periodStart,
          periodEnd,
          totalRuns: (data.totalRuns as number) ?? 0,
          successCount: (data.successCount as number) ?? 0,
          failureCount: (data.failureCount as number) ?? 0,
          conversionRate: (data.conversionRate as number) ?? 0,
          dropOffRate: (data.dropOffRate as number) ?? 0,
          revenueGenerated: (data.revenueGenerated as number) ?? 0,
          roi: (data.roi as number) ?? 0,
          channelBreakdown: data.channelBreakdown as Prisma.InputJsonValue,
          journeyMetrics: data.journeyMetrics as Prisma.InputJsonValue,
        },
        update: data,
      }),
  },

  audit: {
    create: (data: Prisma.AutomationAuditCreateInput) => prisma.automationAudit.create({ data }),
    findMany: (args: Prisma.AutomationAuditFindManyArgs) => prisma.automationAudit.findMany(args),
  },

  queue: {
    enqueue: (data: Prisma.AutomationQueueCreateInput) => prisma.automationQueue.create({ data }),
    findDue: (limit: number) =>
      prisma.automationQueue.findMany({
        where: { status: 'PENDING', scheduledAt: { lte: new Date() } },
        orderBy: { scheduledAt: 'asc' },
        take: limit,
        include: { execution: { include: { workflow: { include: { nodes: { include: { conditions: true, actions: true } } } } } } },
      }),
    update: (id: string, data: Prisma.AutomationQueueUpdateInput) => prisma.automationQueue.update({ where: { id }, data }),
  },

  deadLetter: {
    create: (data: Prisma.AutomationDeadLetterCreateInput) => prisma.automationDeadLetter.create({ data }),
  },

  deleteWorkflowNodes: (workflowId: string) => prisma.automationNode.deleteMany({ where: { workflowId } }),
};
