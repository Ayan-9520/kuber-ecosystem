import type { Prisma } from '@kuberone/database';
import type { AuthenticatedUser } from '@kuberone/shared-types';
import type {
  CreateLeadInput,
  ExportLeadsQuery,
  ListLeadsQuery,
  UpdateLeadInput,
} from '@kuberone/shared-validation';

import { UserType } from '@kuberone/shared-types';

import { env } from '../../../config/env.js';
import { prisma } from '../../../config/database.js';
import { NotFoundError } from '../../../shared/errors/app-error.js';
import { emitAutomationEvent } from '../../../shared/utils/automation-emitter.util.js';
import { applyLeadScope, assertLeadAccess } from '../../../shared/utils/data-scope.js';
import { authAuditRepository } from '../../auth/repositories/audit.repository.js';
import { productRepository } from '../../product/repositories/product.repository.js';
import { GRADE_ALIASES } from '../constants/leads.constants.js';
import { leadSourceRepository } from '../repositories/lead-source.repository.js';
import { leadStatusHistoryRepository } from '../repositories/lead-status-history.repository.js';
import { leadRepository } from '../repositories/lead.repository.js';
import type { RequestContext } from '../types/leads.types.js';
import {
  auditLeadMutation,
  buildPaginationMeta,
  generateLeadNumber,
  leadsToCsv,
} from '../utils/leads.utils.js';
import { serializeLead } from '../utils/lead-serializer.js';

import { leadAssignmentService } from './lead-assignment.service.js';
import { leadFollowUpService } from './lead-followup.service.js';
import { leadScoreService } from './lead-score.service.js';

