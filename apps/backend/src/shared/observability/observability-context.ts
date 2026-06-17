import { AsyncLocalStorage } from 'node:async_hooks';
import { randomUUID } from 'node:crypto';

import { env } from '../../config/env.js';

export interface ObservabilityContext {
  requestId: string;
  correlationId: string;
  traceId: string;
  sessionId?: string;
  workflowId?: string;
  userId?: string;
  userRole?: string;
  ipAddress?: string;
  userAgent?: string;
  device?: string;
  environment: string;
  module?: string;
}

const storage = new AsyncLocalStorage<ObservabilityContext>();

export const observabilityContext = {
  run<T>(ctx: ObservabilityContext, fn: () => T): T {
    return storage.run(ctx, fn);
  },

  get(): ObservabilityContext | undefined {
    return storage.getStore();
  },

  getOrCreate(partial?: Partial<ObservabilityContext>): ObservabilityContext {
    const existing = storage.getStore();
    if (existing) return existing;
    return {
      requestId: partial?.requestId ?? randomUUID(),
      correlationId: partial?.correlationId ?? partial?.requestId ?? randomUUID(),
      traceId: partial?.traceId ?? randomUUID(),
      sessionId: partial?.sessionId,
      workflowId: partial?.workflowId,
      userId: partial?.userId,
      userRole: partial?.userRole,
      ipAddress: partial?.ipAddress,
      userAgent: partial?.userAgent,
      device: partial?.device,
      environment: partial?.environment ?? env.APP_ENV,
      module: partial?.module,
    };
  },

  patch(partial: Partial<ObservabilityContext>): void {
    const current = storage.getStore();
    if (current) Object.assign(current, partial);
  },
};
