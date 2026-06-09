import compression from 'compression';
import cors from 'cors';
import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import morgan from 'morgan';

import { env, getCorsOrigins } from './config/env.js';
import { apiRouter } from './routes/index.js';
import { errorHandlerMiddleware } from './shared/middleware/error-handler.middleware.js';
import { requestIdMiddleware } from './shared/middleware/request-id.middleware.js';

export function createApp(): express.Application {
  const app = express();

  app.set('trust proxy', 1);
  app.use(helmet());
  app.use(
    cors({
      origin: getCorsOrigins(),
      credentials: true,
    }),
  );
  app.use(compression());
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(requestIdMiddleware);

  if (process.env.NODE_ENV !== 'test') {
    app.use(morgan('combined'));
  }

  app.use(
    rateLimit({
      windowMs: env.RATE_LIMIT_WINDOW_MS,
      max: env.RATE_LIMIT_MAX_REQUESTS,
      standardHeaders: true,
      legacyHeaders: false,
    }),
  );

  app.get('/health', (_req, res) => {
    res.json({
      success: true,
      data: {
        service: 'kuberone-api',
        version: env.API_VERSION,
        environment: env.APP_ENV,
        timestamp: new Date().toISOString(),
      },
    });
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
