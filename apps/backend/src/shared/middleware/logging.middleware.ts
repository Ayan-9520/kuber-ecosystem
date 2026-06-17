import type { NextFunction, Request, Response } from 'express';

import { observabilityLogService } from '../../modules/observability/services/observability-log.service.js';
import { appLogger } from '../observability/logger.js';
import { observabilityContext } from '../observability/observability-context.js';

function normalizeRoute(path: string): string {
  return path
    .replace(/\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi, '/:id')
    .replace(/\/\d+/g, '/:id');
}

function shouldSample(): boolean {
  const rate = Number(process.env.LOG_SAMPLE_RATE ?? (process.env.NODE_ENV === 'production' ? '0.25' : '1'));
  return Math.random() < rate;
}

export function loggingMiddleware(req: Request, res: Response, next: NextFunction): void {
  const start = Date.now();

  res.on('finish', () => {
    const durationMs = Date.now() - start;
    const route = normalizeRoute(req.route?.path ? `${req.baseUrl}${req.route.path}` : req.path);
    const ctx = observabilityContext.get();
    const userId = req.user?.id;
    const userRole = req.user?.roles?.[0];

    if (userId || userRole) {
      observabilityContext.patch({ userId, userRole });
    }

    const fields = {
      module: 'http',
      action: `${req.method} ${route}`,
      category: 'APPLICATION',
      durationMs,
      statusCode: res.statusCode,
      userId,
      userRole,
    };

    if (res.statusCode >= 500) {
      appLogger.error('HTTP request failed', undefined, fields);
    } else if (res.statusCode >= 400) {
      appLogger.warn('HTTP request client error', fields);
    } else {
      appLogger.info('HTTP request completed', fields);
    }

    if (shouldSample() && !req.path.startsWith('/health') && req.path !== '/metrics') {
      void observabilityLogService.persist({
        level: res.statusCode >= 500 ? 'ERROR' : res.statusCode >= 400 ? 'WARN' : 'INFO',
        category: 'APPLICATION',
        module: 'http',
        action: `${req.method} ${route}`,
        message: `${req.method} ${route} ${res.statusCode}`,
        requestId: ctx?.requestId ?? req.requestId,
        correlationId: ctx?.correlationId ?? req.correlationId,
        traceId: ctx?.traceId ?? req.traceId,
        sessionId: ctx?.sessionId ?? req.sessionId,
        userId,
        userRole,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        device: req.headers['x-device-id'] as string | undefined,
        durationMs,
        statusCode: res.statusCode,
        metadata: { method: req.method, path: route },
      });
    }
  });

  next();
}
