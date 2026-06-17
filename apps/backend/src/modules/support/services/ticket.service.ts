import type { Prisma } from '@kuberone/database';
import type { AuthenticatedUser } from '@kuberone/shared-types';
import type {
  AssignTicketInput,
  CloseTicketInput,
  CreateTicketInput,
  EscalateTicketInput,
  ListTicketsQuery,
  RejectTicketInput,
  ResolveTicketInput,
  TicketTimelineQuery,
  UpdateTicketInput,
} from '@kuberone/shared-validation';

import { AppError, NotFoundError } from '../../../shared/errors/app-error.js';
import { emitAutomationEvent } from '../../../shared/utils/automation-emitter.util.js';
import { applyTicketScope } from '../../../shared/utils/data-scope.js';
import { authAuditRepository } from '../../auth/repositories/audit.repository.js';
import { customerRepository } from '../../customers/repositories/customer.repository.js';
import { notificationDispatchService } from '../../notifications/services/notification-dispatch.service.js';
import {
  ESCALATION_ORDER,
  STATUS_TRANSITIONS,
  TERMINAL_TICKET_STATUSES,
} from '../constants/support.constants.js';
import {
  ticketAssignmentRepository,
  ticketEscalationRepository,
  ticketMessageRepository,
  ticketRepository,
  ticketResolutionRepository,
} from '../repositories/ticket.repository.js';
import type { RequestContext, TicketTimelineEvent } from '../types/support.types.js';
import {
  auditTicketMutation,
  buildPaginationMeta,
  generateTicketNumber,
} from '../utils/support.utils.js';

import { ticketCategoryService } from './ticket-category.service.js';
import { ticketSlaService } from './ticket-sla.service.js';

function buildListWhere(query: ListTicketsQuery): Prisma.TicketWhereInput {
  return {
    ...(query.includeDeleted ? {} : { deletedAt: null }),
    ...(query.status ? { status: query.status as never } : {}),
    ...(query.priority ? { priority: query.priority as never } : {}),
    ...(query.categoryId ? { categoryId: query.categoryId } : {}),
    ...(query.customerId ? { customerId: query.customerId } : {}),
    ...(query.partnerId ? { partnerId: query.partnerId } : {}),
    ...(query.applicationId ? { applicationId: query.applicationId } : {}),
    ...(query.leadId ? { leadId: query.leadId } : {}),
    ...(query.branchId ? { branchId: query.branchId } : {}),
    ...(query.regionId ? { regionId: query.regionId } : {}),
    ...(query.assignedUserId ? { assignedUserId: query.assignedUserId } : {}),
    ...(query.assignedToId ? { assignedToId: query.assignedToId } : {}),
    ...(query.escalationLevel ? { escalationLevel: query.escalationLevel as never } : {}),
    ...(query.slaBreached !== undefined ? { slaBreached: query.slaBreached } : {}),
    ...(query.search
      ? {
          OR: [
            { ticketNumber: { contains: query.search } },
            { subject: { contains: query.search } },
            { description: { contains: query.search } },
          ],
        }
      : {}),
    ...(query.fromDate || query.toDate
      ? {
          createdAt: {
            ...(query.fromDate ? { gte: query.fromDate } : {}),
            ...(query.toDate ? { lte: query.toDate } : {}),
          },
        }
      : {}),
  };
}

async function notifyTicketEvent(
  ticket: { id: string; ticketNumber: string; customerId: string | null },
  eventType: string,
  variables: Record<string, unknown>,
) {
  if (!ticket.customerId) return;
  const customer = await customerRepository.findById(ticket.customerId);
  if (!customer?.userId) return;
  try {
    await notificationDispatchService.dispatchMultiChannel({
      userId: customer.userId,
      eventType,
      channels: ['IN_APP', 'EMAIL'],
      variables: { ticketNumber: ticket.ticketNumber, ...variables },
      entityType: 'ticket',
      entityId: ticket.id,
    });
  } catch {
    // non-blocking
  }
}

