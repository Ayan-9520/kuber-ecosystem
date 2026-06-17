import type { PrismaClient } from '@prisma/client';

const SCENARIOS = [
  { code: 'SCN_DATABASE', scenario: 'DATABASE_FAILURE', name: 'Database Failure', rto: 60 },
  { code: 'SCN_APPLICATION', scenario: 'APPLICATION_FAILURE', name: 'Application Failure', rto: 45 },
  { code: 'SCN_SERVER', scenario: 'SERVER_FAILURE', name: 'Server Failure', rto: 60 },
  { code: 'SCN_LB', scenario: 'LOAD_BALANCER_FAILURE', name: 'Load Balancer Failure', rto: 30 },
  { code: 'SCN_REDIS', scenario: 'REDIS_FAILURE', name: 'Redis Failure', rto: 30 },
  { code: 'SCN_STORAGE', scenario: 'STORAGE_FAILURE', name: 'Storage Failure', rto: 90 },
  { code: 'SCN_AI', scenario: 'AI_SERVICE_FAILURE', name: 'AI Service Failure', rto: 45 },
  { code: 'SCN_NOTIFICATION', scenario: 'NOTIFICATION_PROVIDER_FAILURE', name: 'Notification Provider Failure', rto: 30 },
  { code: 'SCN_REGION', scenario: 'REGION_FAILURE', name: 'Region Failure', rto: 240 },
  { code: 'SCN_CLOUD', scenario: 'CLOUD_FAILURE', name: 'Cloud Provider Failure', rto: 240 },
  { code: 'SCN_SECURITY', scenario: 'SECURITY_INCIDENT', name: 'Security Incident', rto: 180 },
  { code: 'SCN_CREDENTIAL', scenario: 'CREDENTIAL_LEAK', name: 'Credential Leak', rto: 120 },
  { code: 'SCN_RANSOMWARE', scenario: 'RANSOMWARE', name: 'Ransomware Attack', rto: 120 },
  { code: 'SCN_DELETE', scenario: 'ACCIDENTAL_DELETION', name: 'Accidental Data Deletion', rto: 30 },
  { code: 'SCN_DEPLOY_FAIL', scenario: 'FAILED_PRODUCTION_DEPLOYMENT', name: 'Failed Production Deployment', rto: 45 },
] as const;

const RUNBOOK_STEPS = [
  'Declare incident and notify escalation matrix',
  'Assess scope and impact',
  'Isolate affected systems',
  'Execute recovery procedure',
  'Validate data integrity and RPO/RTO',
  'Resume operations',
  'Post-incident review and documentation',
];

export async function seedDr(prisma: PrismaClient): Promise<void> {
  const existing = await prisma.disasterScenario.count();
  if (existing > 0) {
    console.log('  → dr seed skipped (data exists)');
    return;
  }

  for (const s of SCENARIOS) {
    const scenario = await prisma.disasterScenario.create({
      data: {
        code: s.code,
        name: s.name,
        scenario: s.scenario as never,
        description: `${s.name} recovery scenario for KuberOne production`,
        rpoMinutes: 15,
        rtoMinutes: s.rto,
        severity: 'HIGH',
      },
    });

    await prisma.recoveryRunbook.create({
      data: {
        code: `RB_${s.code}`,
        name: `${s.name} Runbook`,
        scenarioId: scenario.id,
        scenario: s.scenario as never,
        steps: RUNBOOK_STEPS,
        emergencyContacts: [
          { role: 'DevOps On-Call', email: 'devops@kuberfinserve.com', phone: '+91-XXXXXXXXXX' },
          { role: 'SRE Lead', email: 'sre@kuberfinserve.com' },
          { role: 'CTO', email: 'cto@kuberfinserve.com' },
        ],
        escalationMatrix: [
          { level: 1, role: 'DevOps On-Call', minutes: 15 },
          { level: 2, role: 'SRE Lead', minutes: 30 },
          { level: 3, role: 'CTO', minutes: 60 },
        ],
        approvalRequired: true,
      },
    });
  }

  await prisma.dRReport.createMany({
    data: [
      { reportType: 'DR_READINESS', score: 88, coveragePct: 100, summary: '15/15 scenarios covered' },
      { reportType: 'RECOVERY', score: 92, coveragePct: 96, summary: 'Recovery workflows validated' },
      { reportType: 'FAILOVER', score: 90, coveragePct: 90, summary: 'Failover procedures documented' },
      { reportType: 'BUSINESS_CONTINUITY', score: 93, coveragePct: 93, summary: 'BCP aligned with DR plans' },
    ],
  });

  console.log(`  → dr seeded (${SCENARIOS.length} scenarios, runbooks, reports)`);
}
