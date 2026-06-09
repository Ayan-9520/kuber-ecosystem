import type { Prisma } from '@kuberone/database';
import type { CreateLeadActivityInput, ListLeadActivitiesQuery } from '@kuberone/shared-validation';

import { NotFoundError } from '../../../shared/errors/app-error.js';
import { authAuditRepository } from '../../auth/repositories/audit.repository.js';
import { leadActivityRepository } from '../repositories/lead-activity.repository.js';
import { leadRepository } from '../repositories/lead.repository.js';
import type { RequestContext } from '../types/leads.types.js';
import { auditLeadMutation, buildPaginationMeta } from '../utils/leads.utils.js';

export const leadActivityService = {
  async list(query: ListLeadActivitiesQuery) {
    const where: Prisma.LeadActivityWhereInput = {
      ...(query.leadId ? { leadId: query.leadId } : {}),
      ...(query.activityType ? { activityType: query.activityType as never } : {}),
      ...(query.performedById ? { performedById: query.performedById } : {}),
      ...(query.fromDate || query.toDate
        ? {
            createdAt: {
              ...(query.fromDate ? { gte: query.fromDate } : {}),
              ...(query.toDate ? { lte: query.toDate } : {}),
            },
          }
        : {}),
    };
    const skip = (query.page - 1) * query.limit;
    const orderBy = { [query.sortBy]: query.sortOrder };

    const [items, total] = await Promise.all([
      leadActivityRepository.list(where, skip, query.limit, orderBy),
      leadActivityRepository.count(where),
    ]);

    return { items, meta: buildPaginationMeta(query.page, query.limit, total) };
  },

  async getById(id: string) {
    const activity = await leadActivityRepository.findById(id);
    if (!activity) throw new NotFoundError('LeadActivity', id);
    return activity;
  },

  async create(input: CreateLeadActivityInput, ctx: RequestContext) {
    const lead = await leadRepository.findById(input.leadId);
    if (!lead) throw new NotFoundError('Lead', input.leadId);

    const activity = await leadActivityRepository.create({
      leadId: input.leadId,
      activityType: input.activityType as never,
      performedById: ctx.actorId,
      description: input.description,
      disposition: input.disposition as never,
      durationSeconds: input.durationSeconds,
      scheduledAt: input.scheduledAt,
      completedAt: input.completedAt ?? new Date(),
      metadata: input.metadata as Prisma.InputJsonValue,
    });

    await auditLeadMutation(authAuditRepository.log, ctx, 'LEAD_ACTIVITY_CREATED', 'lead_activity', activity.id, input);
    return activity;
  },
};