export const ticketService = {
  async list(actor: AuthenticatedUser, query: ListTicketsQuery) {
    const baseWhere = buildListWhere(query);
    const where = applyTicketScope(actor, baseWhere);

    const skip = (query.page - 1) * query.limit;
    const orderBy = { [query.sortBy]: query.sortOrder };

    const [items, total] = await Promise.all([
      ticketRepository.list(where, skip, query.limit, orderBy),
      ticketRepository.count(where),
    ]);

    return { items, meta: buildPaginationMeta(query.page, query.limit, total) };
  },

  async getById(id: string) {
    const ticket = await ticketRepository.findById(id);
    if (!ticket) throw new NotFoundError('Ticket', id);
    return ticket;
  },

  async create(input: CreateTicketInput, ctx: RequestContext) {
    await ticketCategoryService.getById(input.categoryId);

    const last = await ticketRepository.getLastTicketNumber();
    const ticketNumber = generateTicketNumber(last?.ticketNumber);
    const sla = ticketSlaService.calculateSlaDates(input.priority as never);

    const ticket = await ticketRepository.create({
      ticketNumber,
      subject: input.subject,
      description: input.description,
      categoryId: input.categoryId,
      priority: input.priority as never,
      status: input.assignedUserId || input.assignedToId ? 'ASSIGNED' : 'OPEN',
      customerId: input.customerId,
      partnerId: input.partnerId,
      applicationId: input.applicationId,
      leadId: input.leadId,
      branchId: input.branchId,
      regionId: input.regionId,
      assignedToId: input.assignedToId,
      assignedUserId: input.assignedUserId,
      ...sla,
      metadata: input.metadata as Prisma.InputJsonValue,
      createdById: ctx.actorId,
      updatedById: ctx.actorId,
    });

    if (input.assignedUserId || input.assignedToId) {
      await ticketAssignmentRepository.create({
        ticketId: ticket.id,
        assignedToId: input.assignedToId,
        assignedUserId: input.assignedUserId,
        assignedById: ctx.actorId,
        assignmentType: 'ASSIGN',
      });
    }

    await ticketMessageRepository.create({
      ticketId: ticket.id,
      messageType: 'SYSTEM',
      body: `Ticket ${ticketNumber} created`,
      isInternal: true,
      authorUserId: ctx.actorId,
    });

    await auditTicketMutation(authAuditRepository.log, ctx, 'TICKET_CREATED', ticket.id, input);
    await notifyTicketEvent(ticket, 'SUPPORT_TICKET_CREATED', { subject: ticket.subject });
    emitAutomationEvent({
      triggerType: 'SUPPORT_TICKET_CREATED',
      subjectType: 'ticket',
      subjectId: ticket.id,
      userId: ctx.actorId,
      context: { ticketNumber, priority: ticket.priority, customerId: ticket.customerId },
    });

    return ticketRepository.findById(ticket.id);
  },

  async update(id: string, input: UpdateTicketInput, ctx: RequestContext) {
    const existing = await ticketService.getById(id);
    if (TERMINAL_TICKET_STATUSES.includes(existing.status as never)) {
      throw new AppError(400, 'BAD_REQUEST', `Cannot update ticket in ${existing.status} status`);
    }

    if (input.status && input.status !== existing.status) {
      ticketService.validateTransition(existing.status, input.status);
    }

    const ticket = await ticketRepository.update(id, {
      subject: input.subject,
      description: input.description,
      categoryId: input.categoryId,
      priority: input.priority as never,
      status: input.status as never,
      customerId: input.customerId,
      partnerId: input.partnerId,
      applicationId: input.applicationId,
      leadId: input.leadId,
      branchId: input.branchId,
      regionId: input.regionId,
      metadata: input.metadata as Prisma.InputJsonValue,
      updatedById: ctx.actorId,
      version: { increment: 1 },
    });

    await auditTicketMutation(authAuditRepository.log, ctx, 'TICKET_UPDATED', id, input);
    return ticket;
  },

  validateTransition(fromStatus: string, toStatus: string) {
    const allowed = STATUS_TRANSITIONS[fromStatus] ?? [];
    if (!allowed.includes(toStatus)) {
      throw new AppError(400, 'BAD_REQUEST', `Invalid transition ${fromStatus} → ${toStatus}`);
    }
  },

  async assign(id: string, input: AssignTicketInput, ctx: RequestContext) {
    const existing = await ticketService.getById(id);
    const assignmentType = existing.assignedUserId || existing.assignedToId ? 'REASSIGN' : 'ASSIGN';

    const ticket = await ticketRepository.update(id, {
      assignedToId: input.assignedToId,
      assignedUserId: input.assignedUserId,
      status: 'ASSIGNED',
      updatedById: ctx.actorId,
    });

    await ticketAssignmentRepository.create({
      ticketId: id,
      assignedToId: input.assignedToId,
      assignedUserId: input.assignedUserId,
      assignedById: ctx.actorId,
      assignmentType: assignmentType as never,
      reason: input.reason,
    });

    await ticketMessageRepository.create({
      ticketId: id,
      messageType: 'SYSTEM',
      body: `Ticket ${assignmentType === 'REASSIGN' ? 'reassigned' : 'assigned'}${input.reason ? `: ${input.reason}` : ''}`,
      isInternal: true,
      authorUserId: ctx.actorId,
    });

    await auditTicketMutation(authAuditRepository.log, ctx, 'TICKET_ASSIGNED', id, input);
    return ticket;
  },

  async escalate(id: string, input: EscalateTicketInput, ctx: RequestContext) {
    const existing = await ticketService.getById(id);
    const fromIdx = ESCALATION_ORDER.indexOf(existing.escalationLevel as never);
    const toIdx = ESCALATION_ORDER.indexOf(input.toLevel as never);
    if (toIdx <= fromIdx) {
      throw new AppError(400, 'BAD_REQUEST', 'Escalation level must be higher than current level');
    }

    const slaDueAt = ticketSlaService.calculateSlaDates(existing.priority).escalationSlaDueAt;

    await ticketEscalationRepository.create({
      ticketId: id,
      fromLevel: existing.escalationLevel as never,
      toLevel: input.toLevel as never,
      escalatedById: ctx.actorId,
      reason: input.reason,
      slaDueAt,
    });

    const ticket = await ticketRepository.update(id, {
      escalationLevel: input.toLevel as never,
      escalationSlaDueAt: slaDueAt,
      status: 'PENDING_INTERNAL',
      updatedById: ctx.actorId,
    });

    await ticketMessageRepository.create({
      ticketId: id,
      messageType: 'SYSTEM',
      body: `Escalated from ${existing.escalationLevel} to ${input.toLevel}${input.reason ? `: ${input.reason}` : ''}`,
      isInternal: true,
      authorUserId: ctx.actorId,
    });

    await auditTicketMutation(authAuditRepository.log, ctx, 'TICKET_ESCALATED', id, input);
    return ticket;
  },

  async resolve(id: string, input: ResolveTicketInput, ctx: RequestContext) {
    await ticketService.getById(id);

    await ticketResolutionRepository.create({
      ticketId: id,
      resolvedById: ctx.actorId,
      resolutionNotes: input.resolutionNotes,
      resolutionType: input.resolutionType,
    });

    const ticket = await ticketRepository.update(id, {
      status: 'RESOLVED',
      resolvedAt: new Date(),
      updatedById: ctx.actorId,
    });

    await ticketMessageRepository.create({
      ticketId: id,
      messageType: 'SYSTEM',
      body: `Ticket resolved: ${input.resolutionNotes}`,
      isInternal: false,
      authorUserId: ctx.actorId,
    });

    await auditTicketMutation(authAuditRepository.log, ctx, 'TICKET_RESOLVED', id, input);
    return ticket;
  },

  async close(id: string, input: CloseTicketInput, ctx: RequestContext) {
    const existing = await ticketService.getById(id);
    ticketService.validateTransition(existing.status, 'CLOSED');

    const ticket = await ticketRepository.update(id, {
      status: 'CLOSED',
      closedAt: new Date(),
      updatedById: ctx.actorId,
    });

    await ticketMessageRepository.create({
      ticketId: id,
      messageType: 'SYSTEM',
      body: `Ticket closed${input.reason ? `: ${input.reason}` : ''}`,
      isInternal: true,
      authorUserId: ctx.actorId,
    });

    await auditTicketMutation(authAuditRepository.log, ctx, 'TICKET_CLOSED', id, input);
    await notifyTicketEvent(existing, 'SUPPORT_TICKET_CLOSED', { reason: input.reason });
    emitAutomationEvent({
      triggerType: 'SUPPORT_TICKET_CLOSED',
      subjectType: 'ticket',
      subjectId: id,
      userId: ctx.actorId,
      context: { reason: input.reason, ticketNumber: existing.ticketNumber },
    });
    return ticket;
  },

  async reject(id: string, input: RejectTicketInput, ctx: RequestContext) {
    await ticketService.getById(id);

    const ticket = await ticketRepository.update(id, {
      status: 'REJECTED',
      closedAt: new Date(),
      updatedById: ctx.actorId,
    });

    await ticketMessageRepository.create({
      ticketId: id,
      messageType: 'SYSTEM',
      body: `Ticket rejected: ${input.reason}`,
      isInternal: true,
      authorUserId: ctx.actorId,
    });

    await auditTicketMutation(authAuditRepository.log, ctx, 'TICKET_REJECTED', id, input);
    return ticket;
  },

  async remove(id: string, ctx: RequestContext) {
    await ticketService.getById(id);
    await ticketRepository.softDelete(id, ctx.actorId);
    await auditTicketMutation(authAuditRepository.log, ctx, 'TICKET_DELETED', id);
    return { id, deleted: true };
  },

  async getTimeline(query: TicketTimelineQuery): Promise<{ items: TicketTimelineEvent[]; meta: ReturnType<typeof buildPaginationMeta> }> {
    await ticketService.getById(query.ticketId);

    const [messages, assignments, escalations, resolutions] = await Promise.all([
      ticketMessageRepository.list({ ticketId: query.ticketId }, 0, 500, { createdAt: 'asc' }),
      ticketAssignmentRepository.list({ ticketId: query.ticketId }, 0, 100, { createdAt: 'asc' }),
      ticketEscalationRepository.list({ ticketId: query.ticketId }, 0, 100, { escalatedAt: 'asc' }),
      ticketResolutionRepository.list({ ticketId: query.ticketId }, 0, 100, { resolvedAt: 'asc' }),
    ]);

    const events: TicketTimelineEvent[] = [
      ...messages.map((m) => ({
        id: m.id,
        ticketId: m.ticketId,
        eventType: 'MESSAGE',
        title: m.messageType,
        description: m.body,
        actorId: m.authorUserId,
        occurredAt: m.createdAt,
      })),
      ...assignments.map((a) => ({
        id: a.id,
        ticketId: a.ticketId,
        eventType: 'ASSIGNMENT',
        title: a.assignmentType,
        description: a.reason ?? undefined,
        actorId: a.assignedById,
        occurredAt: a.createdAt,
      })),
      ...escalations.map((e) => ({
        id: e.id,
        ticketId: e.ticketId,
        eventType: 'ESCALATION',
        title: `${e.fromLevel} → ${e.toLevel}`,
        description: e.reason ?? undefined,
        actorId: e.escalatedById,
        occurredAt: e.escalatedAt,
      })),
      ...resolutions.map((r) => ({
        id: r.id,
        ticketId: r.ticketId,
        eventType: 'RESOLUTION',
        title: 'Resolved',
        description: r.resolutionNotes,
        actorId: r.resolvedById,
        occurredAt: r.resolvedAt,
      })),
    ].sort((a, b) => a.occurredAt.getTime() - b.occurredAt.getTime());

    const skip = (query.page - 1) * query.limit;
    const paged = events.slice(skip, skip + query.limit);

    return {
      items: paged,
      meta: buildPaginationMeta(query.page, query.limit, events.length),
    };
  },
};
