import type { AuthenticatedUser } from '@kuberone/shared-types';

import { AppError, NotFoundError } from '../../../shared/errors/app-error.js';
import { aiAdvisorService } from '../../ai-advisor/services/ai-advisor.service.js';
import { conversationStoreService } from '../../ai-advisor/services/conversation-store.service.js';
import { promptBuilderService } from '../../ai-advisor/services/prompt-builder.service.js';
import { speechToTextService } from '../../ai-platform/services/speech-to-text.service.js';
import { textToSpeechService } from '../../ai-platform/services/text-to-speech.service.js';
import { authAuditRepository } from '../../auth/repositories/audit.repository.js';
import { VOICE_AUDIT_ENTITY } from '../constants/voice-ai.constants.js';
import { voiceSessionRepository } from '../repositories/voice-session.repository.js';
import type {
  RequestContext,
  VoiceAudioResult,
  VoiceMessageResult,
  VoiceSessionRecord,
} from '../types/voice-ai.types.js';
import type {
  CreateVoiceSessionInput,
  VoiceAudioInput,
  VoiceMessageInput,
} from '../validators/voice-ai.validator.js';

export const voiceSessionService = {
  async listSessions(actor: AuthenticatedUser, page = 1, limit = 20) {
    const result = await voiceSessionRepository.listSessions(actor.id, page, limit);
    return {
      items: result.items,
      meta: {
        page,
        limit,
        total: result.total,
        totalPages: Math.max(1, Math.ceil(result.total / limit)),
      },
    };
  },

  async createSession(
    actor: AuthenticatedUser,
    input: CreateVoiceSessionInput,
    ctx: RequestContext,
  ): Promise<VoiceSessionRecord> {
    const audience = promptBuilderService.resolveAudience(actor);

    let conversationId = input.conversationId;
    if (conversationId) {
      const existing = await conversationStoreService.getConversation(conversationId, actor.id);
      if (!existing) conversationId = undefined;
    }

    if (!conversationId) {
      conversationId = await conversationStoreService.createConversation({
        userId: actor.id,
        audience,
        language: input.language,
        customerId: input.customerId ?? actor.customerId,
        leadId: input.leadId,
        applicationId: input.applicationId,
        partnerId: actor.partnerId,
      });
    }

    const sessionId = await voiceSessionRepository.createSession({
      userId: actor.id,
      conversationId,
      language: input.language,
      customerId: input.customerId ?? actor.customerId,
      leadId: input.leadId,
      applicationId: input.applicationId,
    });

    await authAuditRepository.log({
      userId: actor.id,
      action: 'VOICE_SESSION_CREATED',
      entityType: VOICE_AUDIT_ENTITY,
      entityId: sessionId,
      newValues: { conversationId, language: input.language, channel: 'voice' } as never,
      ipAddress: ctx.ipAddress,
      userAgent: ctx.userAgent,
      requestId: ctx.requestId,
    });

    const session = await voiceSessionRepository.getSession(sessionId, actor.id);
    if (!session) throw new AppError(500, 'VOICE_SESSION_ERROR', 'Failed to create voice session');
    return session;
  },

  async getSession(sessionId: string, userId: string): Promise<VoiceSessionRecord> {
    const session = await voiceSessionRepository.getSession(sessionId, userId);
    if (!session) throw new NotFoundError('Voice session', sessionId);
    return session;
  },

  async endSession(sessionId: string, actor: AuthenticatedUser, ctx: RequestContext): Promise<VoiceSessionRecord> {
    const session = await this.getSession(sessionId, actor.id);
    if (session.status === 'ended') return session;

    await voiceSessionRepository.endSession(sessionId, actor.id, ctx);
    await authAuditRepository.log({
      userId: actor.id,
      action: 'VOICE_SESSION_ENDED',
      entityType: VOICE_AUDIT_ENTITY,
      entityId: sessionId,
      newValues: { messageCount: session.messageCount } as never,
      ipAddress: ctx.ipAddress,
      userAgent: ctx.userAgent,
      requestId: ctx.requestId,
    });

    return (await voiceSessionRepository.getSession(sessionId, actor.id))!;
  },

  async receiveAudio(
    sessionId: string,
    actor: AuthenticatedUser,
    input: VoiceAudioInput,
    ctx: RequestContext,
  ): Promise<VoiceAudioResult> {
    const session = await this.getSession(sessionId, actor.id);
    if (session.status !== 'active') {
      throw new AppError(400, 'VOICE_SESSION_ENDED', 'Voice session is no longer active');
    }

    await voiceSessionRepository.logAudio(
      sessionId,
      actor.id,
      {
        mimeType: input.mimeType ?? 'audio/webm',
        durationMs: input.durationMs,
        byteLength: input.byteLength,
        hasTranscript: Boolean(input.transcript),
      },
      ctx,
    );

    let transcript = input.transcript?.trim() ?? null;

    if (!transcript && input.audioBase64 && speechToTextService.isAvailable()) {
      const stt = await speechToTextService.transcribe(
        {
          module: 'VOICE_AI',
          audioBuffer: Buffer.from(input.audioBase64, 'base64'),
          mimeType: input.mimeType ?? 'audio/webm',
          language: session.language,
        },
        { actorId: actor.id, ipAddress: ctx.ipAddress, requestId: ctx.requestId },
      );
      transcript = stt.text?.trim() || null;
    }

    if (transcript) {
      const messageResult = await this.sendMessage(sessionId, actor, {
        text: transcript,
        language: session.language,
        customerId: session.customerId,
      }, ctx);

      let audioBase64: string | undefined;
      if (textToSpeechService.isAvailable()) {
        const tts = await textToSpeechService.synthesize(
          { module: 'VOICE_AI', text: messageResult.reply },
          { actorId: actor.id, ipAddress: ctx.ipAddress, requestId: ctx.requestId },
        );
        if (tts.audioBuffer.length > 0) {
          audioBase64 = tts.audioBuffer.toString('base64');
        }
      }

      return {
        sessionId,
        status: 'received',
        transcript,
        sttEnabled: speechToTextService.isAvailable(),
        ttsEnabled: textToSpeechService.isAvailable(),
        message: messageResult.reply,
        audioBase64,
      };
    }

    return {
      sessionId,
      status: 'received',
      transcript: null,
      sttEnabled: speechToTextService.isAvailable(),
      message: speechToTextService.isAvailable()
        ? 'Audio received but transcription was empty. Please retry or send transcript.'
        : 'Audio received. Send transcript in the request body or configure OPENAI_API_KEY for server-side STT.',
    };
  },

  async sendMessage(
    sessionId: string,
    actor: AuthenticatedUser,
    input: VoiceMessageInput,
    ctx: RequestContext,
  ): Promise<VoiceMessageResult> {
    const session = await this.getSession(sessionId, actor.id);
    if (session.status !== 'active') {
      throw new AppError(400, 'VOICE_SESSION_ENDED', 'Voice session is no longer active');
    }

    const language = input.language ?? session.language;

    await voiceSessionRepository.appendMessage(sessionId, actor.id, 'user', input.text, ctx);

    const chatResult = await aiAdvisorService.chat(
      actor,
      {
        message: input.text,
        conversationId: session.conversationId,
        language,
        customerId: input.customerId ?? session.customerId,
        leadId: session.leadId,
        applicationId: session.applicationId,
      },
      ctx,
    );

    await voiceSessionRepository.appendMessage(
      sessionId,
      actor.id,
      'assistant',
      chatResult.message.content,
      ctx,
    );

    await authAuditRepository.log({
      userId: actor.id,
      action: 'VOICE_MESSAGE',
      entityType: VOICE_AUDIT_ENTITY,
      entityId: sessionId,
      newValues: {
        conversationId: chatResult.conversationId,
        intent: chatResult.intent,
        provider: chatResult.provider,
        channel: 'voice',
      } as never,
      ipAddress: ctx.ipAddress,
      userAgent: ctx.userAgent,
      requestId: ctx.requestId,
    });

    return {
      sessionId,
      conversationId: chatResult.conversationId,
      reply: chatResult.message.content,
      intent: chatResult.intent,
      language,
      speak: true,
      provider: chatResult.provider,
    };
  },
};
