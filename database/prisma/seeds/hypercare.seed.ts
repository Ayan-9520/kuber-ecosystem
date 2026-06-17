import type { PrismaClient } from '@prisma/client';

const SLA_MINUTES = { SEV_1: 15, SEV_2: 30, SEV_3: 240, SEV_4: 480 } as const;

export async function seedHypercare(prisma: PrismaClient): Promise<void> {
  const existing = await prisma.hypercareSession.findUnique({ where: { code: 'HYPERCARE-KUBERONE-V1' } });
  if (existing) {
    console.log('  → Hypercare session already seeded, skipping');
    return;
  }

  const launch = await prisma.launchExecution.findFirst({
    where: { code: 'GO-LIVE-KUBERONE-V1' },
  });

  const session = await prisma.hypercareSession.create({
    data: {
      code: 'HYPERCARE-KUBERONE-V1',
      name: 'KuberOne Post-Launch Hypercare — 4 Week Stabilization',
      status: 'ACTIVE',
      phase: 'WEEK_1',
      weekNumber: 1,
      launchExecutionId: launch?.id,
      startDate: new Date(),
      endDate: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000),
      stabilityPct: 82,
      adoptionPct: 68,
      resolutionPct: 75,
      performanceScore: 78,
      aiStabilityPct: 85,
      finalStatus: 'STABILIZING',
      metadata: { company: 'Kuber Finserve', postGoLive: true },
    },
  });

  const now = new Date();
  const metrics = [
    { category: 'SYSTEM' as const, name: 'system_health', value: 98, unit: '%', threshold: 95 },
    { category: 'API' as const, name: 'api_health', value: 99, unit: '%', threshold: 99 },
    { category: 'DATABASE' as const, name: 'database_health', value: 97, unit: '%', threshold: 95 },
    { category: 'AI' as const, name: 'ai_advisor_uptime', value: 96, unit: '%', threshold: 95 },
    { category: 'ADOPTION' as const, name: 'daily_active_users', value: 340, unit: 'users' },
    { category: 'ADOPTION' as const, name: 'weekly_active_users', value: 1250, unit: 'users' },
    { category: 'BUSINESS' as const, name: 'lead_creation', value: 128, unit: 'count' },
    { category: 'PERFORMANCE' as const, name: 'api_p95_ms', value: 185, unit: 'ms', threshold: 500 },
  ];

  for (const m of metrics) {
    await prisma.hypercareMetric.create({
      data: {
        sessionId: session.id,
        category: m.category,
        name: m.name,
        value: m.value,
        unit: m.unit,
        threshold: m.threshold,
        isHealthy: m.threshold ? m.value <= m.threshold || m.value >= m.threshold : true,
        recordedAt: now,
      },
    });
  }

  await prisma.hypercareIssue.create({
    data: {
      sessionId: session.id,
      code: 'HC-ISSUE-001',
      title: 'OTP delivery delay on peak hours',
      description: 'SMS OTP occasionally delayed > 30s during 9–11 AM IST window.',
      category: 'NOTIFICATION',
      issueType: 'PERFORMANCE',
      severity: 'SEV_3',
      status: 'IN_PROGRESS',
    },
  });

  await prisma.hypercareIssue.create({
    data: {
      sessionId: session.id,
      code: 'HC-ISSUE-002',
      title: 'DSA commission dashboard loading slow',
      description: 'Commission summary API p95 elevated on DSA mobile app.',
      category: 'DSA',
      issueType: 'BUG',
      severity: 'SEV_4',
      status: 'OPEN',
    },
  });

  const slaDeadline = new Date(Date.now() + SLA_MINUTES.SEV_3 * 60 * 1000);
  await prisma.hypercareIncident.create({
    data: {
      sessionId: session.id,
      code: 'HC-INC-001',
      title: 'Elevated API error rate on document upload',
      description: 'Error rate spiked to 2.1% on POST /documents during hypercare monitoring.',
      severity: 'SEV_3',
      status: 'INVESTIGATING',
      slaResponseMinutes: SLA_MINUTES.SEV_3,
      slaDeadline,
      respondedAt: new Date(),
      runbook: 'Assign owner, investigate S3 upload path, notify ops channel.',
      commTemplate: 'hypercare_incident_sev_3',
    },
  });

  console.log('  ✓ Hypercare session, metrics, issues, and incidents seeded');
}
