import type { Prisma } from '@kuberone/database';
import type {
  AssignLeadInput,
  AutoAssignLeadInput,
  ListLeadAssignmentsQuery,
} from '@kuberone/shared-validation';

import { prisma } from '../../../config/database.js';
import { NotFoundError } from '../../../shared/errors/app-error.js';
import { emitAutomationEvent } from '../../../shared/utils/automation-emitter.util.js';
import { authAuditRepository } from '../../auth/repositories/audit.repository.js';
import { leadActivityRepository } from '../repositories/lead-activity.repository.js';
import { leadAssignmentRepository } from '../repositories/lead-assignment.repository.js';
import { leadRepository } from '../repositories/lead.repository.js';
import type { RequestContext } from '../types/leads.types.js';
import { auditLeadMutation, buildPaginationMeta } from '../utils/leads.utils.js';

import { leadAssignmentEngineService } from './lead-assignment-engine.service.js';

export const leadAssignmentService = {
  async list(query: ListLeadAssignmentsQuery) {
    const where: Prisma.LeadAssignmentWhereInput = {
      ...(query.leadId ? { leadId: query.leadId } : {}),
      ...(query.assignedToId ? { assignedToId: query.assignedToId } : {}),
      ...(query.branchId ? { branchId: query.branchId } : {}),
      ...(query.isCurrent !== undefined ? { isCurrent: query.isCurrent } : {}),
      ...(query.assignmentType ? { assignmentType: query.assignmentType as never } : {}),
    };
    const skip = (query.page - 1) * query.limit;
    const orderBy = { [query.sortBy]: query.sortOrder };

    const [items, total] = await Promise.all([
      leadAssignmentRepository.list(where, skip, query.limit, orderBy),
      leadAssignmentRepository.count(where),
    ]);

    return { items, meta: buildPaginationMeta(query.page, query.limit, total) };
  },

  async getById(id: string) {
    const assignment = await leadAssignmentRepository.findById(id);
    if (!assignment) throw new NotFoundError('LeadAssignment', id);
    return assignment;
  },

  async assign(leadId: string, input: AssignLeadInput, ctx: RequestContext) {
    const lead = await leadRepository.findById(leadId);
    if (!lead) throw new NotFoundError('Lead', leadId);

    const employee = await prisma.employee.findFirst({
      where: { id: input.assignedToId, isActive: true, deletedAt: null },
    });
    if (!employee) throw new NotFoundError('Employee', input.assignedToId);

    await leadAssignmentRepository.clearCurrent(leadId);

    const now = new Date();
    const assignment = await leadAssignmentRepository.create({
      leadId,
      assignedToId: input.assignedToId,
      assignedById: await resolveEmployeeId(ctx.actorId),
      branchId: input.branchId ?? employee.branchId,
      assignmentType: input.assignmentType as never,
      assignedAt: now,
      isCurrent: true,
      notes: input.notes,
    });

    await leadRepository.update(leadId, {
      assignedToId: input.assignedToId,
      branchId: input.branchId ?? employee.branchId,
      updatedById: ctx.actorId,
    });

    await leadActivityRepository.create({
      leadId,
      activityType: 'ASSIGNMENT',
      performedById: ctx.actorId,
      description: `Lead assigned to ${employee.firstName} ${employee.lastName}`,
      completedAt: now,
    });

    await auditLeadMutation(authAuditRepository.log, ctx, 'LEAD_ASSIGNED', 'lead', leadId, input);
    emitAutomationEvent({
      triggerType: 'LEAD_ASSIGNED',
      subjectType: 'lead',
      subjectId: leadId,
      userId: ctx.actorId,
      context: { assignedToId: input.assignedToId, branchId: input.branchId ?? employee.branchId },
    });
    return assignment;
  },

  async reassign(leadId: string, input: AssignLeadInput, ctx: RequestContext) {
    return leadAssignmentService.assign(leadId, { ...input, assignmentType: input.assignmentType ?? 'MANUAL' }, ctx);
  },

  async autoAssign(leadId: string, input: AutoAssignLeadInput, ctx: RequestContext) {
    const lead = await leadRepository.findById(leadId);
    if (!lead) throw new NotFoundError('Lead', leadId);

    const branchId = input.branchId ?? lead.branchId ?? undefined;
    const assigneeId = await leadAssignmentEngineService.resolveAssignee(
      branchId,
      input.assignmentType as never,
    );

    return leadAssignmentService.assign(
      leadId,
      {
        assignedToId: assigneeId,
        assignmentType: input.assignmentType as never,
        branchId,
      },
      ctx,
    );
  },
};

async function resolveEmployeeId(userId: string): Promise<string | undefined> {
  const employee = await prisma.employee.findFirst({ where: { userId }, select: { id: true } });
  return employee?.id;
}
