import { env } from '../../../config/env.js';
import { maskPii } from '../../../shared/observability/pii-mask.js';
import { observabilityRepository } from '../repositories/observability.repository.js';

export type PersistLogInput = {
  level: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR' | 'FATAL';
  category: string;
  module: string;
  action: string;
  message: string;
  requestId?: string;
  correlationId?: string;
  traceId?: string;
  sessionId?: string;
  workflowId?: string;
  userId?: string;
  userRole?: string;
  ipAddress?: string;
  userAgent?: string;
  device?: string;
  durationMs?: number;
  statusCode?: number;
  metadata?: Record<string, unknown>;
};

const logQueue: PersistLogInput[] = [];
let flushTimer: ReturnType<typeof setInterval> | null = null;

async function flushQueue() {
  if (logQueue.length === 0) return;
  const batch = logQueue.splice(0, 100);
  try {
    await observabilityRepository.log.createMany(
      batch.map((item) => ({
        level: item.level as never,
        category: item.category as never,
        module: item.module,
        action: item.action,
        message: item.message,
        requestId: item.requestId,
        correlationId: item.correlationId,
        traceId: item.traceId,
        sessionId: item.sessionId,
        workflowId: item.workflowId,
        userId: item.userId,
        userRole: item.userRole,
        ipAddress: item.ipAddress,
        userAgent: item.userAgent,
        device: item.device,
        environment: env.APP_ENV,
        durationMs: item.durationMs,
        statusCode: item.statusCode,
        metadata: maskPii(item.metadata ?? {}) as never,
      })),
    );
  } catch {
    // async logging must not block requests
  }
}

function ensureFlushTimer() {
  if (!flushTimer) {
    flushTimer = setInterval(() => void flushQueue(), 2000);
    flushTimer.unref?.();
  }
}

export const observabilityLogService = {
  async persist(input: PersistLogInput) {
    if (process.env.NODE_ENV === 'test') return;
    logQueue.push(input);
    ensureFlushTimer();
    if (logQueue.length >= 50) await flushQueue();
  },

  async flush() {
    await flushQueue();
  },
};
