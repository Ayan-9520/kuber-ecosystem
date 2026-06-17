import type { PrismaClient } from '@prisma/client';

export async function seedPlayStore(prisma: PrismaClient): Promise<void> {
  const existing = await prisma.playStoreListing.count();
  if (existing > 0) {
    console.log('  → play-store seed skipped (data exists)');
    return;
  }

  const customer = await prisma.playStoreListing.create({
    data: {
      app: 'CUSTOMER',
      packageName: 'com.kuberone.customer',
      appName: 'KuberOne',
      shortDescription: 'AI-powered loans, EMI calculator & instant eligibility — by Kuber Finserve',
      fullDescription:
        'KuberOne by Kuber Finserve is your intelligent financial companion for personal loans, home loans, business loans, and more.',
      keywords: 'loan, EMI, personal loan, eligibility, Kuber Finserve, finance',
      category: 'FINANCE',
      secondaryCategory: 'BUSINESS',
      privacyPolicyUrl: 'https://kuberone.com/privacy',
      termsUrl: 'https://kuberone.com/terms',
      contactEmail: 'support@kuberfinserve.com',
      contactWebsite: 'https://kuberone.com',
      listingComplete: true,
      assetsComplete: false,
      complianceComplete: false,
      metadata: {
        screenshots: ['Login', 'Dashboard', 'Eligibility', 'EMI Calculator', 'Application', 'Documents', 'Support', 'AI Advisor', 'Voice AI'],
      },
    },
  });

  const dsa = await prisma.playStoreListing.create({
    data: {
      app: 'DSA',
      packageName: 'com.kuberone.partner',
      appName: 'KuberOne Partner',
      shortDescription: 'DSA partner app — leads, commissions, referrals & analytics',
      fullDescription:
        'KuberOne Partner empowers Direct Selling Agents with lead management, commissions, and analytics.',
      keywords: 'DSA, partner, commission, leads, referrals',
      category: 'BUSINESS',
      secondaryCategory: 'FINANCE',
      privacyPolicyUrl: 'https://kuberone.com/privacy',
      termsUrl: 'https://kuberone.com/terms',
      contactEmail: 'partners@kuberfinserve.com',
      contactWebsite: 'https://kuberone.com/partners',
      listingComplete: true,
      assetsComplete: false,
      complianceComplete: false,
      metadata: {
        screenshots: ['Login', 'Dashboard', 'Leads', 'Applications', 'Commissions', 'Referrals', 'Analytics', 'Support'],
      },
    },
  });

  await prisma.playStoreRelease.createMany({
    data: [
      {
        listingId: customer.id,
        versionName: '1.0.0',
        versionCode: 10000,
        track: 'INTERNAL',
        status: 'DRAFT',
        releaseNotes: 'Initial internal testing build',
      },
      {
        listingId: dsa.id,
        versionName: '1.0.0',
        versionCode: 10000,
        track: 'INTERNAL',
        status: 'DRAFT',
        releaseNotes: 'Initial partner internal build',
      },
    ],
  });

  await prisma.playStoreReport.createMany({
    data: [
      {
        listingId: customer.id,
        app: 'CUSTOMER',
        reportType: 'STORE_READINESS',
        score: 58,
        readinessPct: 58,
        summary: 'Play Store readiness — assets and UAT pending',
      },
      {
        listingId: dsa.id,
        app: 'DSA',
        reportType: 'STORE_READINESS',
        score: 58,
        readinessPct: 58,
        summary: 'Play Store readiness — assets and UAT pending',
      },
      {
        app: 'CUSTOMER',
        reportType: 'COMPLIANCE',
        score: 75,
        readinessPct: 75,
        summary: 'Compliance — Data Safety form pending submission',
      },
    ],
  });

  console.log('  → play-store seeded');
}
