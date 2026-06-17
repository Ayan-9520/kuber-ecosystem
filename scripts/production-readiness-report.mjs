#!/usr/bin/env node
/**
 * Prints staged deployment readiness, notification coverage, and secrets checklist.
 */
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.join(__dirname, '..');

function loadEnvFile(filePath) {
  if (!existsSync(filePath)) return {};
  const out = {};
  for (const line of readFileSync(filePath, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf('=');
    if (idx === -1) continue;
    const key = trimmed.slice(0, idx).trim();
    let value = trimmed.slice(idx + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    out[key] = value;
  }
  return out;
}

const env = { ...process.env, ...loadEnvFile(path.join(repoRoot, 'apps/backend/.env')) };
const production = env.APP_ENV === 'production' || env.NODE_ENV === 'production';
const rolloutPhase = env.DEPLOYMENT_ROLLOUT_PHASE ?? 'staged';
const stagedRollout = production && rolloutPhase === 'staged';

const coreSecrets = [
  { name: 'DATABASE_URL', required: true },
  { name: 'JWT_ACCESS_SECRET', required: true },
  { name: 'JWT_REFRESH_SECRET', required: true },
  { name: 'DATA_ENCRYPTION_KEY', required: production },
  { name: 'OPENAI_API_KEY', required: production },
];

const launchSecrets = [
  { name: 'REDIS_URL', required: production && rolloutPhase === 'full' },
  { name: 'AWS_S3_BUCKET', required: production && rolloutPhase === 'full' },
];

const channelEnabled = (name) => env[`NOTIFICATION_${name.toUpperCase()}_ENABLED`] !== 'false';

const notifications = [
  {
    channel: 'email',
    enabled: channelEnabled('email'),
    ready:
      channelEnabled('email') &&
      ((env.EMAIL_PROVIDER === 'sendgrid' && env.SENDGRID_API_KEY) ||
        (env.EMAIL_PROVIDER === 'smtp' && env.SMTP_HOST) ||
        Boolean(env.SENDGRID_API_KEY || env.SMTP_HOST)),
    provider: env.EMAIL_PROVIDER ?? 'none',
  },
  {
    channel: 'sms',
    enabled: channelEnabled('sms'),
    ready:
      channelEnabled('sms') &&
      ((env.SMS_PROVIDER === 'msg91' && env.MSG91_AUTH_KEY) ||
        (env.SMS_PROVIDER === 'twilio' && env.TWILIO_ACCOUNT_SID) ||
        Boolean(env.MSG91_AUTH_KEY || env.TWILIO_ACCOUNT_SID)),
    provider: env.SMS_PROVIDER ?? 'none',
  },
  {
    channel: 'whatsapp',
    enabled: channelEnabled('whatsapp'),
    ready:
      channelEnabled('whatsapp') &&
      Boolean(env.WHATSAPP_BUSINESS_API_TOKEN && env.WHATSAPP_PHONE_NUMBER_ID),
    provider: env.WHATSAPP_BUSINESS_API_TOKEN ? 'meta' : 'none',
  },
  {
    channel: 'push',
    enabled: channelEnabled('push'),
    ready:
      channelEnabled('push') && Boolean(env.FCM_SERVER_KEY || env.FIREBASE_PROJECT_ID),
    provider: env.PUSH_PROVIDER ?? 'none',
  },
];

function channelStatus(n) {
  if (!n.enabled) return 'Disabled';
  if (!n.ready) return 'Not Configured';
  return 'Active';
}

const corePresent = coreSecrets.filter((s) => Boolean(env[s.name])).length;
const stagedReadinessPercent = Math.round((corePresent / coreSecrets.length) * 100);

const weights = [
  { present: Boolean(env.DATABASE_URL), weight: 10 },
  { present: Boolean(env.JWT_ACCESS_SECRET), weight: 5 },
  { present: Boolean(env.JWT_REFRESH_SECRET), weight: 5 },
  { present: Boolean(env.DATA_ENCRYPTION_KEY), weight: 10 },
  { present: Boolean(env.OPENAI_API_KEY), weight: 10 },
  { present: Boolean(env.REDIS_URL), weight: 10 },
  { present: Boolean(env.AWS_S3_BUCKET), weight: 10 },
  ...notifications.map((n) => ({ present: n.ready, weight: 10 })),
];
const weightTotal = weights.reduce((s, w) => s + w.weight, 0);
const weightEarned = weights.filter((w) => w.present).reduce((s, w) => s + w.weight, 0);
const publicLaunchReadinessPercent = Math.round((weightEarned / weightTotal) * 100);

console.log('# Production Readiness Report');
console.log(`Environment: ${env.APP_ENV ?? env.NODE_ENV ?? 'unknown'}`);
console.log(`Production mode: ${production}`);
console.log(`Rollout phase: ${rolloutPhase}`);
console.log(`Staged deployable: ${stagedReadinessPercent}%`);
console.log(`Public launch readiness: ${publicLaunchReadinessPercent}%`);

console.log('\n## Core Secrets (required to start in production)');
for (const s of coreSecrets) {
  const present = Boolean(env[s.name]);
  console.log(`- ${s.name}: ${present ? 'PRESENT' : 'MISSING'}${s.required ? ' (required)' : ''}`);
}

console.log('\n## Public Launch Secrets (optional in staged rollout)');
for (const s of launchSecrets) {
  const present = Boolean(env[s.name]);
  console.log(`- ${s.name}: ${present ? 'PRESENT' : 'MISSING'}${s.required ? ' (required for full rollout)' : ' (optional in staged)'}`);
}

console.log('\n## Notification Channel Status');
for (const n of notifications) {
  console.log(`- ${n.channel}: ${channelStatus(n)} (${n.provider})`);
}

function parseAuditJson(stdout) {
  const start = stdout.indexOf('{');
  const end = stdout.lastIndexOf('}');
  if (start === -1 || end === -1 || end < start) return { coveragePercent: 0 };
  return JSON.parse(stdout.slice(start, end + 1));
}

const audit = existsSync(path.join(repoRoot, 'scripts/audit-route-validation.mjs'))
  ? parseAuditJson(
      (await import('node:child_process')).execSync('node scripts/audit-route-validation.mjs', {
        cwd: repoRoot,
        encoding: 'utf8',
      }),
    )
  : { coveragePercent: 0 };

console.log('\n## Validation Coverage');
console.log(`- Total routes: ${audit.total ?? 'n/a'}`);
console.log(`- Validated routes: ${audit.validated ?? 'n/a'}`);
console.log(`- Coverage: ${audit.coveragePercent ?? 'n/a'}%`);

const vectorProvider = env.VECTOR_DB_PROVIDER ?? 'local';
console.log('\n## RAG / Vector Store');
console.log(`- Provider: ${vectorProvider}`);
console.log(
  vectorProvider === 'local'
    ? '- Mode: local (MySQL-backed embeddings — supported for production)'
    : '- Mode: external (not implemented; use VECTOR_DB_PROVIDER=local for production)',
);

const critical = [];
if (production) {
  if (coreSecrets.some((s) => s.required && !env[s.name])) critical.push('Core secrets missing');
  if (launchSecrets.some((s) => s.required && !env[s.name])) critical.push('Full rollout secrets missing');
  if (!stagedRollout && notifications.some((n) => n.enabled && !n.ready)) {
    critical.push('Notification providers not fully configured');
  }
  if (rolloutPhase === 'full' && (env.EMAIL_PROVIDER === 'mock' || env.SMS_PROVIDER === 'mock' || env.PUSH_PROVIDER === 'mock')) {
    critical.push('Mock provider env flags set in full production rollout');
  }
}

console.log('\n## Verdict');
if (critical.length) {
  console.log('NOT DEPLOYABLE');
  for (const c of critical) console.log(`- ${c}`);
  process.exitCode = 1;
} else if (production && stagedRollout) {
  console.log('DEPLOYABLE (staged rollout — configure notifications/Redis/S3 before public launch)');
  if (publicLaunchReadinessPercent < 100) {
    console.log(`- Public launch blockers remain (${100 - publicLaunchReadinessPercent}% gap)`);
  }
} else if (production) {
  console.log('READY FOR FULL PRODUCTION');
} else {
  console.log('READY FOR STAGING / UAT (non-production environment)');
}
