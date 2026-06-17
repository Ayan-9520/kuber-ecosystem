import type { AuthenticatedUser } from '@kuberone/shared-types';

import { NotFoundError } from '../../../shared/errors/app-error.js';
import { knowledgeRepository } from '../../knowledge-base/repositories/knowledge.repository.js';
import { knowledgeApprovalService, knowledgeArticleService } from '../../knowledge-base/services/knowledge.service.js';
import { notificationDispatchService } from '../../notifications/services/notification-dispatch.service.js';
import { contentRepository } from '../repositories/content.repository.js';

import { contentAuditService } from './content-audit.service.js';

type RequestContext = { actorId: string; ipAddress?: string; userAgent?: string };

async function publishToKnowledgeBase(
  actor: AuthenticatedUser,
  requestId: string,
  contentType: string,
  result: { title: string | null; subject: string | null; body: string },
  ctx: RequestContext,
): Promise<string | null> {
  if (contentType !== 'KNOWLEDGE_ARTICLE' && contentType !== 'FAQ') return null;

  const categoryCode = contentType === 'FAQ' ? 'FAQS' : 'MARKETING';
  const category = await knowledgeRepository.findCategoryByCode(categoryCode);
  if (!category) return null;

  const title = result.title ?? result.subject ?? 'AI Generated Content';
  const article = await knowledgeArticleService.create(
    {
      title,
      summary: result.body.slice(0, 300),
      content: result.body,
      contentType: contentType === 'FAQ' ? 'FAQ' : 'ARTICLE',
      categoryId: category.id,
    },
    actor.id,
    { actorId: ctx.actorId, ipAddress: ctx.ipAddress, userAgent: ctx.userAgent },
  );

  await knowledgeApprovalService.submitAction(
    {
      articleId: article.id,
      action: 'PUBLISHED',
      comments: `Published from KuberOne content generation ${requestId}`,
    },
    actor.id,
    actor.roles?.[0] ?? 'CONTENT_PUBLISHER',
    { actorId: ctx.actorId, ipAddress: ctx.ipAddress, userAgent: ctx.userAgent },
  );

  return article.id;
}

export const contentApprovalService = {
  async approve(actor: AuthenticatedUser, requestId: string, comments: string | undefined, ctx: RequestContext) {
    const request = await contentRepository.request.findById(requestId);
    if (!request) throw new NotFoundError('ContentGenerationRequest', requestId);

    await contentRepository.approval.create({
      request: { connect: { id: requestId } },
      status: 'APPROVED',
      reviewer: { connect: { id: actor.id } },
      comments,
      reviewedAt: new Date(),
    });

    await contentRepository.request.update(requestId, { status: 'APPROVED' });

    await contentAuditService.log({
      requestId,
      action: 'CONTENT_APPROVED',
      actorId: ctx.actorId,
      ipAddress: ctx.ipAddress,
      userAgent: ctx.userAgent,
    });

    return contentRepository.request.findById(requestId);
  },

  async reject(actor: AuthenticatedUser, requestId: string, comments: string | undefined, ctx: RequestContext) {
    const request = await contentRepository.request.findById(requestId);
    if (!request) throw new NotFoundError('ContentGenerationRequest', requestId);

    await contentRepository.approval.create({
      request: { connect: { id: requestId } },
      status: 'REJECTED',
      reviewer: { connect: { id: actor.id } },
      comments,
      reviewedAt: new Date(),
    });

    await contentRepository.request.update(requestId, { status: 'DRAFT' });

    await contentAuditService.log({
      requestId,
      action: 'CONTENT_REJECTED',
      actorId: ctx.actorId,
      ipAddress: ctx.ipAddress,
      userAgent: ctx.userAgent,
    });

    return contentRepository.request.findById(requestId);
  },

  async publish(actor: AuthenticatedUser, requestId: string, channel: string | undefined, ctx: RequestContext) {
    const request = await contentRepository.request.findById(requestId);
    if (!request) throw new NotFoundError('ContentGenerationRequest', requestId);
    if (request.status !== 'APPROVED') {
      await contentRepository.request.update(requestId, { status: 'APPROVED' });
    }

    const result = request.results[0];
    if (!result) throw new NotFoundError('ContentGenerationResult', requestId);

    const dispatchChannel = channel ?? mapContentTypeToChannel(request.contentType);
    if (dispatchChannel && request.requestedById) {
      try {
        await notificationDispatchService.dispatchToChannel({
          userId: request.requestedById,
          channel: dispatchChannel,
          eventType: 'AUTOMATION_GENERATE_AI_CONTENT',
          title: result.subject ?? result.title ?? 'Kuber Finserve',
          body: result.body,
          entityType: 'content_generation',
          entityId: requestId,
        });
      } catch {
        // dispatch optional for publish tracking
      }
    }

    const knowledgeArticleId = await publishToKnowledgeBase(
      actor,
      requestId,
      request.contentType,
      result,
      ctx,
    ).catch(() => null);

    await contentRepository.usage.create({
      request: { connect: { id: requestId } },
      channel: dispatchChannel ?? request.contentType,
      entityType: request.campaignId ? 'campaign' : (request.entityType ?? undefined),
      entityId: request.campaignId ?? request.entityId ?? undefined,
      usedBy: { connect: { id: actor.id } },
    });

    await contentRepository.request.update(requestId, { status: 'PUBLISHED' });

    await contentAuditService.log({
      requestId,
      action: 'CONTENT_PUBLISHED',
      actorId: ctx.actorId,
      after: { channel: dispatchChannel, knowledgeArticleId, campaignId: request.campaignId },
      ipAddress: ctx.ipAddress,
      userAgent: ctx.userAgent,
    });

    return contentRepository.request.findById(requestId);
  },

  async listPending(_actor: AuthenticatedUser, page: number, limit: number) {
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      contentRepository.request.findMany({
        where: { status: 'REVIEW' },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { results: true, template: true, requestedBy: { select: { email: true } } },
      }),
      contentRepository.request.count({ status: 'REVIEW' }),
    ]);
    return { items, meta: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 } };
  },
};

function mapContentTypeToChannel(contentType: string): string | null {
  const map: Record<string, string> = {
    EMAIL: 'EMAIL',
    SMS: 'SMS',
    WHATSAPP: 'WHATSAPP',
    PUSH: 'PUSH',
    CAMPAIGN: 'EMAIL',
  };
  return map[contentType] ?? null;
}
