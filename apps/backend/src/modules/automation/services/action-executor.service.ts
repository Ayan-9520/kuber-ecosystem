import type { Prisma } from '@kuberone/database';

import { prisma } from '../../../config/database.js';
import { contentGenerationService } from '../../content/services/content-generation.service.js';
import { leadAssignmentService } from '../../leads/services/lead-assignment.service.js';
import { leadFollowUpService } from '../../leads/services/lead-followup.service.js';
import { leadScoreService } from '../../leads/services/lead-score.service.js';
import { notificationDispatchService } from '../../notifications/services/notification-dispatch.service.js';
import { recommendationOrchestratorService } from '../../recommendations/recommendations.module.js';
import { ticketService } from '../../support/services/ticket.service.js';
import { AUTOMATION_EVENT_PREFIX, CHANNEL_MAP } from '../constants/automation.constants.js';

type ActionRow = {
  actionType: string;
  channel?: string | null;
  templateCode?: string | null;
  config?: Prisma.JsonValue;
  delayBefore?: number | null;
};

type ExecutionContext = {
  executionId: string;
  workflowId: string;
  subjectType: string;
  subjectId: string;
  userId?: string | null;
  context: Record<string, unknown>;
};

async function resolveUserId(ctx: ExecutionContext): Promise<string | null> {
  if (ctx.userId) return ctx.userId;

  if (ctx.subjectType === 'lead') {
    const lead = await prisma.lead.findUnique({ where: { id: ctx.subjectId }, select: { customer: { select: { userId: true } } } });
    return lead?.customer?.userId ?? null;
  }
  if (ctx.subjectType === 'application') {
    const app = await prisma.application.findUnique({
      where: { id: ctx.subjectId },
      select: { customer: { select: { userId: true } } },
    });
    return app?.customer?.userId ?? null;
  }
  if (ctx.subjectType === 'customer') {
    const customer = await prisma.customer.findUnique({ where: { id: ctx.subjectId }, select: { userId: true } });
    return customer?.userId ?? null;
  }
  if (ctx.subjectType === 'ticket') {
    const ticket = await prisma.ticket.findUnique({ where: { id: ctx.subjectId }, select: { createdById: true } });
    return ticket?.createdById ?? null;
  }
  return null;
}

