import type { PrismaClient } from '@prisma/client';

export async function seedAppStore(prisma: PrismaClient): Promise<void> {
  const existing = await prisma.appStoreListing.count();
  if (existing > 0) {
    console.log('  → app-store seed skipped (data exists)');
    return;
  }

  const customer = await prisma.appStoreListing.create({
    data: {
      app: 'CUSTOMER',
      bundleId: 'com.kuberone.customer',
      appName: 'KuberOne',
      subtitle: 'AI Loans & EMI Calculator',
      keywords: 'loan,EMI,finance,eligibility,Kuber Finserve',
      description: 'KuberOne by Kuber Finserve — intelligent financial companion for loans and eligibility.',
      promotionalText: 'Check eligibility in seconds. Apply with AI guidance.',
      supportUrl: 'https://kuberone.com/support',
      marketingUrl: 'https://kuberone.com',
      privacyPolicyUrl: 'https://kuberone.com/privacy',
      termsUrl: 'https://kuberone.com/terms',
      primaryCategory: 'FINANCE',
      secondaryCategory: 'PRODUCTIVITY',
      ageRating: '17+',
      listingComplete: true,
      reviewNotes: 'Demo: +919876543210 OTP 123456 on staging',
      demoAccount: { phone: '+919876543210', otp: '123456', environment: 'staging' },
      metadata: {
        screenshots: ['Login', 'Dashboard', 'Eligibility', 'EMI Calculator', 'Loan Application', 'Documents', 'Support', 'AI Advisor', 'Voice AI', 'Profile'],
      },
    },
  });

  const dsa = await prisma.appStoreListing.create({
    data: {
      app: 'DSA',
      bundleId: 'com.kuberone.partner',
      appName: 'KuberOne Partner',
      subtitle: 'DSA Leads & Commissions',
      keywords: 'DSA,partner,commission,leads,referrals',
      description: 'KuberOne Partner — DSA toolkit for leads, commissions, and analytics.',
      promotionalText: 'Grow your loan business with real-time commissions.',
      supportUrl: 'https://kuberone.com/partners/support',
      marketingUrl: 'https://kuberone.com/partners',
      privacyPolicyUrl: 'https://kuberone.com/privacy',
      termsUrl: 'https://kuberone.com/terms',
      primaryCategory: 'BUSINESS',
      secondaryCategory: 'FINANCE',
      ageRating: '17+',
      listingComplete: true,
      demoAccount: { phone: '+919876543211', otp: '123456', environment: 'staging' },
      metadata: {
        screenshots: ['Login', 'Dashboard', 'Leads', 'Applications', 'Customers', 'Commissions', 'Referrals', 'Analytics', 'Support', 'Profile'],
      },
    },
  });

  await prisma.appStoreRelease.createMany({
    data: [
      {
        listingId: customer.id,
        versionName: '1.0.0',
        buildNumber: '10000',
        track: 'TESTFLIGHT_INTERNAL',
        status: 'DRAFT',
        releaseNotes: 'Initial TestFlight build',
      },
      {
        listingId: dsa.id,
        versionName: '1.0.0',
        buildNumber: '10000',
        track: 'TESTFLIGHT_INTERNAL',
        status: 'DRAFT',
        releaseNotes: 'Initial partner TestFlight build',
      },
    ],
  });

  await prisma.appStoreReport.createMany({
    data: [
      { listingId: customer.id, app: 'CUSTOMER', reportType: 'STORE_READINESS', score: 62, readinessPct: 62, summary: 'Assets and TestFlight pending' },
      { listingId: customer.id, app: 'CUSTOMER', reportType: 'COMPLIANCE', score: 78, readinessPct: 78, summary: 'Privacy labels configured in docs' },
      { listingId: customer.id, app: 'CUSTOMER', reportType: 'REVIEW_READINESS', score: 70, readinessPct: 70, summary: 'Demo account documented' },
    ],
  });

  console.log('  → app-store seeded');
}
