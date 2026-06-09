import type { z } from 'zod';

import { NotFoundError, ValidationError } from '../../../shared/errors/app-error.js';
import { knowledgeRepository } from '../repositories/knowledge.repository.js';
import type { RequestContext } from '../types/knowledge-base.types.js';
import type { approvalActionSchema, listApprovalsQuerySchema, listReviewsQuerySchema, reviewSchema } from '../validators/knowledge.validator.js';

type ApprovalInput = z.infer<typeof approvalActionSchema>;
type ReviewInput = z.infer<typeof reviewSchema>;
type ListApprovalsQuery = z.infer<typeof listApprovalsQuerySchema>;
type ListReviewsQuery = z.infer<typeof listReviewsQuerySchema>;

const STATUS_MAP: Record<string, string> = {
  SUBMITTED: 'REVIEW',
  REVIEWED: 'REVIEW',
  APPROVED: 'APPROVED',
  REJECTED: 'DRAFT',
  PUBLISHED: 'PUBLISHED',
  ARCHIVED: 'ARCHIVED',
};

export const knowledgeApprovalService = {
  async submitAction(input: ApprovalInput, actorId: string, actorRole: string, ctx: RequestContext) {
    const article = await knowledgeRepository.findArticleById(input.articleId);
    if (!article) throw new NotFoundError('KnowledgeArticle', input.articleId);

    const version = input.version ?? article.currentVersion;
    const approval = await knowledgeRepository.createApproval({
      article: { connect: { id: input.articleId } },
      version,
      action: input.action,
      actorId,
      actorRole,
      comments: input.comments,
    });

    const newStatus = STATUS_MAP[input.action];
    if (newStatus) {
      await knowledgeRepository.updateArticle(input.articleId, {
        status: newStatus as never,
        ...(input.action === 'PUBLISHED' ? { publishedAt: new Date(), publisherId: actorId } : {}),
        ...(input.action === 'ARCHIVED' ? { archivedAt: new Date() } : {}),
        ...(input.action === 'APPROVED' ? { approverId: actorId } : {}),
        ...(input.action === 'REVIEWED' ? { reviewerId: actorId } : {}),
      });
    }

    const auditAction = input.action === 'APPROVED' ? 'APPROVAL_APPROVED'
      : input.action === 'REJECTED' ? 'APPROVAL_REJECTED'
      : 'APPROVAL_SUBMITTED';

    await knowledgeRepository.createAudit({
      userId: actorId,
      action: auditAction as never,
      entityType: 'article',
      entityId: input.articleId,
      newValues: { action: input.action, version },
      ipAddress: ctx.ipAddress,
      requestId: ctx.requestId,
    });

    return approval;
  },

  async listQueue(query: ListApprovalsQuery) {
    const where = query.status
      ? { article: { status: query.status as never } }
      : { action: { in: ['SUBMITTED', 'REVIEWED'] as never[] } };
    const skip = (query.page - 1) * query.limit;
    const items = await knowledgeRepository.listApprovals(where, skip, query.limit);
    return {
      items: items.map((a) => ({
        id: a.id,
        articleId: a.articleId,
        articleTitle: a.article.title,
        articleStatus: a.article.status,
        version: a.version,
        action: a.action,
        actorId: a.actorId,
        actorRole: a.actorRole,
        comments: a.comments,
        createdAt: a.createdAt.toISOString(),
      })),
      meta: { page: query.page, limit: query.limit },
    };
  },

  async createReview(input: ReviewInput, reviewerId: string, ctx: RequestContext) {
    const article = await knowledgeRepository.findArticleById(input.articleId);
    if (!article) throw new NotFoundError('KnowledgeArticle', input.articleId);

    const review = await knowledgeRepository.createReview({
      article: { connect: { id: input.articleId } },
      reviewerId,
      rating: input.rating,
      comments: input.comments,
      status: input.status ?? 'PENDING',
    });

    await knowledgeRepository.createAudit({
      userId: reviewerId,
      action: 'CREATED',
      entityType: 'review',
      entityId: review.id,
      newValues: { articleId: input.articleId },
      ipAddress: ctx.ipAddress,
      requestId: ctx.requestId,
    });

    return review;
  },

  async listReviews(query: ListReviewsQuery) {
    const where = query.status ? { status: query.status } : {};
    const skip = (query.page - 1) * query.limit;
    const items = await knowledgeRepository.listReviews(where, skip, query.limit);
    return {
      items: items.map((r) => ({
        id: r.id,
        articleId: r.articleId,
        articleTitle: r.article.title,
        reviewerId: r.reviewerId,
        rating: r.rating,
        comments: r.comments,
        status: r.status,
        reviewedAt: r.reviewedAt?.toISOString() ?? null,
        createdAt: r.createdAt.toISOString(),
      })),
      meta: { page: query.page, limit: query.limit },
    };
  },

  async rollback(articleId: string, version: number, actorId: string, ctx: RequestContext) {
    const article = await knowledgeRepository.findArticleById(articleId);
    if (!article) throw new NotFoundError('KnowledgeArticle', articleId);

    const targetVersion = await knowledgeRepository.findVersion(articleId, version);
    if (!targetVersion) throw new ValidationError({ version: [`Version ${version} not found`] });

    const newVersion = article.currentVersion + 1;
    await knowledgeRepository.createVersion({
      article: { connect: { id: articleId } },
      version: newVersion,
      title: targetVersion.title,
      summary: targetVersion.summary,
      content: targetVersion.content,
      changeNotes: `Rolled back to version ${version}`,
      createdById: actorId,
    });

    await knowledgeRepository.updateArticle(articleId, {
      title: targetVersion.title,
      summary: targetVersion.summary,
      content: targetVersion.content,
      currentVersion: newVersion,
    });

    await knowledgeRepository.createApproval({
      article: { connect: { id: articleId } },
      version: newVersion,
      action: 'ROLLED_BACK',
      actorId,
      actorRole: 'ADMIN',
      comments: `Rolled back to version ${version}`,
    });

    await knowledgeRepository.createAudit({
      userId: actorId,
      action: 'VERSION_CREATED',
      entityType: 'article',
      entityId: articleId,
      newValues: { rolledBackTo: version, newVersion },
      ipAddress: ctx.ipAddress,
      requestId: ctx.requestId,
    });

    return { articleId, newVersion, rolledBackTo: version };
  },
};
