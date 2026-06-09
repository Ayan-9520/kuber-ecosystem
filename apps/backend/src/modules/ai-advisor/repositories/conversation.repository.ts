import { randomUUID } from 'node:crypto';

import type { Prisma } from '@kuberone/database';

import { prisma } from '../../../config/database.js';
import { AI_CONVERSATION_ENTITY } from '../constants/ai-advisor.constants.js';
import type { ConversationMessage, ConversationRecord } from '../types/ai-advisor.types.js';

interface ConversationMeta {
  userId: string;
  audience: string;
  language: string;
  customerId?: string;
  leadId?: string;
  applicationId?: string;
  partnerId?: string;
}

export const conversationRepository = {
  async createConversation(meta: ConversationMeta) {
    const conversationId = randomUUID();
    await prisma.auditLog.create({
      data: {
        userId: meta.userId,
        action: 'AI_CONVERSATION_STARTED',
        entityType: AI_CONVERSATION_ENTITY,
        entityId: conversationId,
        newValues: meta as unknown as Prisma.InputJsonValue,
      },
    });
    return conversationId;
  },

  async appendMessage(
    conversationId: string,
    userId: string,
    message: Omit<ConversationMessage, 'id' | 'createdAt'> & { intent?: string; tokensUsed?: number },
    ctx?: { ipAddress?: string; userAgent?: string; requestId?: string },
  ): Promise<ConversationMessage> {
    const record: ConversationMessage = {
      id: randomUUID(),
      role: message.role,
      content: message.content,
      language: message.language,
      intent: message.intent,
      createdAt: new Date().toISOString(),
    };

    await prisma.auditLog.create({
      data: {
        userId,
        action: 'AI_MESSAGE',
        entityType: AI_CONVERSATION_ENTITY,
        entityId: conversationId,
        newValues: {
          ...record,
          intent: message.intent,
          tokensUsed: message.tokensUsed,
        } as Prisma.InputJsonValue,
        ipAddress: ctx?.ipAddress,
        userAgent: ctx?.userAgent,
        requestId: ctx?.requestId,
      },
    });

    return record;
  },

  async getConversation(conversationId: string, userId: string): Promise<ConversationRecord | null> {
    const logs = await prisma.auditLog.findMany({
      where: {
        entityType: AI_CONVERSATION_ENTITY,
        entityId: conversationId,
        userId,
      },
      orderBy: { createdAt: 'asc' },
    });

    if (logs.length === 0) return null;

    const start = logs.find((l) => l.action === 'AI_CONVERSATION_STARTED');
    const meta = (start?.newValues ?? {}) as unknown as ConversationMeta;

    const messages: ConversationMessage[] = logs
      .filter((l) => l.action === 'AI_MESSAGE')
      .map((l) => {
        const v = l.newValues as Record<string, unknown>;
        return {
          id: String(v.id ?? l.id),
          role: v.role as ConversationMessage['role'],
          content: String(v.content ?? ''),
          language: v.language as ConversationMessage['language'],
          intent: v.intent as string | undefined,
          createdAt: String(v.createdAt ?? l.createdAt.toISOString()),
        };
      });

    return {
      id: conversationId,
      userId,
      audience: meta.audience as ConversationRecord['audience'],
      customerId: meta.customerId,
      leadId: meta.leadId,
      applicationId: meta.applicationId,
      partnerId: meta.partnerId,
      language: (meta.language ?? 'en') as ConversationRecord['language'],
      createdAt: start?.createdAt.toISOString() ?? logs[0]!.createdAt.toISOString(),
      updatedAt: logs[logs.length - 1]!.createdAt.toISOString(),
      messages,
    };
  },

  async listConversations(userId: string, limit = 20) {
    const starts = await prisma.auditLog.findMany({
      where: {
        userId,
        entityType: AI_CONVERSATION_ENTITY,
        action: 'AI_CONVERSATION_STARTED',
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return starts.map((s) => {
      const meta = (s.newValues ?? {}) as unknown as ConversationMeta;
      return {
        id: s.entityId!,
        audience: meta.audience,
        language: meta.language,
        customerId: meta.customerId,
        leadId: meta.leadId,
        applicationId: meta.applicationId,
        createdAt: s.createdAt.toISOString(),
      };
    });
  },
};
