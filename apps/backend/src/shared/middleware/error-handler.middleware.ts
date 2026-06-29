import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';

import { errorCaptureService } from '../../modules/errors/services/error-capture.service.js';
import { centralAuditService } from '../../modules/governance/services/central-audit.service.js';
import { AppError, ForbiddenError, ServiceUnavailableError } from '../errors/app-error.js';
import { appLogger } from '../observability/logger.js';
import { observabilityContext } from '../observability/observability-context.js';

function isPrismaConnectionError(err: Error): boolean {
  const name = err.constructor.name;
  if (name === 'PrismaClientInitializationError') return true;
  if (name === 'PrismaClientKnownRequestError' && 'code' in err) {
    return ['P1001', 'P1000', 'P1017'].includes(String((err as { code: string }).code));
  }
  return false;
}

function trackError(req: Request, err: Error, input: {
  source?: string;
  category?: string;
  errorCode?: string;
  statusCode?: number;
  module?: string;
}) {
  const ctx = observabilityContext.get();
  void errorCaptureService.capture({
    source: input.source ?? 'BACKEND',
    category: input.category ?? 'UNHANDLED_EXCEPTION',
    errorCode: input.errorCode,
    errorType: err.constructor.name,
    message: err.message,
    stackTrace: err.stack,
    requestId: ctx?.requestId ?? req.requestId,
    correlationId: ctx?.correlationId ?? req.correlationId,
    traceId: ctx?.traceId ?? req.traceId,
    sessionId: ctx?.sessionId ?? req.sessionId,
    userId: req.user?.id,
    userRole: req.user?.roles?.[0],
    path: req.path,
    method: req.method,
    statusCode: input.statusCode,
    ipAddress: req.ip,
    userAgent: req.get('user-agent') ?? undefined,
    module: input.module ?? 'http',
  });
}

function isPayloadTooLargeError(err: Error): boolean {
  return 'type' in err && (err as { type?: string }).type === 'entity.too.large';
}

export function errorHandlerMiddleware(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction,
): void {
  const requestId = req.requestId;

  if (isPayloadTooLargeError(err)) {
    res.status(413).json({
      success: false,
      error: {
        code: 'PAYLOAD_TOO_LARGE',
        message: 'Request body is too large. Maximum upload size is 10MB per document.',
      },
      requestId,
    });
    return;
  }

  if (err instanceof ForbiddenError) {
    void centralAuditService.logSecurityEvent({
      eventType: 'PERMISSION_ESCALATION',
      severity: 'MEDIUM',
      userId: req.user?.id,
      ipAddress: req.ip,
      userAgent: req.get('user-agent') ?? undefined,
      description: err.message,
      metadata: { path: req.path, method: req.method },
      createAlert: false,
    });
    trackError(req, err, { category: 'AUTHORIZATION', errorCode: 'FORBIDDEN', statusCode: 403 });
  }

  if (err instanceof AppError) {
    if (err.statusCode >= 500) {
      appLogger.error(err.message, err, { module: 'http', action: `${req.method} ${req.path}`, category: 'APPLICATION' });
      trackError(req, err, { errorCode: err.code, statusCode: err.statusCode });
    }
    res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        ...(err.details ? { details: err.details } : {}),
      },
      requestId,
    });
    return;
  }

  if (err instanceof ZodError) {
    appLogger.warn('Validation failed', { module: 'http', action: `${req.method} ${req.path}`, category: 'APPLICATION', statusCode: 422 });
    trackError(req, err, { category: 'VALIDATION', errorCode: 'VALIDATION_ERROR', statusCode: 422 });
    res.status(422).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        details: err.flatten().fieldErrors as Record<string, string[]>,
      },
      requestId,
    });
    return;
  }

  if (isPrismaConnectionError(err)) {
    const dbError = new ServiceUnavailableError(
      'Database is unavailable. Start MySQL on port 3306 or run: docker compose -f docker/docker-compose.dev.yml up -d',
    );
    appLogger.error('Database unavailable', err, { module: 'database', category: 'DATABASE' });
    trackError(req, err, {
      source: 'DATABASE',
      category: 'CONNECTION_FAILURE',
      errorCode: 'code' in err ? String((err as { code: string }).code) : 'DB_INIT',
      statusCode: dbError.statusCode,
      module: 'database',
    });
    res.status(dbError.statusCode).json({
      success: false,
      error: { code: dbError.code, message: dbError.message },
      requestId,
    });
    return;
  }

  const statusCode = 'statusCode' in err ? Number((err as { statusCode?: number }).statusCode) : undefined;
  if (statusCode && statusCode >= 400 && statusCode < 600) {
    res.status(statusCode).json({
      success: false,
      error: {
        code: statusCode === 404 ? 'NOT_FOUND' : 'REQUEST_ERROR',
        message: err.message,
      },
      requestId,
    });
    return;
  }

  appLogger.error('Unhandled error', err, { module: 'http', action: `${req.method} ${req.path}`, category: 'SYSTEM' });
  trackError(req, err, { errorCode: 'INTERNAL_ERROR', statusCode: 500 });

  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
    },
    requestId,
  });
}
