import { createHash } from 'node:crypto';

import { env } from '../../../config/env.js';
import { maskPii } from '../../../shared/observability/pii-mask.js';
import { observabilityErrorService } from '../../observability/services/observability-error.service.js';
import { errorTrackingRepository } from '../repositories/error-tracking.repository.js';

import { errorAlertService } from './error-alert.service.js';

export type CaptureErrorInput = {
  source?: string;
  category?: string;
  errorCode?: string;
  errorType: string;
  message: string;
  stackTrace?: string;
  requestId?: string;
  correlationId?: string;
  traceId?: string;
  sessionId?: string;
  workflowId?: string;
  userId?: string;
  userRole?: string;
  path?: string;
  method?: string;
  statusCode?: number;
  ipAddress?: string;
  userAgent?: string;
  device?: string;
  browser?: string;
  appVersion?: string;
  osVersion?: string;
  region?: string;
  branch?: string;
  module?: string;
  requestPayload?: Record<string, unknown>;
  responsePayload?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
};

function stackSignature(stack?: string): string {
  if (!stack) return '';
  return stack.split('\n').slice(0, 5).join('\n').replace(/\d+/g, 'N');
}

function buildFingerprint(input: CaptureErrorInput): string {
  const normalized = [
    input.source ?? 'BACKEND',
    input.errorType,
    input.message.slice(0, 200),
    stackSignature(input.stackTrace),
    input.path ?? '',
  ].join('|');
  return createHash('sha256').update(normalized).digest('hex').slice(0, 64);
}

function inferPriority(input: CaptureErrorInput): 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' {
  if (input.statusCode && input.statusCode >= 500) return 'CRITICAL';
  if (input.source === 'DATABASE' || input.category === 'CONNECTION_FAILURE') return 'CRITICAL';
  if (input.source === 'AI' || input.source === 'OPENAI' || input.source === 'RAG') return 'HIGH';
  if (input.source === 'NOTIFICATION') return 'HIGH';
  if (input.category === 'AUTHENTICATION' || input.category === 'AUTHORIZATION') return 'HIGH';
  if (input.statusCode && input.statusCode >= 400) return 'MEDIUM';
  return 'MEDIUM';
}

function mapObservabilitySource(source?: string): string {
  const map: Record<string, string> = {
    BACKEND: 'BACKEND', CRM: 'FRONTEND', CUSTOMER_APP: 'MOBILE', DSA_APP: 'MOBILE',
    AI: 'AI', OPENAI: 'AI', RAG: 'AI', VOICE_AI: 'AI', NOTIFICATION: 'NOTIFICATION', DATABASE: 'DATABASE',
  };
  return map[source ?? 'BACKEND'] ?? 'BACKEND';
}

export const errorCaptureService = {
  async capture(input: CaptureErrorInput) {
    const fingerprint = buildFingerprint(input);
    const priority = inferPriority(input);
    const now = new Date();
    const maskedMessage = maskPii(input.message) as string;
    const maskedStack = input.stackTrace ? (maskPii(input.stackTrace) as string) : undefined;

    let group = await errorTrackingRepository.group.findByFingerprint(fingerprint);
    const isNewGroup = !group;

    if (group) {
      group = await errorTrackingRepository.group.update(group.id, {
        occurrenceCount: { increment: 1 },
        lastSeenAt: now,
        ...(input.userId ? { affectedUserCount: { increment: 1 } } : {}),
        ...(priority === 'CRITICAL' && group.priority !== 'CRITICAL' ? { priority: 'CRITICAL' } : {}),
      });
    } else {
      group = await errorTrackingRepository.group.create({
        fingerprint,
        title: maskedMessage.slice(0, 200),
        message: maskedMessage,
        source: (input.source ?? 'BACKEND') as never,
        category: (input.category ?? 'UNHANDLED_EXCEPTION') as never,
        priority: priority as never,
        status: 'NEW',
        module: input.module,
        environment: env.APP_ENV,
        stackSignature: stackSignature(maskedStack),
        occurrenceCount: 1,
        affectedUserCount: input.userId ? 1 : 0,
        firstSeenAt: now,
        lastSeenAt: now,
        traceIdSample: input.traceId,
        metadata: maskPii(input.metadata ?? {}) as never,
      });
    }

    const event = await errorTrackingRepository.event.create({
      group: { connect: { id: group.id } },
      source: (input.source ?? 'BACKEND') as never,
      category: (input.category ?? 'UNHANDLED_EXCEPTION') as never,
      errorCode: input.errorCode,
      errorType: input.errorType,
      message: maskedMessage,
      stackTrace: maskedStack,
      requestId: input.requestId,
      correlationId: input.correlationId,
      traceId: input.traceId,
      sessionId: input.sessionId,
      workflowId: input.workflowId,
      user: input.userId ? { connect: { id: input.userId } } : undefined,
      userRole: input.userRole,
      path: input.path,
      method: input.method,
      statusCode: input.statusCode,
      ipAddress: input.ipAddress,
      userAgent: input.userAgent,
      device: input.device,
      browser: input.browser,
      appVersion: input.appVersion,
      osVersion: input.osVersion,
      region: input.region,
      branch: input.branch,
      environment: env.APP_ENV,
      requestPayload: maskPii(input.requestPayload ?? {}) as never,
      responsePayload: maskPii(input.responsePayload ?? {}) as never,
      metadata: maskPii(input.metadata ?? {}) as never,
    });

    await errorTrackingRepository.occurrence.create({
      group: { connect: { id: group.id } },
      event: { connect: { id: event.id } },
      fingerprint,
    });

    void observabilityErrorService.record({
      source: mapObservabilitySource(input.source),
      errorCode: input.errorCode,
      errorType: input.errorType,
      message: maskedMessage,
      stackTrace: maskedStack,
      requestId: input.requestId,
      correlationId: input.correlationId,
      traceId: input.traceId,
      userId: input.userId,
      module: input.module,
      path: input.path,
      method: input.method,
      statusCode: input.statusCode,
      metadata: { errorGroupId: group.id, fingerprint },
    });

    void errorAlertService.evaluateOnCapture(group.id, {
      source: input.source ?? 'BACKEND',
      priority,
      occurrenceCount: group.occurrenceCount,
      message: maskedMessage,
    });

    return { eventId: event.id, groupId: group.id, fingerprint, priority, isNewGroup };
  },
};
