import './load-env.js';

import { createApp } from './app.js';
import { disconnectDatabase } from './config/database.js';
import { env } from './config/env.js';
import { openAiClientService } from './modules/ai-platform/services/openai-client.service.js';
import { assertProductionReadiness } from './config/production-readiness.js';
import { analyticsWorkerService } from './modules/analytics/analytics.module.js';
import { automationWorkerService } from './modules/automation/automation.module.js';
import { backupWorkerService } from './modules/backup/backup.module.js';
import { branchAnalyticsWorkerService } from './modules/branch-analytics/branch-analytics.module.js';
import { contentWorkerService } from './modules/content/content.module.js';
import { emailWorkerService } from './modules/email/email.module.js';
import { executiveAnalyticsWorkerService } from './modules/executive-analytics/executive-analytics.module.js';
import { notificationWorkerService } from './modules/notifications/notifications.module.js';
import { pushWorkerService } from './modules/push/push.module.js';
import { regionalAnalyticsWorkerService } from './modules/regional-analytics/regional-analytics.module.js';
import { smsWorkerService } from './modules/sms/sms.module.js';
import { initOtel } from './shared/observability/otel.js';

void initOtel();

const readinessReport = assertProductionReadiness(env);
if (env.APP_ENV === 'production') {
  console.log(
    `Production rollout: ${readinessReport.rolloutPhase} | deployable=${readinessReport.deployable} | staged=${readinessReport.stagedReadinessPercent}% | public launch=${readinessReport.publicLaunchReadinessPercent}%`,
  );
  if (readinessReport.warnings.length > 0) {
    console.warn('Deployment warnings:');
    for (const warning of readinessReport.warnings) {
      console.warn(`  - ${warning}`);
    }
  }
} else {
  console.log(`Environment readiness: ${env.APP_ENV}`);
  if (openAiClientService.isConfigured()) {
    console.log('   OpenAI: configured (env OPENAI_API_KEY)');
  } else {
    console.warn('   OpenAI: not configured — AI features use rules-engine fallback');
  }
}

const app = createApp();

const server = app.listen(env.API_PORT, '0.0.0.0', () => {
  console.log(`🚀 KuberOne API running on ${env.API_BASE_URL}`);
  console.log(`   Listening on 0.0.0.0:${env.API_PORT} (LAN devices use your PC IPv4, e.g. http://192.168.x.x:${env.API_PORT})`);
  console.log(`   Environment: ${env.APP_ENV}`);
  console.log(`   API Version: /api/${env.API_VERSION}`);
  if (env.API_WORKERS_ENABLED) {
    notificationWorkerService.start();
    automationWorkerService.start();
    contentWorkerService.start();
    analyticsWorkerService.start();
    executiveAnalyticsWorkerService.start();
    branchAnalyticsWorkerService.start();
    regionalAnalyticsWorkerService.start();
    emailWorkerService.start();
    smsWorkerService.start();
    pushWorkerService.start();
    backupWorkerService.start();
    console.log('   Background workers: enabled');
  } else {
    console.log('   Background workers: disabled (API-only mode)');
  }
});

async function shutdown(signal: string): Promise<void> {
  console.log(`\n${signal} received. Shutting down gracefully...`);
  notificationWorkerService.stop();
  automationWorkerService.stop();
  contentWorkerService.stop();
  analyticsWorkerService.stop();
  executiveAnalyticsWorkerService.stop();
  branchAnalyticsWorkerService.stop();
  regionalAnalyticsWorkerService.stop();
  emailWorkerService.stop();
  smsWorkerService.stop();
  pushWorkerService.stop();
  backupWorkerService.stop();
  server.close(async () => {
    await disconnectDatabase();
    process.exit(0);
  });
}

process.on('SIGTERM', () => void shutdown('SIGTERM'));
process.on('SIGINT', () => void shutdown('SIGINT'));
