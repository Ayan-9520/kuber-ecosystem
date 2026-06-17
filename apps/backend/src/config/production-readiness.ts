import type { BackendEnv } from './env.js';
import { getRolloutPhase, isFullRollout, isProductionEnv } from './rollout.js';
import {
  channelStatusService,
  type ChannelStatusReport,
} from '../modules/notifications/services/channel-status.service.js';

export type ReadinessSeverity = 'critical' | 'warning';

export interface ReadinessFinding {
  code: string;
  severity: ReadinessSeverity;
  message: string;
  category: 'secrets' | 'notifications' | 'database' | 'redis' | 'ai' | 'rag' | 'storage';
}

export interface NotificationProviderReport extends ChannelStatusReport {
  /** @deprecated use status */
  configured: boolean;
}

export interface ProductionReadinessReport {
  environment: string;
  rolloutPhase: 'staged' | 'full';
  /** Server may start and serve traffic */
  deployable: boolean;
  /** All production gates satisfied (public launch) */
  ready: boolean;
  /** Weighted score for staged minimum deploy (MySQL + OpenAI + security secrets) */
  stagedReadinessPercent: number;
  /** Weighted score for full public launch */
  publicLaunchReadinessPercent: number;
  findings: ReadinessFinding[];
  secrets: { name: string; present: boolean; required: boolean; requiredForPublicLaunch: boolean }[];
  notifications: NotificationProviderReport[];
  warnings: string[];
  publicLaunchBlockers: string[];
}

const CORE_SECRET_NAMES = [
  'DATABASE_URL',
  'JWT_ACCESS_SECRET',
  'JWT_REFRESH_SECRET',
  'DATA_ENCRYPTION_KEY',
  'OPENAI_API_KEY',
] as const;

function notificationReports(env: BackendEnv): NotificationProviderReport[] {
  return channelStatusService.listAll(env);
}

function computeStagedPercent(secrets: ProductionReadinessReport['secrets']): number {
  const core = secrets.filter((s) => CORE_SECRET_NAMES.includes(s.name as (typeof CORE_SECRET_NAMES)[number]));
  const present = core.filter((s) => s.present).length;
  return Math.round((present / core.length) * 100);
}

function computePublicLaunchPercent(
  secrets: ProductionReadinessReport['secrets'],
  notifications: NotificationProviderReport[],
): number {
  const weights = [
    { present: secrets.find((s) => s.name === 'DATABASE_URL')?.present ?? false, weight: 10 },
    { present: secrets.find((s) => s.name === 'JWT_ACCESS_SECRET')?.present ?? false, weight: 5 },
    { present: secrets.find((s) => s.name === 'JWT_REFRESH_SECRET')?.present ?? false, weight: 5 },
    { present: secrets.find((s) => s.name === 'DATA_ENCRYPTION_KEY')?.present ?? false, weight: 10 },
    { present: secrets.find((s) => s.name === 'OPENAI_API_KEY')?.present ?? false, weight: 10 },
    { present: secrets.find((s) => s.name === 'REDIS_URL')?.present ?? false, weight: 10 },
    { present: secrets.find((s) => s.name === 'AWS_S3_BUCKET')?.present ?? false, weight: 10 },
    ...notifications.map((n) => ({
      present: n.status === 'active',
      weight: 10,
    })),
  ];
  const total = weights.reduce((sum, w) => sum + w.weight, 0);
  const earned = weights.filter((w) => w.present).reduce((sum, w) => sum + w.weight, 0);
  return Math.round((earned / total) * 100);
}

