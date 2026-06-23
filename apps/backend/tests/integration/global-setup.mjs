import { execSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '../../../..');
const databaseDir = path.join(repoRoot, 'database');
const artifactsDir = path.join(__dirname, '.artifacts');

async function resolveDatabaseUrl() {
  const explicit = process.env.INTEGRATION_DATABASE_URL ?? process.env.DATABASE_URL;
  const useTestcontainers = process.env.USE_TESTCONTAINERS === 'true';

  if (explicit && !useTestcontainers) {
    return { databaseUrl: explicit, useTestcontainers: false };
  }

  if (useTestcontainers || (!process.env.CI && !explicit)) {
    try {
      const { MySqlContainer } = await import('@testcontainers/mysql');
      const container = await new MySqlContainer('mysql:8.0')
        .withDatabase('kuberone_integration')
        .withUsername('root')
        .withRootPassword('integration')
        .start();
      return {
        databaseUrl: container.getConnectionUri(),
        useTestcontainers: true,
        containerId: container.getId(),
      };
    } catch (error) {
      if (explicit) {
        return { databaseUrl: explicit, useTestcontainers: false };
      }
      console.warn('[integration] Testcontainers unavailable, falling back to local MySQL:', error);
    }
  }

  return {
    databaseUrl: explicit ?? 'mysql://root@127.0.0.1:3306/kuberone_integration_test',
    useTestcontainers: false,
  };
}

function withConnectionLimit(databaseUrl) {
  if (databaseUrl.includes('connection_limit=')) return databaseUrl;
  const separator = databaseUrl.includes('?') ? '&' : '?';
  return `${databaseUrl}${separator}connection_limit=10&pool_timeout=20`;
}

function buildTestEnv(databaseUrl) {
  const limitedUrl = withConnectionLimit(databaseUrl);
  return {
    ...process.env,
    DATABASE_URL: limitedUrl,
    DATABASE_CONNECTION_LIMIT: '10',
    NODE_ENV: 'test',
    APP_ENV: 'testing',
    API_WORKERS_ENABLED: 'false',
    JWT_ACCESS_SECRET: 'integration-access-secret-minimum-32-characters',
    JWT_REFRESH_SECRET: 'integration-refresh-secret-minimum-32-characters',
    EMAIL_PROVIDER: 'mock',
    SMS_PROVIDER: 'mock',
    PUSH_PROVIDER: 'mock',
    OPENAI_API_KEY: 'sk-integration-test-key',
    EMBEDDING_PROVIDER: 'local_hash',
    VECTOR_DB_PROVIDER: 'local',
    AWS_S3_BUCKET: 'kuberone-integration-test',
    DATA_ENCRYPTION_KEY: 'integration-data-encryption-key-32chars',
    OTP_RESEND_COOLDOWN_SECONDS: '0',
    SMS_OTP_RATE_LIMIT_PER_PHONE: '1000',
    AUTH_RATE_LIMIT_MAX_REQUESTS: '10000',
  };
}

export default async function globalSetup() {
  mkdirSync(artifactsDir, { recursive: true });
  writeFileSync(path.join(artifactsDir, 'covered-flows.json'), '[]');

  const resolved = await resolveDatabaseUrl();
  const testEnv = buildTestEnv(resolved.databaseUrl);

  writeFileSync(
    path.join(artifactsDir, 'test-env.json'),
    JSON.stringify(
      { ...resolved, databaseUrl: withConnectionLimit(resolved.databaseUrl), testEnv: { DATABASE_URL: withConnectionLimit(resolved.databaseUrl) } },
      null,
      2,
    ),
  );

  if (resolved.containerId) {
    writeFileSync(path.join(artifactsDir, 'container.id'), resolved.containerId);
  }

  if (process.env.SKIP_SCHEMA_PREP === 'true') {
    console.log('[integration] Skipping schema preparation (SKIP_SCHEMA_PREP=true)');
  } else {
  const prepStrategy = process.env.INTEGRATION_DB_PREP ?? 'push';
  if (prepStrategy === 'migrate') {
    console.log('[integration] Applying Prisma migrations...');
    try {
      execSync('pnpm exec prisma migrate deploy --schema=./prisma/schema', {
        cwd: databaseDir,
        env: testEnv,
        stdio: 'inherit',
      });
    } catch (error) {
      console.warn('[integration] migrate deploy failed, falling back to db push:', error.message);
      execSync('pnpm exec prisma db push --accept-data-loss --schema=./prisma/schema', {
        cwd: databaseDir,
        env: testEnv,
        stdio: 'inherit',
      });
    }
  } else {
    console.log('[integration] Preparing integration schema via prisma db push...');
    execSync('pnpm exec prisma db push --accept-data-loss --schema=./prisma/schema', {
      cwd: databaseDir,
      env: testEnv,
      stdio: 'inherit',
    });
  }
  }

  console.log('[integration] Seeding integration database...');
  execSync('pnpm exec tsx prisma/seeds/integration.seed.ts', {
    cwd: databaseDir,
    env: testEnv,
    stdio: 'inherit',
  });

  console.log('[integration] Database ready:', resolved.databaseUrl.replace(/:[^:@]+@/, ':***@'));
}
