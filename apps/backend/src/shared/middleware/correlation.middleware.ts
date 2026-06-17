import { randomUUID } from 'node:crypto';

import type { NextFunction, Request, Response } from 'express';

import { observabilityContext } from '../observability/observability-context.js';

export function correlationMiddleware(req: Request, res: Response, next: NextFunction): void {
  const requestId = (req.headers['x-request-id'] as string) || randomUUID();
  const correlationId = (req.headers['x-correlation-id'] as string) || requestId;
  const traceId = (req.headers['traceparent'] as string)?.split('-')[1]
    ?? (req.headers['x-trace-id'] as string)
    ?? randomUUID().replace(/-/g, '');
  const sessionId = (req.headers['x-session-id'] as string) || req.sessionId;
  const workflowId = req.headers['x-workflow-id'] as string | undefined;

  req.requestId = requestId;
  req.correlationId = correlationId;
  req.traceId = traceId;
  if (sessionId) req.sessionId = sessionId;

  res.setHeader('X-Request-Id', requestId);
  res.setHeader('X-Correlation-Id', correlationId);
  res.setHeader('X-Trace-Id', traceId);

  const ctx = observabilityContext.getOrCreate({
    requestId,
    correlationId,
    traceId,
    sessionId,
    workflowId,
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
    device: req.headers['x-device-id'] as string | undefined,
  });

  observabilityContext.run(ctx, () => next());
}