export const actionExecutorService = {
  async execute(action: ActionRow, ctx: ExecutionContext): Promise<Record<string, unknown>> {
    const config = (action.config ?? {}) as Record<string, unknown>;
    const eventType = `${AUTOMATION_EVENT_PREFIX}${action.actionType}`;
    const userId = await resolveUserId(ctx);

    switch (action.actionType) {
      case 'SEND_EMAIL':
      case 'SEND_SMS':
      case 'SEND_WHATSAPP':
      case 'SEND_PUSH': {
        if (!userId) throw new Error('Recipient user not found for channel action');
        const channel = action.channel ?? CHANNEL_MAP[action.actionType] ?? 'EMAIL';
        await notificationDispatchService.dispatchToChannel({
          userId,
          channel,
          eventType,
          templateCode: action.templateCode ?? (config.templateCode as string),
          title: config.title as string,
          body: config.body as string,
          variables: { ...ctx.context, ...(config.variables as Record<string, unknown>) },
          entityType: 'automation_execution',
          entityId: ctx.executionId,
        });
        return { channel, sent: true };
      }

      case 'CREATE_CRM_TASK':
      case 'CREATE_FOLLOW_UP': {
        const leadId = ctx.subjectType === 'lead' ? ctx.subjectId : (config.leadId as string);
        if (!leadId) throw new Error('Lead ID required for follow-up');
        const lead = await prisma.lead.findUnique({ where: { id: leadId }, select: { assignedToId: true } });
        const assignedToId = (config.assignedToId as string) ?? lead?.assignedToId;
        if (!assignedToId) throw new Error('assignedToId required for follow-up');
        const followUp = await leadFollowUpService.create(
          {
            leadId,
            assignedToId,
            followUpType: (config.followUpType as 'CALL' | 'EMAIL' | 'MEETING' | 'WHATSAPP' | 'SMS' | 'DOCUMENT_REQUEST') ?? 'CALL',
            scheduledAt: config.scheduledAt ? new Date(config.scheduledAt as string) : new Date(),
            notes: (config.notes as string) ?? 'Automation follow-up',
          },
          { actorId: userId ?? 'system', ipAddress: undefined, userAgent: undefined, requestId: ctx.executionId },
        );
        return { followUpId: followUp.id };
      }

      case 'ASSIGN_LEAD':
      case 'REASSIGN_LEAD': {
        const leadId = ctx.subjectType === 'lead' ? ctx.subjectId : (config.leadId as string);
        if (!leadId) throw new Error('Lead ID required for assignment');
        const assignedToId = (config.assignedToId as string) ?? (config.toEmployeeId as string);
        if (!assignedToId) throw new Error('assignedToId required for lead assignment');
        const result =
          action.actionType === 'REASSIGN_LEAD'
            ? await leadAssignmentService.reassign(
                leadId,
                { assignedToId, assignmentType: 'MANUAL', notes: (config.reason as string) ?? 'Automation reassignment' },
                { actorId: userId ?? 'system', ipAddress: undefined, userAgent: undefined, requestId: ctx.executionId },
              )
            : await leadAssignmentService.assign(
                leadId,
                { assignedToId, assignmentType: (config.assignmentType as 'MANUAL' | 'AUTO' | 'LOAD_BALANCE') ?? 'MANUAL' },
                { actorId: userId ?? 'system', ipAddress: undefined, userAgent: undefined, requestId: ctx.executionId },
              );
        return { assignment: result };
      }

      case 'UPDATE_LEAD_SCORE': {
        const leadId = ctx.subjectType === 'lead' ? ctx.subjectId : (config.leadId as string);
        if (!leadId) throw new Error('Lead ID required for scoring');
        const score = await leadScoreService.scoreLead(
          { leadId, scoringProfile: (config.scoringProfile as Record<string, unknown>) ?? {} },
          { actorId: userId ?? 'system', ipAddress: undefined, userAgent: undefined, requestId: ctx.executionId },
        );
        return { score };
      }

      case 'UPDATE_STATUS': {
        if (ctx.subjectType === 'lead') {
          await prisma.lead.update({
            where: { id: ctx.subjectId },
            data: { status: ((config.status as string) ?? 'CONTACTED') as never, updatedById: userId ?? undefined },
          });
        } else if (ctx.subjectType === 'application') {
          await prisma.application.update({
            where: { id: ctx.subjectId },
            data: { status: (config.status as string) as never, updatedById: userId ?? undefined },
          });
        }
        return { statusUpdated: true };
      }

      case 'CREATE_TICKET': {
        let categoryId = config.categoryId as string | undefined;
        if (!categoryId) {
          const defaultCategory = await prisma.ticketCategory.findFirst({ where: { isActive: true } });
          categoryId = defaultCategory?.id;
        }
        if (!categoryId) throw new Error('Ticket category required');
        const ticket = await ticketService.create(
          {
            subject: (config.subject as string) ?? 'Automation ticket',
            description: (config.description as string) ?? 'Created by marketing automation',
            categoryId,
            priority: (config.priority as 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL') ?? 'MEDIUM',
            customerId: config.customerId as string | undefined,
            leadId: ctx.subjectType === 'lead' ? ctx.subjectId : undefined,
            applicationId: ctx.subjectType === 'application' ? ctx.subjectId : undefined,
          },
          { actorId: userId ?? 'system', ipAddress: undefined, userAgent: undefined, requestId: ctx.executionId },
        );
        return { ticketId: ticket?.id };
      }

      case 'ESCALATE_TICKET': {
        const ticketId = ctx.subjectType === 'ticket' ? ctx.subjectId : (config.ticketId as string);
        if (!ticketId) throw new Error('Ticket ID required for escalation');
        const ticket = await prisma.ticket.findUnique({ where: { id: ticketId }, select: { escalationLevel: true } });
        await prisma.ticketEscalation.create({
          data: {
            ticketId,
            fromLevel: (ticket?.escalationLevel as never) ?? 'L1_SUPPORT',
            toLevel: (config.toLevel as never) ?? 'L2_SUPPORT',
            reason: (config.reason as string) ?? 'Automation escalation',
            escalatedById: userId ?? ctx.executionId,
          },
        });
        return { escalated: true };
      }

      case 'TRIGGER_AI_RECOMMENDATION': {
        if (!userId) return { skipped: true, reason: 'No user for recommendations' };
        const actorUser = await prisma.user.findUnique({ where: { id: userId } });
        if (!actorUser) return { skipped: true, reason: 'User not found' };
        const actor = { id: actorUser.id, email: actorUser.email, roles: [], permissions: [], userType: actorUser.userType } as never;
        const reqCtx = { actorId: userId, ipAddress: undefined, userAgent: undefined, requestId: ctx.executionId };
        const rec =
          ctx.subjectType === 'lead'
            ? await recommendationOrchestratorService.forLead(actor, ctx.subjectId, reqCtx)
            : ctx.subjectType === 'application'
              ? await recommendationOrchestratorService.forApplication(actor, ctx.subjectId, reqCtx)
              : ctx.subjectType === 'customer'
                ? await recommendationOrchestratorService.forCustomer(actor, ctx.subjectId, reqCtx)
                : null;
        return { recommendations: rec };
      }

      case 'GENERATE_AI_CONTENT': {
        if (!userId) return { skipped: true, reason: 'No user for AI content' };
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) return { skipped: true };
        const actor = { id: user.id, email: user.email, roles: [], permissions: [], userType: user.userType } as never;
        const contentType = (config.contentType as string) ?? 'EMAIL';
        const request = await contentGenerationService.generate(
          actor,
          {
            contentType: contentType as never,
            mode: 'GENERATE',
            tone: (config.tone as never) ?? 'PREMIUM_FINTECH',
            language: (config.language as never) ?? 'EN',
            prompt: (config.prompt as string) ?? 'Generate marketing content for this customer journey step.',
            personalization: {
              leadId: ctx.subjectType === 'lead' ? ctx.subjectId : undefined,
              applicationId: ctx.subjectType === 'application' ? ctx.subjectId : undefined,
              customerId: ctx.subjectType === 'customer' ? ctx.subjectId : undefined,
            },
            ragEnabled: config.ragEnabled !== false,
            variantCount: 1,
            async: false,
          },
          { actorId: user.id, ipAddress: undefined, userAgent: undefined },
        );
        const primary = request && 'results' in request ? request.results?.[0] : undefined;
        return { content: primary?.body ?? '', requestId: request && 'id' in request ? request.id : undefined };
      }

      default:
        throw new Error(`Unsupported action type: ${action.actionType}`);
    }
  },
};