export function assessProductionReadiness(env: BackendEnv): ProductionReadinessReport {
  const production = isProductionEnv(env);
  const rolloutPhase = getRolloutPhase(env);
  const stagedRollout = production && rolloutPhase === 'staged';
  const findings: ReadinessFinding[] = [];
  const warnings: string[] = [];
  const notifications = notificationReports(env);

  const secrets = [
    { name: 'DATABASE_URL', present: Boolean(env.DATABASE_URL), required: true, requiredForPublicLaunch: true },
    { name: 'JWT_ACCESS_SECRET', present: Boolean(env.JWT_ACCESS_SECRET), required: true, requiredForPublicLaunch: true },
    { name: 'JWT_REFRESH_SECRET', present: Boolean(env.JWT_REFRESH_SECRET), required: true, requiredForPublicLaunch: true },
    {
      name: 'DATA_ENCRYPTION_KEY',
      present: Boolean(env.DATA_ENCRYPTION_KEY),
      required: production,
      requiredForPublicLaunch: true,
    },
    {
      name: 'OPENAI_API_KEY',
      present: Boolean(env.OPENAI_API_KEY),
      required: production,
      requiredForPublicLaunch: true,
    },
    {
      name: 'REDIS_URL',
      present: Boolean(env.REDIS_URL),
      required: false,
      requiredForPublicLaunch: production,
    },
    {
      name: 'AWS_S3_BUCKET',
      present: Boolean(env.AWS_S3_BUCKET),
      required: false,
      requiredForPublicLaunch: production,
    },
  ];

  for (const secret of secrets) {
    if (production && secret.required && !secret.present) {
      findings.push({
        code: `SECRET_${secret.name}`,
        severity: 'critical',
        message: `${secret.name} is required in production`,
        category:
          secret.name === 'REDIS_URL'
            ? 'redis'
            : secret.name === 'OPENAI_API_KEY'
              ? 'ai'
              : secret.name === 'AWS_S3_BUCKET'
                ? 'storage'
                : 'secrets',
      });
    } else if (production && secret.requiredForPublicLaunch && !secret.present && !secret.required) {
      findings.push({
        code: `SECRET_${secret.name}_OPTIONAL`,
        severity: stagedRollout ? 'warning' : 'critical',
        message: `${secret.name} is required for public launch`,
        category: secret.name === 'REDIS_URL' ? 'redis' : 'storage',
      });
      warnings.push(`${secret.name} not set — ${secret.name === 'REDIS_URL' ? 'distributed cache/rate limits' : 'document storage'} degraded`);
    }
  }

  for (const report of notifications) {
    const label = report.channel.toUpperCase();
    if (report.status === 'disabled') {
      warnings.push(`${label} channel is disabled`);
      findings.push({
        code: `NOTIFICATION_${label}_DISABLED`,
        severity: 'warning',
        message: `${report.channel} channel is disabled`,
        category: 'notifications',
      });
    } else if (report.status === 'not_configured') {
      const severity = stagedRollout ? 'warning' : 'critical';
      findings.push({
        code: `NOTIFICATION_${label}_NOT_CONFIGURED`,
        severity,
        message: `${report.channel} provider is not configured`,
        category: 'notifications',
      });
      warnings.push(
        `${label} not configured${report.missing.length ? ` (missing: ${report.missing.join(', ')})` : ''}`,
      );
    }
  }

  if (production && isFullRollout(env)) {
    if (env.EMAIL_PROVIDER === 'mock' || env.SMS_PROVIDER === 'mock' || env.PUSH_PROVIDER === 'mock') {
      findings.push({
        code: 'NOTIFICATION_MOCK_PROVIDER_ENV',
        severity: 'critical',
        message: 'Mock notification providers are not allowed in full production rollout',
        category: 'notifications',
      });
    }
  }

  if (production) {
    const vectorProvider = env.VECTOR_DB_PROVIDER ?? 'local';
    if (vectorProvider !== 'local') {
      findings.push({
        code: 'VECTOR_DB_EXTERNAL_NOT_SUPPORTED',
        severity: 'critical',
        message: `External vector store "${vectorProvider}" is not implemented; use VECTOR_DB_PROVIDER=local (MySQL-backed embeddings)`,
        category: 'rag',
      });
    }
  }

  const critical = findings.filter((f) => f.severity === 'critical');
  const publicLaunchBlockers = [
    ...critical.map((f) => f.message),
    ...findings
      .filter((f) => f.severity === 'warning' && f.category === 'notifications')
      .map((f) => f.message),
    ...secrets
      .filter((s) => s.requiredForPublicLaunch && !s.present)
      .map((s) => `${s.name} missing`),
    ...notifications.filter((n) => n.status !== 'active').map((n) => `${n.channel} is ${n.status.replace('_', ' ')}`),
  ];

  const stagedReadinessPercent = computeStagedPercent(secrets);
  const publicLaunchReadinessPercent = computePublicLaunchPercent(secrets, notifications);
  const deployable = production ? critical.length === 0 && stagedReadinessPercent === 100 : true;

  return {
    environment: env.APP_ENV,
    rolloutPhase,
    deployable,
    ready: publicLaunchReadinessPercent === 100 && critical.length === 0,
    stagedReadinessPercent,
    publicLaunchReadinessPercent,
    findings,
    secrets,
    notifications,
    warnings,
    publicLaunchBlockers: [...new Set(publicLaunchBlockers)],
  };
}

export function assertProductionReadiness(env: BackendEnv): ProductionReadinessReport {
  const report = assessProductionReadiness(env);
  if (!report.deployable && isProductionEnv(env)) {
    const lines = [
      'Production deployment validation failed:',
      ...report.findings.filter((f) => f.severity === 'critical').map((f) => `  - [${f.code}] ${f.message}`),
      '',
      `Rollout phase: ${report.rolloutPhase}`,
      `Staged readiness: ${report.stagedReadinessPercent}%`,
      `Public launch readiness: ${report.publicLaunchReadinessPercent}%`,
      '',
      'Notification channels:',
      ...report.notifications.map(
        (n) =>
          `  - ${n.channel}: ${n.status.toUpperCase().replace('_', ' ')} (${n.provider})${n.missing.length ? ` — missing: ${n.missing.join(', ')}` : ''}`,
      ),
      '',
      'Secrets checklist:',
      ...report.secrets.map(
        (s) =>
          `  - ${s.name}: ${s.present ? 'present' : 'MISSING'}${s.required ? ' (required)' : s.requiredForPublicLaunch ? ' (required for public launch)' : ''}`,
      ),
    ];
    throw new Error(lines.join('\n'));
  }
  return report;
}
