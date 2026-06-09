import './load-env.js';

import { createApp } from './app.js';
import { disconnectDatabase } from './config/database.js';
import { env } from './config/env.js';
import { analyticsWorkerService } from './modules/analytics/analytics.module.js';
import { branchAnalyticsWorkerService } from './modules/branch-analytics/branch-analytics.module.js';
import { emailWorkerService } from './modules/email/email.module.js';
import { executiveAnalyticsWorkerService } from './modules/executive-analytics/executive-analytics.module.js';
import { notificationWorkerService } from './modules/notifications/notifications.module.js';
import { pushWorkerService } from './modules/push/push.module.js';
import { regionalAnalyticsWorkerService } from './modules/regional-analytics/regional-analytics.module.js';
import { smsWorkerService } from './modules/sms/sms.module.js';

const app = createApp();

const server = app.listen(env.API_PORT, () => {
  console.log(`🚀 KuberOne API running on ${env.API_BASE_URL}`);
  console.log(`   Environment: ${env.APP_ENV}`);
  console.log(`   API Version: /api/${env.API_VERSION}`);
  notificationWorkerService.start();
  analyticsWorkerService.start();
  executiveAnalyticsWorkerService.start();
  branchAnalyticsWorkerService.start();
  regionalAnalyticsWorkerService.start();
  emailWorkerService.start();
  smsWorkerService.start();
  pushWorkerService.start();
});

async function shutdown(signal: string): Promise<void> {
  console.log(`\n${signal} received. Shutting down gracefully...`);
  notificationWorkerService.stop();
  analyticsWorkerService.stop();
  executiveAnalyticsWorkerService.stop();
  branchAnalyticsWorkerService.stop();
  regionalAnalyticsWorkerService.stop();
  emailWorkerService.stop();
  smsWorkerService.stop();
  pushWorkerService.stop();
  server.close(async () => {
    await disconnectDatabase();
    process.exit(0);
  });
}

process.on('SIGTERM', () => void shutdown('SIGTERM'));
process.on('SIGINT', () => void shutdown('SIGINT'));
