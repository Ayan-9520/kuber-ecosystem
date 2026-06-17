import type { PrismaClient } from '@prisma/client';

export async function seedDevOps(prisma: PrismaClient): Promise<void> {
  const existing = await prisma.pipelineRun.count();
  if (existing > 0) {
    console.log('  → devops seed skipped (data exists)');
    return;
  }

  const pipelines = [
    { pipelineType: 'PR_VALIDATION' as const, name: 'PR Validation #142', branch: 'feature/devops-dashboard', status: 'SUCCESS' as const, durationMs: 420_000 },
    { pipelineType: 'BUILD' as const, name: 'Build — main', branch: 'main', status: 'SUCCESS' as const, durationMs: 180_000 },
    { pipelineType: 'TEST' as const, name: 'Test Suite — develop', branch: 'develop', status: 'SUCCESS' as const, durationMs: 600_000 },
    { pipelineType: 'SECURITY' as const, name: 'Security Scan — staging', branch: 'staging', status: 'SUCCESS' as const, durationMs: 240_000 },
    { pipelineType: 'STAGING_DEPLOY' as const, name: 'Staging Deploy', branch: 'staging', status: 'SUCCESS' as const, durationMs: 300_000 },
    { pipelineType: 'PRODUCTION_DEPLOY' as const, name: 'Production Deploy', branch: 'main', status: 'SUCCESS' as const, durationMs: 360_000 },
  ];

  const now = Date.now();
  const createdPipelines = [];

  for (const [i, p] of pipelines.entries()) {
    const startedAt = new Date(now - (i + 1) * 3_600_000);
    const completedAt = new Date(startedAt.getTime() + p.durationMs);
    const run = await prisma.pipelineRun.create({
      data: {
        pipelineType: p.pipelineType,
        name: p.name,
        branch: p.branch,
        commitSha: `abc123${i}`.padEnd(40, '0'),
        status: p.status,
        startedAt,
        completedAt,
        durationMs: p.durationMs,
        triggeredBy: 'github-actions',
        workflowUrl: 'https://github.com/kuberfinserve/kuberone/actions',
      },
    });
    createdPipelines.push(run);
  }

  const stagingDeploy = createdPipelines.find((p) => p.pipelineType === 'STAGING_DEPLOY');
  const prodDeploy = createdPipelines.find((p) => p.pipelineType === 'PRODUCTION_DEPLOY');

  if (stagingDeploy) {
    await prisma.deployment.create({
      data: {
        pipelineRunId: stagingDeploy.id,
        environment: 'STAGING',
        strategy: 'ROLLING',
        component: 'backend',
        version: '1.0.0-staging.42',
        status: 'SUCCESS',
        commitSha: stagingDeploy.commitSha,
        startedAt: stagingDeploy.startedAt,
        completedAt: stagingDeploy.completedAt,
        executions: {
          create: [
            { step: 'build-image', status: 'SUCCESS', durationMs: 120_000 },
            { step: 'deploy-backend', status: 'SUCCESS', durationMs: 90_000 },
            { step: 'health-check', status: 'SUCCESS', durationMs: 15_000 },
          ],
        },
      },
    });
  }

  if (prodDeploy) {
    const deployment = await prisma.deployment.create({
      data: {
        pipelineRunId: prodDeploy.id,
        environment: 'PRODUCTION',
        strategy: 'BLUE_GREEN',
        component: 'backend',
        version: '1.0.0',
        status: 'SUCCESS',
        commitSha: prodDeploy.commitSha,
        startedAt: prodDeploy.startedAt,
        completedAt: prodDeploy.completedAt,
        executions: {
          create: [
            { step: 'pre-deploy-backup', status: 'SUCCESS', durationMs: 60_000 },
            { step: 'blue-green-switch', status: 'SUCCESS', durationMs: 45_000 },
            { step: 'smoke-test', status: 'SUCCESS', durationMs: 30_000 },
          ],
        },
      },
    });

    await prisma.rollbackExecution.create({
      data: {
        deploymentId: deployment.id,
        fromVersion: '0.9.9',
        toVersion: '1.0.0',
        status: 'SUCCESS',
        reason: 'Planned rollback drill — verified recovery path',
        startedAt: new Date(now - 86_400_000),
        completedAt: new Date(now - 86_400_000 + 120_000),
      },
    });
  }

  await prisma.releaseVersion.create({
    data: {
      version: '1.0.0',
      name: 'KuberOne GA Release',
      branch: 'release/1.0.0',
      commitSha: 'abc1230000000000000000000000000000000000',
      changelog: '- Enterprise CI/CD finalization\n- DevOps dashboard\n- Blue-green production deploy',
      isPublished: true,
      publishedAt: new Date(now - 172_800_000),
    },
  });

  await prisma.deploymentAudit.createMany({
    data: [
      { action: 'DEPLOY', entityType: 'deployment', environment: 'STAGING', details: { component: 'admin' } },
      { action: 'RELEASE_PUBLISH', entityType: 'release', details: { version: '1.0.0' } },
      { action: 'ROLLBACK', entityType: 'rollback', details: { fromVersion: '0.9.9', toVersion: '1.0.0' } },
    ],
  });

  console.log('  → devops seeded');
}
