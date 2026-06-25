import compression from 'compression';
import cors from 'cors';
import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';

import { env, isCorsOriginAllowed } from './config/env.js';
import { metricsMiddleware } from './modules/monitoring/monitoring.module.js';
import { metricsRegistryService } from './modules/monitoring/services/metrics-registry.service.js';
import { monitoringHealthService } from './modules/monitoring/services/monitoring-health.service.js';
import { apiRouter } from './routes/index.js';
import { correlationMiddleware } from './shared/middleware/correlation.middleware.js';
import { errorHandlerMiddleware } from './shared/middleware/error-handler.middleware.js';
import { loggingMiddleware } from './shared/middleware/logging.middleware.js';
import { traceMiddleware } from './shared/middleware/trace.middleware.js';

export function createApp(): express.Application {
  const app = express();

  app.set('trust proxy', 1);
  app.disable('x-powered-by');

  app.use(
    helmet({
      contentSecurityPolicy: env.APP_ENV === 'production' ? undefined : false,
      crossOriginEmbedderPolicy: false,
      hsts: env.APP_ENV === 'production' ? { maxAge: 31_536_000, includeSubDomains: true, preload: true } : false,
    }),
  );
  app.use(
    cors({
      origin: (origin, callback) => {
        if (isCorsOriginAllowed(origin)) {
          callback(null, origin ?? true);
          return;
        }
        callback(null, false);
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: [
        'Content-Type',
        'Authorization',
        'X-Request-Id',
        'X-Correlation-Id',
        'X-Trace-Id',
        'X-Session-Id',
        'X-Workflow-Id',
        'X-Device-Id',
        'traceparent',
        'tracestate',
      ],
      optionsSuccessStatus: 204,
      maxAge: 86_400,
      preflightContinue: false,
    }),
  );
  app.use(compression());
  app.use(correlationMiddleware);
  app.use(metricsMiddleware);
  app.use(loggingMiddleware);
  app.use(traceMiddleware);

  if (process.env.NODE_ENV !== 'test') {
    // structured logging via loggingMiddleware (Pino); Morgan removed
  }

  app.use(
    rateLimit({
      windowMs: env.RATE_LIMIT_WINDOW_MS,
      max: env.RATE_LIMIT_MAX_REQUESTS,
      standardHeaders: true,
      legacyHeaders: false,
      skip: (req) =>
        req.method === 'OPTIONS' ||
        req.path === '/health' ||
        req.path.startsWith('/health/') ||
        req.path === '/metrics' ||
        process.env.NODE_ENV === 'test' ||
        env.APP_ENV === 'testing' ||
        env.APP_ENV === 'development',
    }),
  );

  app.set('json replacer', (_key: string, value: unknown) =>
    typeof value === 'bigint' ? value.toString() : value,
  );

  app.use(express.json({ limit: '15mb' }));
  app.use(express.urlencoded({ extended: true, limit: '15mb' }));

  app.get('/health', (_req, res) => {
    const live = monitoringHealthService.liveness();
    res.json({
      success: true,
      data: {
        service: 'kuberone-api',
        version: env.API_VERSION,
        environment: env.APP_ENV,
        uptimeSeconds: live.uptimeSeconds,
        timestamp: live.timestamp,
      },
    });
  });

  app.get('/health/live', (_req, res) => {
    res.json({ success: true, data: monitoringHealthService.liveness() });
  });

  app.get('/health/ready', async (_req, res) => {
    const result = await monitoringHealthService.readiness();
    res.status(result.status === 'ok' ? 200 : 503).json({ success: result.status === 'ok', data: result });
  });

  app.get('/deep-health', async (_req, res) => {
    const result = await monitoringHealthService.deepHealth();
    res.status(result.status === 'ok' ? 200 : 503).json({ success: result.status === 'ok', data: result });
  });

  app.get('/metrics', async (_req, res) => {
    res.set('Content-Type', metricsRegistryService.getContentType());
    res.send(await metricsRegistryService.getMetrics());
  });

  app.use(`/api/${env.API_VERSION}`, apiRouter);

  app.use((_req, res) => {
    res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Route not found' },
    });
  });

  app.use(errorHandlerMiddleware);

  return app;
}
