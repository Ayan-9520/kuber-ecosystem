import type { PrismaClient } from '@prisma/client';

export async function seedStaging(prisma: PrismaClient): Promise<void> {
  const existing = await prisma.environment.count();
  if (existing > 0) {
    console.log('  → staging seed skipped (data exists)');
    return;
  }

  const env = await prisma.environment.create({
    data: {
      code: 'staging',
      name: 'KuberOne Staging',
      status: 'ACTIVE',
      apiUrl: 'https://staging-api.kuberone.com',
      adminUrl: 'https://staging-admin.kuberone.com',
      customerUrl: 'https://staging-customer.kuberone.com',
      partnerUrl: 'https://staging-partner.kuberone.com',
      databaseUrl: 'mysql://kuberone:***@staging-rds.internal:3306/kuberone_staging',
      redisUrl: 'rediss://staging-redis.internal:6379',
      s3Bucket: 'kuberone-staging',
      branch: 'staging',
      version: '1.0.0-staging.1',
      commitSha: 'staging0000000000000000000000000000000000',
      maskedData: true,
      metadata: {
        purposes: ['testing', 'uat', 'release-validation', 'performance', 'security'],
        integrations: ['email', 'sms', 'whatsapp', 'push', 'openai', 'voice-ai', 's3'],
      },
    },
  });

  const components = [
    { component: 'backend', version: '1.0.0-staging.1' },
    { component: 'admin', version: '1.0.0-staging.1' },
    { component: 'worker', version: '1.0.0-staging.1' },
    { component: 'mobile-customer', version: '1.0.0-staging.1' },
    { component: 'mobile-dsa', version: '1.0.0-staging.1' },
  ];

  for (const c of components) {
    await prisma.environmentDeployment.create({
      data: {
        environmentId: env.id,
        component: c.component,
        version: c.version,
        branch: 'staging',
        status: 'PASSED',
        buildStatus: 'PASSED',
        testStatus: 'PASSED',
        migrationStatus: 'PASSED',
        healthStatus: 'PASSED',
        startedAt: new Date(Date.now() - 3600_000),
        completedAt: new Date(),
        report: { validatedBy: 'ci-staging-pipeline' },
      },
    });
  }

  await prisma.releaseValidation.create({
    data: {
      environmentId: env.id,
      releaseVersion: '1.0.0-rc.1',
      branch: 'release/1.0.0',
      status: 'PASSED',
      preDeployCheck: true,
      postDeployCheck: true,
      rollbackReady: true,
      startedAt: new Date(Date.now() - 86_400_000),
      completedAt: new Date(Date.now() - 82_800_000),
      checklist: {
        preDeploy: [{ item: 'PR validation passed', checked: true }],
        postDeploy: [{ item: 'Health checks passed', checked: true }],
        rollback: [{ item: 'Rollback script verified', checked: true }],
      },
    },
  });

  await prisma.stagingAudit.createMany({
    data: [
      { environmentId: env.id, action: 'ENV_PROVISION', entityType: 'environment', details: { region: 'ap-south-1' } },
      { environmentId: env.id, action: 'DEPLOY', entityType: 'environment_deployment', details: { component: 'backend' } },
      { environmentId: env.id, action: 'RELEASE_VALIDATION', entityType: 'release_validation', details: { version: '1.0.0-rc.1' } },
    ],
  });

  console.log('  → staging seeded');
}
