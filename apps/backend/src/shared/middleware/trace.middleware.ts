import type { NextFunction, Request, Response } from 'express';

import { observabilityTraceService } from '../../modules/observability/services/observability-trace.service.js';
import { observabilityContext } from '../observability/observability-context.js';
import { shouldSampleTrace } from '../observability/otel.js';

export function traceMiddleware(req: Request, res: Response, next: NextFunction): void {
  const start = Date.now();
  const ctx = observabilityContext.get();

  res.on('finish', () => {
    if (!ctx?.traceId || req.path.startsWith('/health') || req.path === '/metrics') return;
    if (!shouldSampleTrace()) return;

    void observabilityTraceService.record({
      traceId: ctx.traceId,
      correlationId: ctx.correlationId,
      requestId: ctx.requestId,
      operation: `${req.method} ${req.path}`,
      status: res.statusCode >= 500 ? 'ERROR' : 'OK',
      durationMs: Date.now() - start,
      userId: req.user?.id,
      startedAt: new Date(start),
      endedAt: new Date(),
      metadata: { statusCode: res.statusCode, method: req.method, path: req.path },
    });
  });

  next();
}
