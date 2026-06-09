import { authAuditRepository } from '../../auth/repositories/audit.repository.js';
import { AI_ACTIONS, AI_AUDIT_ENTITY } from '../constants/ai-advisor.constants.js';
import type { AiLanguage } from '../constants/ai-advisor.constants.js';
import { conversationRepository } from '../repositories/conversation.repository.js';
import type { RequestContext } from '../types/ai-advisor.types.js';

import { promptBuilderService } from './prompt-builder.service.js';

export const conversationStoreService = {
  createConversation(params: {
    userId: string;
    audience: string;
    language: AiLanguage;
    customerId?: string;
    leadId?: string;
    applicationId?: string;
    partnerId?: string;
  }) {
    return conversationRepository.createConversation(params);
  },

  appendUserMessage(
    conversationId: string,
    userId: string,
    content: string,
    language: AiLanguage,
    intent: string,
    ctx: RequestContext,
  ) {
    return conversationRepository.appendMessage(
      conversationId,
      userId,
      { role: 'user', content, language, intent },
      ctx,
    );
  },

  appendAssistantMessage(
    conversationId: string,
    userId: string,
    content: string,
    language: AiLanguage,
    intent: string,
    tokensUsed: number | undefined,
    ctx: RequestContext,
  ) {
    return conversationRepository.appendMessage(
      conversationId,
      userId,
      { role: 'assistant', content, language, intent, tokensUsed },
      ctx,
    );
  },

  getConversation(conversationId: string, userId: string) {
    return conversationRepository.getConversation(conversationId, userId);
  },

  listConversations(userId: string, limit?: number) {
    return conversationRepository.listConversations(userId, limit);
  },

  async auditInteraction(params: {
    userId: string;
    action: string;
    payload: Record<string, unknown>;
    ctx: RequestContext;
  }) {
    await authAuditRepository.log({
      userId: params.userId,
      action: params.action,
      entityType: AI_AUDIT_ENTITY,
      newValues: params.payload as never,
      ipAddress: params.ctx.ipAddress,
      userAgent: params.ctx.userAgent,
      requestId: params.ctx.requestId,
    });
  },

  resolveAudience(actor: Parameters<typeof promptBuilderService.resolveAudience>[0]) {
    return promptBuilderService.resolveAudience(actor);
  },
};

export { AI_ACTIONS };
