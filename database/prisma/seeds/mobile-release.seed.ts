import type { PrismaClient } from '@prisma/client';

export async function seedMobileRelease(prisma: PrismaClient): Promise<void> {
  const existing = await prisma.mobileBuild.count();
  if (existing > 0) {
    console.log('  → mobile-release seed skipped (data exists)');
    return;
  }

  const customerRelease = await prisma.mobileRelease.create({
    data: {
      app: 'CUSTOMER',
      versionName: '1.0.0',
      versionCode: 10000,
      status: 'PLANNED',
      track: 'internal',
      readinessScore: 72,
      securityScore: 85,
      performanceScore: 88,
      playStoreReady: false,
      releaseNotes: 'Initial production release — KuberOne Customer App',
    },
  });

  const dsaRelease = await prisma.mobileRelease.create({
    data: {
      app: 'DSA',
      versionName: '1.0.0',
      versionCode: 10000,
      status: 'PLANNED',
      track: 'internal',
      readinessScore: 72,
      securityScore: 85,
      performanceScore: 88,
      playStoreReady: false,
      releaseNotes: 'Initial production release — KuberOne Partner App',
    },
  });

  const builds = [
    {
      app: 'CUSTOMER' as const,
      environment: 'STAGING' as const,
      buildFormat: 'APK' as const,
      versionName: '1.0.0-rc',
      versionCode: 10001,
      packageId: 'com.kuberone.customer.staging',
      releaseId: customerRelease.id,
    },
    {
      app: 'DSA' as const,
      environment: 'STAGING' as const,
      buildFormat: 'APK' as const,
      versionName: '1.0.0-rc',
      versionCode: 10001,
      packageId: 'com.kuberone.partner.staging',
      releaseId: dsaRelease.id,
    },
  ];

  for (const b of builds) {
    await prisma.mobileBuild.create({
      data: {
        ...b,
        status: 'SUCCESS',
        signed: true,
        hermesEnabled: true,
        proguardEnabled: true,
        splitApkReady: true,
        branch: 'staging',
        completedAt: new Date(),
      },
    });
  }

  await prisma.mobileReleaseAudit.createMany({
    data: [
      { releaseId: customerRelease.id, action: 'RELEASE_CREATED', details: { source: 'seed' } },
      { releaseId: dsaRelease.id, action: 'RELEASE_CREATED', details: { source: 'seed' } },
    ],
  });

  console.log('  → mobile-release seeded');
}
