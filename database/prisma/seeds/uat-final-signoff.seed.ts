import type { PrismaClient } from '@prisma/client';

const STAKEHOLDERS = [
  { group: 'MANAGEMENT', label: 'Management', department: 'Executive', sortOrder: 1 },
  { group: 'SALES', label: 'Sales Team', department: 'Sales', sortOrder: 2 },
  { group: 'RELATIONSHIP_MANAGER', label: 'Relationship Managers', department: 'Sales', sortOrder: 3 },
  { group: 'CREDIT', label: 'Credit Team', department: 'Credit', sortOrder: 4 },
  { group: 'OPERATIONS', label: 'Operations Team', department: 'Operations', sortOrder: 5 },
  { group: 'COMPLIANCE', label: 'Compliance Team', department: 'Compliance', sortOrder: 6 },
  { group: 'SUPPORT', label: 'Support Team', department: 'Support', sortOrder: 7 },
  { group: 'DSA_PARTNER', label: 'DSA Partners', department: 'Channel', sortOrder: 8 },
  { group: 'CUSTOMER_JOURNEY', label: 'Customer Journey Owners', department: 'Product', sortOrder: 9 },
  { group: 'TECHNOLOGY', label: 'Technology Team', department: 'Technology', sortOrder: 10 },
] as const;

const REVIEW_AREAS = [
  {
    area: 'CUSTOMER_JOURNEY',
    checklist: [
      'Registration', 'OTP Login', 'Profile Completion', 'KYC', 'Eligibility',
      'EMI Calculation', 'Application Submission', 'Document Upload', 'Application Tracking',
      'Notifications', 'Support', 'Referral', 'AI Advisor', 'Voice AI',
    ],
  },
  {
    area: 'DSA_JOURNEY',
    checklist: [
      'Login', 'Lead Creation', 'Lead Management', 'Customer Tracking',
      'Application Tracking', 'Commission Tracking', 'Referral Tracking', 'Support', 'Analytics',
    ],
  },
  {
    area: 'CRM_JOURNEY',
    checklist: [
      'Dashboard', 'Customers', 'KYC', 'Products', 'Leads', 'Applications', 'Documents',
      'Referrals', 'Commissions', 'Notifications', 'Support', 'Campaigns', 'Knowledge Base',
      'AI', 'Analytics', 'Audit', 'Compliance', 'Settings',
    ],
  },
  {
    area: 'BUSINESS_WORKFLOWS',
    checklist: [
      'Lead Lifecycle', 'Application Lifecycle', 'Document Lifecycle',
      'Referral Lifecycle', 'Commission Lifecycle', 'Support Lifecycle',
    ],
  },
  {
    area: 'AI_WORKFLOWS',
    checklist: [
      'AI Advisor', 'Voice AI', 'Lead Scoring', 'Recommendation Engine',
      'Knowledge Base', 'RAG', 'OpenAI Integration',
    ],
  },
  {
    area: 'NOTIFICATIONS',
    checklist: ['Email', 'SMS', 'WhatsApp', 'Push Notifications', 'In-App Notifications'],
  },
  {
    area: 'SECURITY',
    checklist: ['RBAC', 'Data Scope', 'Encryption', 'Audit Logs', 'Penetration Test Results'],
  },
  {
    area: 'OPERATIONS',
    checklist: [
      'Monitoring', 'Logging', 'Error Tracking', 'Backup', 'Disaster Recovery',
      'Deployment', 'Incident Management',
    ],
  },
  {
    area: 'PERFORMANCE',
    checklist: ['Load Testing', 'Stress Testing', 'Mobile Performance', 'API Performance'],
  },
] as const;

const SAMPLE_RISKS = [
  {
    code: 'UAT-RISK-001',
    title: 'Backend unit test failures',
    description: 'auth.routes.test.ts and modules-health.test.ts have failing tests that may indicate regression risk.',
    severity: 'HIGH' as const,
    reviewArea: 'PERFORMANCE' as const,
  },
  {
    code: 'UAT-RISK-002',
    title: 'Integration tests require MySQL',
    description: 'Integration test suite cannot run without local MySQL — CI coverage gap for DB-dependent flows.',
    severity: 'MEDIUM' as const,
    reviewArea: 'OPERATIONS' as const,
  },
  {
    code: 'UAT-RISK-003',
    title: 'Penetration test not completed',
    description: 'Security validation scan and penetration test report pending before final management signoff.',
    severity: 'CRITICAL' as const,
    reviewArea: 'SECURITY' as const,
  },
];

export async function seedUatFinalSignoff(prisma: PrismaClient): Promise<void> {
  const cycle = await prisma.uatCycle.findFirst({
    where: { code: 'UAT-CYCLE-001' },
    orderBy: { createdAt: 'desc' },
  });
  if (!cycle) {
    console.log('  → UAT cycle not found, skipping final signoff seed');
    return;
  }

  const existing = await prisma.uatStakeholder.findFirst({ where: { cycleId: cycle.id } });
  if (existing) {
    console.log('  → Final UAT signoff already seeded, skipping');
    return;
  }

  for (const s of STAKEHOLDERS) {
    const stakeholder = await prisma.uatStakeholder.create({
      data: {
        cycleId: cycle.id,
        stakeholderGroup: s.group,
        label: s.label,
        department: s.department,
        isRequired: true,
        sortOrder: s.sortOrder,
      },
    });
    await prisma.uatApproval.create({
      data: {
        cycleId: cycle.id,
        stakeholderId: stakeholder.id,
        stage: 'PENDING',
      },
    });
  }

  for (const r of REVIEW_AREAS) {
    await prisma.uatReview.create({
      data: {
        cycleId: cycle.id,
        reviewArea: r.area,
        stage: 'PENDING',
        score: 0,
        checklist: r.checklist.map((item) => ({ item, checked: false })),
      },
    });
  }

  for (const risk of SAMPLE_RISKS) {
    await prisma.uatRisk.upsert({
      where: { code: risk.code },
      create: {
        cycleId: cycle.id,
        code: risk.code,
        title: risk.title,
        description: risk.description,
        severity: risk.severity,
        reviewArea: risk.reviewArea,
        status: 'OPEN',
      },
      update: {},
    });
  }

  console.log('  → Final UAT signoff framework seeded (stakeholders, reviews, risks)');
}
