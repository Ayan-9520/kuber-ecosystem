import pino from 'pino';

import { env } from '../../config/env.js';

import { observabilityContext } from './observability-context.js';
import { maskPii } from './pii-mask.js';

const isDev = env.APP_ENV === 'development' || env.APP_ENV === 'testing';

export const logger = pino({
  level: process.env.LOG_LEVEL ?? (isDev ? 'debug' : 'info'),
  base: { service: 'kuberone-api', environment: env.APP_ENV },
  timestamp: pino.stdTimeFunctions.isoTime,
  formatters: {
    level(label) {
      return { level: label };
    },
  },
});

export type LogFields = {
  module?: string;
  action?: string;
  category?: string;
  userId?: string;
  userRole?: string;
  durationMs?: number;
  statusCode?: number;
  metadata?: Record<string, unknown>;
};

function withContext(fields: LogFields = {}) {
  const ctx = observabilityContext.get();
  return maskPii({
    requestId: ctx?.requestId,
    correlationId: ctx?.correlationId,
    traceId: ctx?.traceId,
    sessionId: ctx?.sessionId,
    workflowId: ctx?.workflowId,
    userId: fields.userId ?? ctx?.userId,
    userRole: fields.userRole ?? ctx?.userRole,
    ipAddress: ctx?.ipAddress,
    device: ctx?.device,
    environment: ctx?.environment ?? env.APP_ENV,
    module: fields.module ?? ctx?.module,
    action: fields.action,
    category: fields.category,
    durationMs: fields.durationMs,
    statusCode: fields.statusCode,
    ...fields.metadata,
  });
}

export const appLogger = {
  debug(msg: string, fields?: LogFields) {
    logger.debug(withContext(fields), msg);
  },
  info(msg: string, fields?: LogFields) {
    logger.info(withContext(fields), msg);
  },
  warn(msg: string, fields?: LogFields) {
    logger.warn(withContext(fields), msg);
  },
  error(msg: string, err?: unknown, fields?: LogFields) {
    logger.error({ ...withContext(fields), err: err instanceof Error ? { message: err.message, stack: err.stack } : err }, msg);
  },
  fatal(msg: string, err?: unknown, fields?: LogFields) {
    logger.fatal({ ...withContext(fields), err: err instanceof Error ? { message: err.message, stack: err.stack } : err }, msg);
  },
};
