import { assessProductionReadiness } from '../../../config/production-readiness.js';
import { env } from '../../../config/env.js';
import { isRedisEnabled } from '../../../config/redis.js';
import { channelStatusService } from '../../notifications/services/channel-status.service.js';

export const deploymentReadinessService = {
  getReport() {
    const report = assessProductionReadiness(env);
    const channels = channelStatusService.listAll(env);

    return {
      ...report,
      infrastructure: {
        redis: {
          configured: isRedisEnabled(),
          status: isRedisEnabled() ? 'active' : 'not_configured',
        },
        objectStorage: {
          configured: Boolean(env.AWS_S3_BUCKET),
          status: env.AWS_S3_BUCKET ? 'active' : 'not_configured',
          bucket: env.AWS_S3_BUCKET ?? null,
        },
        openai: {
          configured: Boolean(env.OPENAI_API_KEY),
          status: env.OPENAI_API_KEY ? 'active' : 'not_configured',
        },
      },
      channels: channels.map((c) => ({
        channel: c.channel,
        status: c.status === 'active' ? 'Active' : c.status === 'disabled' ? 'Disabled' : 'Not Configured',
        operationalStatus: c.status,
        provider: c.provider,
        missing: c.missing,
        deliverable: c.deliverable,
      })),
      summary: {
        deployable: report.deployable,
        publicLaunchReady: report.ready,
        stagedReadinessPercent: report.stagedReadinessPercent,
        publicLaunchReadinessPercent: report.publicLaunchReadinessPercent,
        warningCount: report.warnings.length,
        blockerCount: report.publicLaunchBlockers.length,
      },
    };
  },
};
