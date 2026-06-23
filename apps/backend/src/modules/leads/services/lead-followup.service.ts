import type { Prisma } from '@kuberone/database';
import type {
  CreateLeadFollowUpInput,
  ListLeadFollowUpsQuery,
  UpdateLeadFollowUpInput,
} from '@kuberone/shared-validation';

import { prisma } from '../../../config/database.js';
import { NotFoundError } from '../../../shared/errors/app-error.js';
import { authAuditRepository } from '../../auth/repositories/audit.repository.js';
import { leadFollowUpRepository } from '../repositories/lead-followup.repository.js';
import { leadRepository } from '../repositories/lead.repository.js';
import type { RequestContext } from '../types/leads.types.js';
import { auditLeadMutation, buildPaginationMeta } from '../utils/leads.utils.js';
import { serializeLeadFollowUp } from '../utils/lead-subresource-serializer.js';

import { followUpEngineService } from './follow-up-engine.service.js';

export const leadFollowUpService = {
  async list(query: ListLeadFollowUpsQuery) {
    const where: Prisma.LeadFollowUpWhereInput = {
      ...(query.leadId ? { leadId: query.leadId } : {}),
      ...(query.assignedToId ? { assignedToId: query.assignedToId } : {}),
      ...(query.status ? { status: query.status as never } : {}),
      ...(query.followUpType ? { followUpType: query.followUpType as never } : {}),
      ...(query.overdue
        ? { status: 'PENDING', scheduledAt: { lt: new Date() } }
        : {}),
      ...(query.fromDate || query.toDate
        ? {
            scheduledAt: {
              ...(query.fromDate ? { gte: query.fromDate } : {}),
              ...(query.toDate ? { lte: query.toDate } : {}),
            },
          }
        : {}),
    };
    const skip = (query.page - 1) * query.limit;
    const orderBy = { [query.sortBy]: query.sortOrder };

    const [items, total] = await Promise.all([
      leadFollowUpRepository.list(where, skip, query.limit, orderBy),
      leadFollowUpRepository.count(where),
    ]);

    return {
      items: items.map(serializeLeadFollowUp),
      meta: buildPaginationMeta(query.page, query.limit, total),
    };
  },

  async getById(id: string) {
    const followUp = await leadFollowUpRepository.findById(id);
    if (!followUp) throw new NotFoundError('LeadFollowUp', id);
    return followUp;
  },

  async create(input: CreateLeadFollowUpInput, ctx: RequestContext) {
    const lead = await leadRepository.findById(input.leadId);
    if (!lead) throw new NotFoundError('Lead', input.leadId);

    const employee = await prisma.employee.findFirst({
      where: { id: input.assignedToId, isActive: true },
    });
    if (!employee) throw new NotFoundError('Employee', input.assignedToId);

    const followUp = await leadFollowUpRepository.create({
      leadId: input.leadId,
      assignedToId: input.assignedToId,
      followUpType: input.followUpType as never,
      scheduledAt: input.scheduledAt,
      notes: input.notes,
      createdById: ctx.actorId,
    });

    await auditLeadMutation(authAuditRepository.log, ctx, 'LEAD_FOLLOWUP_CREATED', 'lead_followup', followUp.id, input);
    return followUp;
  },

  async update(id: string, input: UpdateLeadFollowUpInput, ctx: RequestContext) {
    await leadFollowUpService.getById(id);
    const followUp = await leadFollowUpRepository.update(id, {
      ...input,
      followUpType: input.followUpType as never,
      status: input.status as never,
    });
    await auditLeadMutation(authAuditRepository.log, ctx, 'LEAD_FOLLOWUP_UPDATED', 'lead_followup', id, input);
    return followUp;
  },

  async scheduleFromLead(leadId: string, ctx: RequestContext) {
    const lead = await leadRepository.findById(leadId);
    if (!lead) throw new NotFoundError('Lead', leadId);
    if (!lead.assignedToId) throw new NotFoundError('LeadAssignment', 'current');

    const scheduledAt = followUpEngineService.computeNextFollowUpDate(lead.grade);
    const followUpType = followUpEngineService.defaultFollowUpType(lead.grade);

    return leadFollowUpService.create(
      {
        leadId,
        assignedToId: lead.assignedToId,
        followUpType,
        scheduledAt,
        notes: 'Auto-scheduled follow-up',
      },
      ctx,
    );
  },

  async processReminders() {
    return followUpEngineService.processReminders();
  },
};
