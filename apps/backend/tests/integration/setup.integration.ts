import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { jest } from '@jest/globals';

import { initFlowCoverage } from './helpers/flow-coverage.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const artifactsDir = path.join(__dirname, '.artifacts');
const envFile = path.join(artifactsDir, 'test-env.json');

Object.assign(globalThis, { jest });

function applyIntegrationEnv(): void {
  if (!existsSync(envFile)) {
    throw new Error('Integration test env file missing. Run global-setup first.');
  }

  const parsed = JSON.parse(readFileSync(envFile, 'utf8')) as {
    databaseUrl: string;
    testEnv?: Record<string, string>;
  };

  const limitedUrl = parsed.databaseUrl.includes('connection_limit=')
    ? parsed.databaseUrl
    : `${parsed.databaseUrl}${parsed.databaseUrl.includes('?') ? '&' : '?'}connection_limit=10&pool_timeout=20`;
  process.env.DATABASE_URL = limitedUrl;
  process.env.DATABASE_CONNECTION_LIMIT = '10';
  process.env.NODE_ENV = 'test';
  process.env.APP_ENV = 'testing';
  process.env.API_WORKERS_ENABLED = 'false';
  process.env.JWT_ACCESS_SECRET =
    process.env.JWT_ACCESS_SECRET ?? 'integration-access-secret-minimum-32-characters';
  process.env.JWT_REFRESH_SECRET =
    process.env.JWT_REFRESH_SECRET ?? 'integration-refresh-secret-minimum-32-characters';
  process.env.EMAIL_PROVIDER = 'mock';
  process.env.SMS_PROVIDER = 'mock';
  process.env.PUSH_PROVIDER = 'mock';
  process.env.OPENAI_API_KEY = 'sk-integration-test-key';
  process.env.EMBEDDING_PROVIDER = 'local_hash';
  process.env.VECTOR_DB_PROVIDER = 'local';
  process.env.DATA_ENCRYPTION_KEY =
    process.env.DATA_ENCRYPTION_KEY ?? 'integration-data-encryption-key-32chars';
  process.env.AWS_S3_BUCKET = 'kuberone-integration-test';
  process.env.AUTH_RATE_LIMIT_MAX_REQUESTS = '10000';
  process.env.OTP_RATE_LIMIT_PER_PHONE = '1000';
  process.env.SMS_OTP_RATE_LIMIT_PER_PHONE = '1000';
  process.env.OTP_RESEND_COOLDOWN_SECONDS = '0';
}

applyIntegrationEnv();
initFlowCoverage();
