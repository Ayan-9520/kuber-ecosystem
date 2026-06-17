import rateLimit from 'express-rate-limit';

import { env } from '../../config/env.js';

export const authRateLimitMiddleware = rateLimit({
  windowMs: env.AUTH_RATE_LIMIT_WINDOW_MS,
  max: env.AUTH_RATE_LIMIT_MAX_REQUESTS,
  skip: () =>
    env.APP_ENV === 'development' || env.APP_ENV === 'testing' || env.NODE_ENV === 'test',
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'TOO_MANY_REQUESTS',
      message: 'Too many authentication attempts. Please try again later.',
    },
  },
});
