import type { PrismaClient } from '@prisma/client';

export async function seedProduction(prisma: PrismaClient): Promise<void> {
  const existing = await prisma.productionEnvironment.count();
  if (existing > 0) {
    console.log('  → production seed skipped (data exists)');
    return;
  }

  const env = await prisma.productionEnvironment.create({
    data: {
      code: 'production',
      name: 'KuberOne Production',
      status: 'LIVE',
      apiUrl: 'https://api.kuberone.com',
      adminUrl: 'https://admin.kuberone.com',
      customerUrl: 'https://customer.kuberone.com',
      partnerUrl: 'https://partner.kuberone.com',
      region: 'ap-south-1',
      version: '1.0.0',
      commitSha: 'prod0000000000000000000000000000000000',
      availability: 99.95,
      goLiveAt: new Date('2026-01-01'),
      metadata: {
        dns: 'cloudflare',
        ha: true,
        waf: true,
        encryption: { atRest: true, inTransit: true },
      },
    },
  });

  const components = ['backend', 'admin', 'worker', 'mobile-customer', 'mobile-dsa', 'monitoring'];
  for (const component of components) {
    await prisma.productionDeployment.create({
      data: {
        environmentId: env.id,
        component,
        version: '1.0.0',
        strategy: 'blue-green',
        branch: 'main',
        status: 'SUCCESS',
        startedAt: new Date(Date.now() - 7200_000),
        completedAt: new Date(),
        validationReport: { lint: 'PASSED', tests: 'PASSED', health: 'PASSED' },
      },
    });
  }

  await prisma.releaseRecord.create({
    data: {
      environmentId: env.id,
      version: '1.0.0',
      name: 'KuberOne GA Release',
      branch: 'main',
      status: 'RELEASED',
      changelog: 'Initial production release',
      uatSignedOff: true,
      goLiveApproved: true,
      releasedAt: new Date('2026-01-01'),
    },
  });

  await prisma.productionAudit.createMany({
    data: [
      { environmentId: env.id, action: 'GO_LIVE', entityType: 'production_environment', compliance: 'go-live' },
      { environmentId: env.id, action: 'DEPLOY', entityType: 'production_deployment', compliance: 'deployment' },
      { environmentId: env.id, action: 'COMPLIANCE_CHECK', entityType: 'audit', compliance: 'security' },
    ],
  });

  console.log('  → production seeded');
}
