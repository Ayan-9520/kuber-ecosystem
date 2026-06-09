import type { Prisma } from '@kuberone/database';
import type {
  CreateCreditReviewInput,
  ListCreditReviewsQuery,
  UpdateCreditReviewInput,
} from '@kuberone/shared-validation';

import { NotFoundError } from '../../../shared/errors/app-error.js';
import { authAuditRepository } from '../../auth/repositories/audit.repository.js';
import { applicationRepository } from '../repositories/application.repository.js';
import { creditReviewRepository } from '../repositories/credit-review.repository.js';
import type { RequestContext } from '../types/applications.types.js';
import { auditApplicationMutation, buildPaginationMeta } from '../utils/applications.utils.js';

import { applicationTimelineService } from './application-timeline.service.js';
import { applicationWorkflowService } from './application-workflow.service.js';

export const creditReviewService = {
  async list(query: ListCreditReviewsQuery) {
    const where: Prisma.CreditReviewWhereInput = {
      ...(query.applicationId ? { applicationId: query.applicationId } : {}),
      ...(query.reviewerId ? { reviewerId: query.reviewerId } : {}),
      ...(query.decision ? { decision: query.decision as never } : {}),
    };
    const skip = (query.page - 1) * query.limit;
    const orderBy = { [query.sortBy]: query.sortOrder };

    const [items, total] = await Promise.all([
      creditReviewRepository.list(where, skip, query.limit, orderBy),
      creditReviewRepository.count(where),
    ]);

    return { items, meta: buildPaginationMeta(query.page, query.limit, total) };
  },

  async getById(id: string) {
    const review = await creditReviewRepository.findById(id);
    if (!review) throw new NotFoundError('CreditReview', id);
    return review;
  },

  async create(input: CreateCreditReviewInput, ctx: RequestContext) {
    const application = await applicationRepository.findById(input.applicationId);
    if (!application) throw new NotFoundError('Application', input.applicationId);

    const review = await creditReviewRepository.create({
      applicationId: input.applicationId,
      reviewerId: input.reviewerId,
      reviewType: input.reviewType as never,
      decision: input.decision as never,
      reviewNotes: input.reviewNotes,
      riskIndicators: input.riskIndicators as Prisma.InputJsonValue,
      riskGrade: input.riskGrade as never,
      cibilScore: input.cibilScore,
      conditions: input.conditions,
      rejectionReason: input.rejectionReason,
      reviewedAt: input.decision !== 'PENDING' ? new Date() : undefined,
    });

    await applicationWorkflowService.transition(
      input.applicationId,
      'CREDIT_REVIEW',
      ctx,
      input.reviewNotes,
    );

    if (input.decision === 'REJECTED') {
      await applicationWorkflowService.transition(input.applicationId, 'REJECTED', ctx, input.rejectionReason);
    } else if (input.decision === 'APPROVED') {
      await applicationTimelineService.addEvent(
        input.applicationId,
        'CREDIT_REVIEW',
        'Credit review approved — ready for sanction',
        ctx,
        input.reviewNotes,
        { riskGrade: input.riskGrade },
      );
    }

    await applicationTimelineService.addEvent(
      input.applicationId,
      'CREDIT_REVIEW',
      `Credit review: ${input.decision}`,
      ctx,
      input.reviewNotes,
      { riskGrade: input.riskGrade, reviewType: input.reviewType },
    );

    await auditApplicationMutation(authAuditRepository.log, ctx, 'CREDIT_REVIEW_CREATED', 'credit_review', review.id, input);
    return review;
  },

  async update(id: string, input: UpdateCreditReviewInput, ctx: RequestContext) {
    const existing = await creditReviewService.getById(id);
    const review = await creditReviewRepository.update(id, {
      ...input,
      reviewType: input.reviewType as never,
      decision: input.decision as never,
      riskGrade: input.riskGrade as never,
      riskIndicators: input.riskIndicators as Prisma.InputJsonValue,
      reviewedAt: input.decision && input.decision !== 'PENDING' ? new Date() : undefined,
    });

    if (input.decision === 'REJECTED') {
      await applicationWorkflowService.transition(existing.applicationId, 'REJECTED', ctx, input.rejectionReason);
    }

    await auditApplicationMutation(authAuditRepository.log, ctx, 'CREDIT_REVIEW_UPDATED', 'credit_review', id, input);
    return review;
  },
};
