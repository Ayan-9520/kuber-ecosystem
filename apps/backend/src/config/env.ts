import { resolve } from 'node:path';

import {
  awsEnvSchema,
  baseEnvSchema,
  databaseEnvSchema,
  jwtEnvSchema,
  loadEnv,
  communicationEnvSchema,
  openaiEnvSchema,
  ragEnvSchema,
} from '@kuberone/shared-config';
import { config } from 'dotenv';
import { z } from 'zod';

config({ path: resolve(process.cwd(), '.env'), override: true });

const backendEnvSchema = baseEnvSchema
  .merge(databaseEnvSchema)
  .merge(jwtEnvSchema)
  .merge(awsEnvSchema)
  .merge(openaiEnvSchema)
  .merge(ragEnvSchema)
  .merge(communicationEnvSchema)
  .extend({
    API_PORT: z.coerce.number().default(4000),
    API_BASE_URL: z.string().url().default('http://localhost:4000'),
    API_VERSION: z.string().default('v1'),
    CORS_ORIGINS: z.string().default('http://localhost:5173'),
    DATA_ENCRYPTION_KEY: z.string().min(32).optional(),
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
  });

export type BackendEnv = z.infer<typeof backendEnvSchema>;

export const env: BackendEnv = loadEnv(backendEnvSchema);

export function getCorsOrigins(): string[] {
  return env.CORS_ORIGINS.split(',').map((origin) => origin.trim());
}
