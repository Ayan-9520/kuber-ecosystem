import type { PrismaClient } from '@prisma/client';

const DEPLOY_SERVICES = [
  { code: 'backend-api', name: 'Backend API' },
  { code: 'worker-services', name: 'Worker Services' },
  { code: 'queue-processors', name: 'Queue Processors' },
  { code: 'notification-workers', name: 'Notification Workers' },
  { code: 'email-workers', name: 'Email Workers' },
  { code: 'sms-workers', name: 'SMS Workers' },
  { code: 'whatsapp-workers', name: 'WhatsApp Workers' },
  { code: 'push-workers', name: 'Push Workers' },
  { code: 'ai-workers', name: 'AI Workers' },
  { code: 'scheduler-services', name: 'Scheduler Services' },
  { code: 'automation-workers', name: 'Automation Workers' },
] as const;

export async function seedBackendDeployment(prisma: PrismaClient): Promise<void> {
  const existing = await prisma.backendDeployment.count();
  if (existing > 0) {
    console.log('  → backend-deployment seed skipped (data exists)');
    return;
  }

  const version = await prisma.deploymentVersion.create({
    data: {
      version: '1.0.0',
      name: 'KuberOne Backend GA',
      status: 'RELEASED',
      commitSha: 'prod0000000000000000000000000000000000',
      changelog: 'Initial production backend deployment',
      releasedAt: new Date(),
    },
  });

  const deployment = await prisma.backendDeployment.create({
    data: {
      versionId: version.id,
      domain: 'api.kuberone.com',
      strategy: 'BLUE_GREEN',
      status: 'SUCCESS',
      version: '1.0.0',
      commitSha: 'prod0000000000000000000000000000000000',
      branch: 'main',
      startedAt: new Date(),
      completedAt: new Date(),
      validationReport: { health: 'PASSED', migrations: 'APPLIED' },
    },
  });

  await prisma.releaseArtifact.create({
    data: {
      deploymentId: deployment.id,
      versionId: version.id,
      artifactType: 'docker-image',
      artifactUrl: 'ghcr.io/kuberfinserve/kuberone-backend:1.0.0',
      checksum: 'sha256:placeholder',
    },
  });

  for (const svc of DEPLOY_SERVICES) {
    await prisma.serviceHealth.create({
      data: {
        serviceCode: svc.code,
        serviceName: svc.name,
        status: 'HEALTHY',
        lastCheckedAt: new Date(),
        latencyMs: 12,
      },
    });
  }

  await prisma.backendDeploymentAudit.create({
    data: {
      deploymentId: deployment.id,
      action: 'DEPLOYMENT_SUCCESS',
      compliance: 'SOC2',
      details: { domain: 'api.kuberone.com' },
    },
  });

  await prisma.backendDeploymentReport.createMany({
    data: [
      { reportType: 'DEPLOYMENT', score: 82, readinessPct: 82, summary: 'Backend deployment platform ready' },
      { reportType: 'SECURITY', score: 88, readinessPct: 88, summary: 'Security controls enabled' },
      { reportType: 'HEALTH', score: 92, readinessPct: 92, summary: 'All health endpoints responding' },
      { reportType: 'SCALABILITY', score: 85, readinessPct: 85, summary: 'Horizontal scaling configured' },
    ],
  });

  console.log('  → backend-deployment seeded');
}