function buildListWhere(query: ListLeadsQuery): Prisma.LeadWhereInput {
  return {
    ...(query.includeDeleted ? {} : { deletedAt: null }),
    ...(query.status ? { status: query.status as never } : {}),
    ...(query.grade ? { grade: query.grade as never } : {}),
    ...(query.priority ? { priority: query.priority as never } : {}),
    ...(query.sourceId ? { sourceId: query.sourceId } : {}),
    ...(query.productId ? { productId: query.productId } : {}),
    ...(query.variantId ? { variantId: query.variantId } : {}),
    ...(query.partnerId ? { partnerId: query.partnerId } : {}),
    ...(query.branchId ? { branchId: query.branchId } : {}),
    ...(query.regionId ? { regionId: query.regionId } : {}),
    ...(query.assignedToId ? { assignedToId: query.assignedToId } : {}),
    ...(query.search
      ? {
          OR: [
            { prospectName: { contains: query.search } },
            { prospectPhone: { contains: query.search } },
            { leadNumber: { contains: query.search } },
            { prospectEmail: { contains: query.search } },
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

function enrichLead<T extends Parameters<typeof serializeLead>[0]>(lead: T) {
  return {
    ...serializeLead(lead),
    gradeAlias: lead.grade ? (GRADE_ALIASES[lead.grade] ?? lead.grade) : null,
  };
}

function resolvePartnerIdForCreate(
  actor: AuthenticatedUser,
  inputPartnerId?: string,
): string | undefined {
  if (actor.userType === UserType.PARTNER && actor.partnerId) {
    return actor.partnerId;
  }
  return inputPartnerId;
}

export const leadService = {
  async list(actor: AuthenticatedUser, query: ListLeadsQuery) {
    const where = applyLeadScope(actor, buildListWhere(query));
    const skip = (query.page - 1) * query.limit;
    const orderBy = { [query.sortBy]: query.sortOrder };

    const [items, total] = await Promise.all([
      leadRepository.list(where, skip, query.limit, orderBy),
      leadRepository.count(where),
    ]);

    return {
      items: items.map(enrichLead),
      meta: buildPaginationMeta(query.page, query.limit, total),
    };
  },

  async getById(actor: AuthenticatedUser, id: string) {
    const lead = await leadRepository.findById(id);
    if (!lead) throw new NotFoundError('Lead', id);
    assertLeadAccess(actor, lead);
    const latestScore = await leadScoreService.getLatestForLead(id);
    return { ...enrichLead(lead), latestScore };
  },

  async create(actor: AuthenticatedUser, input: CreateLeadInput, ctx: RequestContext) {
    const [source, product] = await Promise.all([
      leadSourceRepository.findById(input.sourceId),
      productRepository.findById(input.productId),
    ]);
    if (!source) throw new NotFoundError('LeadSource', input.sourceId);
    if (!product) throw new NotFoundError('Product', input.productId);

    const last = await leadRepository.getLastLeadNumber();
    const leadNumber = generateLeadNumber(last?.leadNumber);

    const lead = await leadRepository.create({
      leadNumber,
      customerId: input.customerId,
      prospectName: input.prospectName,
      prospectPhone: input.prospectPhone,
      prospectEmail: input.prospectEmail,
      productId: input.productId,
      variantId: input.variantId,
      sourceId: input.sourceId,
      partnerId: resolvePartnerIdForCreate(actor, input.partnerId),
      branchId: input.branchId,
      regionId: input.regionId,
      requestedAmount: input.requestedAmount,
      priority: (input.priority ?? 'MEDIUM') as never,
      metadata: input.metadata as Prisma.InputJsonValue,
      status: 'NEW',
      createdById: ctx.actorId,
      updatedById: ctx.actorId,
    });

    await leadStatusHistoryRepository.create({
      leadId: lead.id,
      fromStatus: null,
      toStatus: 'NEW',
      changedById: ctx.actorId,
      reason: 'Lead created',
    });

    const scoringProfile = input.scoringProfile ?? {
      loanAmount: input.requestedAmount,
      productType: product.family?.code,
    };

    await leadScoreService.scoreLead({ leadId: lead.id, scoringProfile }, ctx, scoringProfile, actor);

    if (input.assignImmediately !== false) {
      try {
        await leadAssignmentService.autoAssign(
          lead.id,
          { branchId: input.branchId, assignmentType: 'LOAD_BALANCE' },
          ctx,
        );
      } catch {
        // assignment optional when no employees configured
      }
    }

    const refreshed = await leadRepository.findById(lead.id);
    await auditLeadMutation(authAuditRepository.log, ctx, 'LEAD_CREATED', 'lead', lead.id, input);
    emitAutomationEvent({
      triggerType: 'LEAD_CREATED',
      subjectType: 'lead',
      subjectId: lead.id,
      userId: ctx.actorId,
      context: { leadNumber, branchId: input.branchId, regionId: input.regionId, productId: input.productId },
    });
    return enrichLead(refreshed!);
  },

  async update(actor: AuthenticatedUser, id: string, input: UpdateLeadInput, ctx: RequestContext) {
    const existing = await leadRepository.findById(id);
    if (!existing) throw new NotFoundError('Lead', id);
    assertLeadAccess(actor, existing);

    if (input.status && input.status !== existing.status) {
      await leadStatusHistoryRepository.create({
        leadId: id,
        fromStatus: existing.status,
        toStatus: input.status as never,
        changedById: ctx.actorId,
        reason: input.lostReason ?? undefined,
      });

      if (input.status === 'LOST' || input.status === 'DISBURSED' || input.status === 'APPLICATION_CREATED') {
        if (input.status === 'DISBURSED' || input.status === 'APPLICATION_CREATED') {
          await leadRepository.update(id, { convertedAt: new Date(), updatedById: ctx.actorId });
        }
      }
    }

    const lead = await leadRepository.update(id, {
      customerId: input.customerId,
      prospectName: input.prospectName,
      prospectPhone: input.prospectPhone,
      prospectEmail: input.prospectEmail,
      productId: input.productId,
      variantId: input.variantId,
      sourceId: input.sourceId,
      partnerId: resolvePartnerIdForCreate(actor, input.partnerId ?? existing.partnerId ?? undefined),
      branchId: input.branchId,
      regionId: input.regionId,
      status: input.status as never,
      priority: input.priority as never,
      requestedAmount: input.requestedAmount,
      lostReason: input.lostReason,
      metadata: input.metadata as Prisma.InputJsonValue,
      version: { increment: 1 },
      updatedById: ctx.actorId,
    });

    if (input.rescore && input.scoringProfile) {
      await leadScoreService.scoreLead({ leadId: id, scoringProfile: input.scoringProfile }, ctx);
    }

    await auditLeadMutation(authAuditRepository.log, ctx, 'LEAD_UPDATED', 'lead', id, input);
    return enrichLead(lead);
  },

  async remove(actor: AuthenticatedUser, id: string, ctx: RequestContext) {
    await leadService.getById(actor, id);

    await prisma.application.updateMany({
      where: { leadId: id, deletedAt: null },
      data: { deletedAt: new Date(), deletedById: ctx.actorId },
    });

    await leadRepository.softDelete(id, ctx.actorId);
    await auditLeadMutation(authAuditRepository.log, ctx, 'LEAD_DELETED', 'lead', id);
  },

  async export(actor: AuthenticatedUser, query: ExportLeadsQuery) {
    const maxRows = env.LEAD_EXPORT_MAX_ROWS;
    const where = applyLeadScope(actor, buildListWhere({ ...query, page: 1, limit: maxRows, includeDeleted: false }));
    const rows = await leadRepository.list(where, 0, maxRows, { createdAt: 'desc' });

    if (query.format === 'json') {
      return { format: 'json', data: rows.map(enrichLead) };
    }

    return {
      format: 'csv',
      data: leadsToCsv(rows),
      contentType: 'text/csv',
      filename: `leads-export-${new Date().toISOString().slice(0, 10)}.csv`,
    };
  },

  async scheduleFollowUp(id: string, ctx: RequestContext) {
    const lead = await leadRepository.findById(id);
    if (!lead) throw new NotFoundError('Lead', id);
    if (!lead.assignedToId) {
      await leadAssignmentService.autoAssign(id, { branchId: lead.branchId ?? undefined, assignmentType: 'LOAD_BALANCE' }, ctx);
    }
    return leadFollowUpService.scheduleFromLead(id, ctx);
  },
};
