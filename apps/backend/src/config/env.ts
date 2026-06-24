import { resolve } from 'node:path';

import {
  awsEnvSchema,
  baseEnvSchema,
  databaseEnvSchema,
  jwtEnvSchema,
  loadEnv,
  communicationEnvSchema,
  redisEnvSchema,
  openaiEnvSchema,
  ragEnvSchema,
} from '@kuberone/shared-config';
import { config } from 'dotenv';
import { z } from 'zod';

config({ path: resolve(process.cwd(), '.env'), override: false });

const backendEnvSchema = baseEnvSchema
  .merge(databaseEnvSchema)
  .merge(jwtEnvSchema)
  .merge(awsEnvSchema)
  .merge(openaiEnvSchema)
  .merge(ragEnvSchema)
  .merge(communicationEnvSchema)
  .merge(redisEnvSchema)
  .extend({
    API_PORT: z.coerce.number().default(4000),
    API_BASE_URL: z.string().url().default('http://localhost:4000'),
    API_VERSION: z.string().default('v1'),
    CORS_ORIGINS: z.string().default('http://localhost:5173'),
    DATA_ENCRYPTION_KEY: z.string().min(32).optional(),
    OTP_RATE_LIMIT_PER_PHONE: z.coerce.number().default(10),
    RATE_LIMIT_WINDOW_MS: z.coerce.number().default(900_000),
    RATE_LIMIT_MAX_REQUESTS: z.coerce.number().default(100),
    AUTH_RATE_LIMIT_WINDOW_MS: z.coerce.number().default(900_000),
    AUTH_RATE_LIMIT_MAX_REQUESTS: z.coerce.number().default(20),
    OTP_EXPIRY_SECONDS: z.coerce.number().default(300),
    OTP_MAX_ATTEMPTS: z.coerce.number().default(5),
    OTP_RESEND_COOLDOWN_SECONDS: z.coerce.number().default(60),
    MAX_FAILED_LOGIN_ATTEMPTS: z.coerce.number().default(5),
    ACCOUNT_LOCK_MINUTES: z.coerce.number().default(30),
    REFRESH_TOKEN_EXPIRY_DAYS: z.coerce.number().default(7),
    AUTOMATION_WORKER_ENABLED: z.coerce.boolean().default(true),
    AUTOMATION_WORKER_INTERVAL_MS: z.coerce.number().default(10_000),
    AUTOMATION_WORKER_BATCH_SIZE: z.coerce.number().default(25),
    AUTOMATION_MAX_RETRIES: z.coerce.number().default(3),
    CONTENT_WORKER_ENABLED: z.coerce.boolean().default(true),
    CONTENT_WORKER_INTERVAL_MS: z.coerce.number().default(10_000),
    CONTENT_WORKER_BATCH_SIZE: z.coerce.number().default(20),
    API_WORKERS_ENABLED: z.coerce.boolean().default(true),
    LEAD_EXPORT_MAX_ROWS: z.coerce.number().default(5000),
    DEVOPS_WEBHOOK_SECRET: z.string().min(16).optional(),
    STAGING_WEBHOOK_SECRET: z.string().min(16).optional(),
    PRODUCTION_WEBHOOK_SECRET: z.string().min(16).optional(),
    MOBILE_WEBHOOK_SECRET: z.string().min(16).optional(),
    PLAY_STORE_WEBHOOK_SECRET: z.string().min(16).optional(),
    APP_STORE_WEBHOOK_SECRET: z.string().min(16).optional(),
    BACKEND_DEPLOYMENT_WEBHOOK_SECRET: z.string().min(16).optional(),
    DR_WEBHOOK_SECRET: z.string().min(16).optional(),
    /** staged = deploy with MySQL + OpenAI only; full = all providers required */
    DEPLOYMENT_ROLLOUT_PHASE: z.enum(['staged', 'full']).default('staged'),
  });

export type BackendEnv = z.infer<typeof backendEnvSchema>;

const parsed = loadEnv(
  backendEnvSchema.superRefine((data, ctx) => {
    if ((data.APP_ENV === 'production' || data.NODE_ENV === 'production') && !data.DATA_ENCRYPTION_KEY) {
      ctx.addIssue({
        code: 'custom',
        message: 'DATA_ENCRYPTION_KEY is required in production',
        path: ['DATA_ENCRYPTION_KEY'],
      });
    }
  }),
);

export const env: BackendEnv = parsed;

export function getCorsOrigins(): string[] {
  return env.CORS_ORIGINS.split(',').map((origin) => origin.trim());
}

const LOCALHOST_ORIGIN = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;
const PRIVATE_LAN_ORIGIN = /^https?:\/\/(192\.168\.\d{1,3}\.\d{1,3}|10\.\d{1,3}\.\d{1,3}\.\d{1,3})(:\d+)?$/;
const VERCEL_ORIGIN = /^https:\/\/[\w-]+(-[\w-]+)*\.vercel\.app$/;

/** In development, allow localhost and LAN IPs (Expo web / admin on same WiFi). */
export function isCorsOriginAllowed(origin: string | undefined): boolean {
  if (!origin) return true;
  if (env.APP_ENV === 'development' && LOCALHOST_ORIGIN.test(origin)) return true;
  if (env.APP_ENV === 'development' && PRIVATE_LAN_ORIGIN.test(origin)) return true;
  if (VERCEL_ORIGIN.test(origin)) return true;
  return getCorsOrigins().includes(origin);
}
