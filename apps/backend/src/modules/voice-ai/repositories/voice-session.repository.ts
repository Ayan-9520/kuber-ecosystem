import { randomUUID } from 'node:crypto';

import type { Prisma } from '@kuberone/database';

import { prisma } from '../../../config/database.js';
import type { AiLanguage } from '../../ai-advisor/constants/ai-advisor.constants.js';
import { VOICE_ACTIONS, VOICE_SESSION_ENTITY, type VoiceSessionStatus } from '../constants/voice-ai.constants.js';
import type { VoiceSessionMeta, VoiceSessionRecord } from '../types/voice-ai.types.js';

interface CreateSessionMeta {
  userId: string;
  conversationId: string;
  language: AiLanguage;
  customerId?: string;
  leadId?: string;
  applicationId?: string;
}

export const voiceSessionRepository = {
  async createSession(meta: CreateSessionMeta) {
    const sessionId = randomUUID();
    await prisma.auditLog.create({
      data: {
        userId: meta.userId,
        action: VOICE_ACTIONS.SESSION_STARTED,
        entityType: VOICE_SESSION_ENTITY,
        entityId: sessionId,
        newValues: {
          ...meta,
          status: 'active',
        } as Prisma.InputJsonValue,
      },
    });
    return sessionId;
  },

  async endSession(sessionId: string, userId: string, ctx?: { ipAddress?: string; userAgent?: string; requestId?: string }) {
    await prisma.auditLog.create({
      data: {
        userId,
        action: VOICE_ACTIONS.SESSION_ENDED,
        entityType: VOICE_SESSION_ENTITY,
        entityId: sessionId,
        newValues: { status: 'ended' } as Prisma.InputJsonValue,
        ipAddress: ctx?.ipAddress,
        userAgent: ctx?.userAgent,
        requestId: ctx?.requestId,
      },
    });
  },

  async logAudio(
    sessionId: string,
    userId: string,
    payload: Record<string, unknown>,
    ctx?: { ipAddress?: string; userAgent?: string; requestId?: string },
  ) {
    await prisma.auditLog.create({
      data: {
        userId,
        action: VOICE_ACTIONS.AUDIO_RECEIVED,
        entityType: VOICE_SESSION_ENTITY,
        entityId: sessionId,
        newValues: payload as Prisma.InputJsonValue,
        ipAddress: ctx?.ipAddress,
        userAgent: ctx?.userAgent,
        requestId: ctx?.requestId,
      },
    });
  },

  async appendMessage(
    sessionId: string,
    userId: string,
    role: 'user' | 'assistant',
    content: string,
    ctx?: { ipAddress?: string; userAgent?: string; requestId?: string },
  ) {
    await prisma.auditLog.create({
      data: {
        userId,
        action: VOICE_ACTIONS.MESSAGE,
        entityType: VOICE_SESSION_ENTITY,
        entityId: sessionId,
        newValues: {
          id: randomUUID(),
          role,
          content,
          createdAt: new Date().toISOString(),
        } as Prisma.InputJsonValue,
        ipAddress: ctx?.ipAddress,
        userAgent: ctx?.userAgent,
        requestId: ctx?.requestId,
      },
    });
  },

  async getSession(sessionId: string, userId: string): Promise<VoiceSessionRecord | null> {
    const logs = await prisma.auditLog.findMany({
      where: {
        entityType: VOICE_SESSION_ENTITY,
        entityId: sessionId,
        userId,
      },
      orderBy: { createdAt: 'asc' },
    });

    if (logs.length === 0) return null;

    const start = logs.find((l) => l.action === VOICE_ACTIONS.SESSION_STARTED);
    if (!start) return null;

    const meta = (start.newValues ?? {}) as unknown as VoiceSessionMeta;
    const ended = logs.some((l) => l.action === VOICE_ACTIONS.SESSION_ENDED);
    const status: VoiceSessionStatus = ended ? 'ended' : 'active';

    return {
      id: sessionId,
      userId,
      conversationId: meta.conversationId,
      language: meta.language ?? 'en',
      customerId: meta.customerId,
      leadId: meta.leadId,
      applicationId: meta.applicationId,
      status,
      createdAt: start.createdAt.toISOString(),
      updatedAt: logs[logs.length - 1]!.createdAt.toISOString(),
      messageCount: logs.filter((l) => l.action === VOICE_ACTIONS.MESSAGE).length,
      audioChunkCount: logs.filter((l) => l.action === VOICE_ACTIONS.AUDIO_RECEIVED).length,
    };
  },

  async listSessions(userId: string, page: number, limit: number): Promise<{ items: VoiceSessionRecord[]; total: number }> {
    const starts = await prisma.auditLog.findMany({
      where: {
        userId,
        entityType: VOICE_SESSION_ENTITY,
        action: VOICE_ACTIONS.SESSION_STARTED,
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    });

    const total = await prisma.auditLog.count({
      where: {
        userId,
        entityType: VOICE_SESSION_ENTITY,
        action: VOICE_ACTIONS.SESSION_STARTED,
      },
    });

    const items = (
      await Promise.all(
        starts
          .filter((start) => start.entityId)
          .map((start) => this.getSession(start.entityId!, userId)),
      )
    ).filter((session): session is VoiceSessionRecord => session !== null);

    return { items, total };
  },
};
