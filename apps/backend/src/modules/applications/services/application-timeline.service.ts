import type { Prisma } from '@kuberone/database';
import type { ApplicationTimelineEventType } from '@kuberone/database';
import type { ApplicationTimelineQuery, ListApplicationStatusQuery } from '@kuberone/shared-validation';

import { applicationStatusRepository } from '../repositories/application-status.repository.js';
import { applicationTimelineRepository } from '../repositories/application-timeline.repository.js';
import { bankLoginRepository } from '../repositories/bank-login.repository.js';
import { creditReviewRepository } from '../repositories/credit-review.repository.js';
import { disbursementRepository } from '../repositories/disbursement.repository.js';
import { sanctionRepository } from '../repositories/sanction.repository.js';
import type { RequestContext } from '../types/applications.types.js';
import { buildPaginationMeta } from '../utils/applications.utils.js';


export const applicationTimelineService = {
  async addEvent(
    applicationId: string,
    eventType: ApplicationTimelineEventType,
    title: string,
    ctx: RequestContext,
    description?: string,
    metadata?: Record<string, unknown>,
  ) {
    return applicationTimelineRepository.create({
      applicationId,
      eventType,
      title,
      description,
      performedById: ctx.actorId,
      metadata: metadata as Prisma.InputJsonValue,
    });
  },

  async listStatusHistory(query: ListApplicationStatusQuery) {
    const where = {
      ...(query.applicationId ? { applicationId: query.applicationId } : {}),
    };
    const skip = (query.page - 1) * query.limit;
    const orderBy = { [query.sortBy]: query.sortOrder };

    const [items, total] = await Promise.all([
      applicationStatusRepository.list(where, skip, query.limit, orderBy),
      applicationStatusRepository.count(where),
    ]);

    return { items, meta: buildPaginationMeta(query.page, query.limit, total) };
  },

  async getTimeline(query: ApplicationTimelineQuery) {
    const where: Prisma.ApplicationTimelineWhereInput = {
      applicationId: query.applicationId,
      ...(query.eventTypes?.length ? { eventType: { in: query.eventTypes as ApplicationTimelineEventType[] } } : {}),
    };
    const skip = (query.page - 1) * query.limit;
    const orderBy = { createdAt: query.sortOrder };

    const [stored, storedTotal] = await Promise.all([
      applicationTimelineRepository.list(where, skip, query.limit, orderBy),
      applicationTimelineRepository.count(where),
    ]);

    if (storedTotal > 0 || query.page > 1) {
      return { items: stored, meta: buildPaginationMeta(query.page, query.limit, storedTotal) };
    }

    const events: Prisma.ApplicationTimelineUncheckedCreateInput[] = [];

    const statusHistory = await applicationStatusRepository.list({ applicationId: query.applicationId }, 0, 100, {
      createdAt: 'desc',
    });
    for (const s of statusHistory) {
      events.push({
        applicationId: query.applicationId,
        eventType: 'STATUS_CHANGE',
        title: `Status: ${s.fromStatus ?? '—'} → ${s.toStatus}`,
        description: s.reason ?? undefined,
        performedById: s.changedById,
        createdAt: s.createdAt,
      });
    }

    const bankLogins = await bankLoginRepository.list({ applicationId: query.applicationId }, 0, 50, {
      loginDate: 'desc',
    });
    for (const b of bankLogins) {
      events.push({
        applicationId: query.applicationId,
        eventType: 'BANK_UPDATE',
        title: `Bank login: ${b.lender.name}`,
        description: b.notes ?? undefined,
        metadata: { status: b.status, loginDate: b.loginDate },
        createdAt: b.createdAt,
      });
    }

    const reviews = await creditReviewRepository.list({ applicationId: query.applicationId }, 0, 50, {
      createdAt: 'desc',
    });
    for (const r of reviews) {
      events.push({
        applicationId: query.applicationId,
        eventType: 'CREDIT_REVIEW',
        title: `Credit review: ${r.decision}`,
        description: r.reviewNotes ?? undefined,
        metadata: { reviewType: r.reviewType, riskGrade: r.riskGrade },
        createdAt: r.createdAt,
      });
    }

    const sanction = await sanctionRepository.findByApplicationId(query.applicationId);
    if (sanction) {
      events.push({
        applicationId: query.applicationId,
        eventType: 'SANCTION',
        title: `Sanction issued: ${sanction.sanctionAmount}`,
        description: sanction.conditions ?? undefined,
        createdAt: sanction.createdAt,
      });
    }

    const disbursements = await disbursementRepository.list({ applicationId: query.applicationId }, 0, 50, {
      disbursementDate: 'desc',
    });
    for (const d of disbursements) {
      events.push({
        applicationId: query.applicationId,
        eventType: 'DISBURSEMENT',
        title: `Disbursement: ${d.disbursementAmount}`,
        description: d.bankReference ?? undefined,
        metadata: { status: d.status, mode: d.disbursementMode },
        createdAt: d.createdAt,
      });
    }

    events.sort((a, b) => {
      const aTime = a.createdAt instanceof Date ? a.createdAt.getTime() : new Date(a.createdAt as string).getTime();
      const bTime = b.createdAt instanceof Date ? b.createdAt.getTime() : new Date(b.createdAt as string).getTime();
      return bTime - aTime;
    });
    const paginated = events.slice(skip, skip + query.limit);

    return {
      items: paginated as typeof stored,
      meta: buildPaginationMeta(query.page, query.limit, events.length),
    };
  },
};
