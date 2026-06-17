import type { PrismaClient } from '@prisma/client';

/** 15 audit sections × checklist items for KuberOne Go-Live */
const CHECKLIST_ITEMS: {
  section: string;
  itemCode: string;
  title: string;
  description: string;
  sortOrder: number;
  isBlocking?: boolean;
}[] = [
  // Section 1 — Application Readiness
  { section: 'APPLICATION', itemCode: 'APP_BACKEND_BUILD', title: 'Backend build passes', description: 'pnpm build — backend', sortOrder: 1 },
  { section: 'APPLICATION', itemCode: 'APP_CRM_BUILD', title: 'CRM build passes', description: 'pnpm build — admin', sortOrder: 2 },
  { section: 'APPLICATION', itemCode: 'APP_CUSTOMER_BUILD', title: 'Customer app build passes', description: 'EAS / Expo production build', sortOrder: 3 },
  { section: 'APPLICATION', itemCode: 'APP_DSA_BUILD', title: 'DSA app build passes', description: 'EAS / Expo production build', sortOrder: 4 },
  { section: 'APPLICATION', itemCode: 'APP_TYPECHECK', title: 'No TypeScript errors', description: 'pnpm typecheck across monorepo', sortOrder: 5 },
  { section: 'APPLICATION', itemCode: 'APP_NO_CRITICAL_BUGS', title: 'No critical unresolved bugs', description: 'Error tracking — zero critical in 24h window', sortOrder: 6 },
  // Section 2 — Database
  { section: 'DATABASE', itemCode: 'DB_SCHEMA', title: 'Prisma schema validated', description: 'All models migrated', sortOrder: 10 },
  { section: 'DATABASE', itemCode: 'DB_MIGRATIONS', title: 'Migrations deployed', description: 'pnpm db:migrate:deploy', sortOrder: 11 },
  { section: 'DATABASE', itemCode: 'DB_SEEDS', title: 'Production seeds applied', description: 'Permissions, roles, templates', sortOrder: 12 },
  { section: 'DATABASE', itemCode: 'DB_BACKUP', title: 'Backup jobs active', description: 'At least one ACTIVE backup job', sortOrder: 13 },
  { section: 'DATABASE', itemCode: 'DB_RESTORE', title: 'Restore validation passed', description: 'Quarterly restore drill', sortOrder: 14, isBlocking: true },
  // Section 3 — API
  { section: 'API', itemCode: 'API_OPENAPI', title: 'OpenAPI coverage', description: '600+ operations documented', sortOrder: 20 },
  { section: 'API', itemCode: 'API_HEALTH', title: 'API health endpoints', description: '/health, /deep-health', sortOrder: 21 },
  { section: 'API', itemCode: 'API_AUTH', title: 'Authentication validated', description: 'JWT + refresh token rotation', sortOrder: 22 },
  { section: 'API', itemCode: 'API_RBAC', title: 'RBAC enforced', description: 'All routes permission-guarded', sortOrder: 23 },
  // Section 4 — CRM
  { section: 'CRM', itemCode: 'CRM_PAGES', title: 'All CRM pages load', description: '91+ page components', sortOrder: 30 },
  { section: 'CRM', itemCode: 'CRM_NAV', title: 'Navigation & menus work', description: 'Sidebar, breadcrumbs, RBAC nav', sortOrder: 31 },
  { section: 'CRM', itemCode: 'CRM_THEME', title: 'Dark & light theme', description: 'Theme toggle persisted', sortOrder: 32, isBlocking: false },
  // Section 5 — Customer App
  { section: 'CUSTOMER_APP', itemCode: 'CUST_AUTH', title: 'Registration & OTP login', description: 'Auth flow E2E', sortOrder: 40 },
  { section: 'CUSTOMER_APP', itemCode: 'CUST_JOURNEY', title: 'Core customer journey', description: 'Dashboard, eligibility, EMI, applications', sortOrder: 41 },
  { section: 'CUSTOMER_APP', itemCode: 'CUST_AI', title: 'AI Advisor & Voice AI', description: 'AI modules accessible', sortOrder: 42, isBlocking: false },
  // Section 6 — DSA App
  { section: 'DSA_APP', itemCode: 'DSA_AUTH', title: 'Partner login', description: 'DSA OTP / credential flow', sortOrder: 50 },
  { section: 'DSA_APP', itemCode: 'DSA_JOURNEY', title: 'Lead & commission journey', description: 'Leads, applications, commissions', sortOrder: 51 },
  // Section 7 — AI
  { section: 'AI', itemCode: 'AI_PLATFORM', title: 'AI Platform operational', description: 'OpenAI layer, cost tracking', sortOrder: 60 },
  { section: 'AI', itemCode: 'AI_RAG', title: 'Knowledge Base & RAG', description: 'Ingestion and retrieval', sortOrder: 61 },
  { section: 'AI', itemCode: 'AI_CONTENT', title: 'Content generation', description: 'Approval workflow active', sortOrder: 62, isBlocking: false },
  // Section 8 — Notifications
  { section: 'NOTIFICATIONS', itemCode: 'NOTIF_CHANNELS', title: 'All channels configured', description: 'Email, SMS, WhatsApp, Push, In-App', sortOrder: 70 },
  { section: 'NOTIFICATIONS', itemCode: 'NOTIF_TEMPLATES', title: 'Templates seeded', description: 'Production templates approved', sortOrder: 71 },
  // Section 9 — Security
  { section: 'SECURITY', itemCode: 'SEC_JWT', title: 'JWT & refresh tokens', description: 'Rotation, secure storage', sortOrder: 80 },
  { section: 'SECURITY', itemCode: 'SEC_RBAC', title: 'RBAC matrix validated', description: 'security:gate passed', sortOrder: 81 },
  { section: 'SECURITY', itemCode: 'SEC_PII', title: 'PII protection', description: 'Masking, encryption at rest', sortOrder: 82 },
  { section: 'SECURITY', itemCode: 'SEC_RATE_LIMIT', title: 'Rate limiting active', description: 'API rate limits configured', sortOrder: 83 },
  // Section 10 — Infrastructure
  { section: 'INFRASTRUCTURE', itemCode: 'INFRA_PROD', title: 'Production environment', description: 'api.kuberone.com deployed', sortOrder: 90 },
  { section: 'INFRASTRUCTURE', itemCode: 'INFRA_MONITORING', title: 'Monitoring configured', description: 'Prometheus, Grafana, alerts', sortOrder: 91 },
  { section: 'INFRASTRUCTURE', itemCode: 'INFRA_DR', title: 'Disaster recovery ready', description: 'dr:gate passed', sortOrder: 92 },
  { section: 'INFRASTRUCTURE', itemCode: 'INFRA_CICD', title: 'CI/CD pipelines', description: 'Deploy, rollback workflows', sortOrder: 93 },
  // Section 11 — Performance
  { section: 'PERFORMANCE', itemCode: 'PERF_TESTS', title: 'Performance tests passed', description: 'perf:gate threshold met', sortOrder: 100, isBlocking: false },
  { section: 'PERFORMANCE', itemCode: 'PERF_LOAD', title: 'Load tests passed', description: 'Artillery load scenarios', sortOrder: 101, isBlocking: false },
  // Section 12 — Compliance
  { section: 'COMPLIANCE', itemCode: 'COMP_AUDIT', title: 'Audit logs enabled', description: 'Central audit trail', sortOrder: 110 },
  { section: 'COMPLIANCE', itemCode: 'COMP_KYC', title: 'KYC compliance', description: 'KYC workflow validated', sortOrder: 111 },
  { section: 'COMPLIANCE', itemCode: 'COMP_PRIVACY', title: 'Privacy & terms published', description: 'Legal pages in apps', sortOrder: 112, isBlocking: false },
  // Section 14 — Rollback
  { section: 'ROLLBACK', itemCode: 'RB_PLAN', title: 'Rollback plan documented', description: 'deployment/go-live/ROLLBACK_PLAN.md', sortOrder: 120 },
  { section: 'ROLLBACK', itemCode: 'RB_SCRIPTS', title: 'Rollback scripts tested', description: 'production rollback workflow', sortOrder: 121 },
  // Section 15 — Launch Day
  { section: 'LAUNCH_DAY', itemCode: 'LD_PRE_CHECKLIST', title: 'Pre-launch checklist complete', description: 'T-24h validation', sortOrder: 130 },
  { section: 'LAUNCH_DAY', itemCode: 'LD_WAR_ROOM', title: 'War room staffed', description: 'On-call roster confirmed', sortOrder: 131, isBlocking: false },
];

const QUALITY_GATES = [
  { gateCode: 'critical_bugs', label: 'Critical bugs = 0', isBlocking: true },
  { gateCode: 'critical_security', label: 'Critical security findings = 0', isBlocking: true },
  { gateCode: 'uat_signoff', label: 'UAT signed off', isBlocking: true },
  { gateCode: 'backup_validation', label: 'Backup validation passed', isBlocking: true },
  { gateCode: 'monitoring_active', label: 'Monitoring configured', isBlocking: true },
  { gateCode: 'production_validation', label: 'Production validation passed', isBlocking: true },
];

const APPROVAL_TYPES = ['QA', 'SECURITY', 'DEVOPS', 'PRODUCT', 'MANAGEMENT', 'FINAL_RELEASE'] as const;

export async function seedGoLive(prisma: PrismaClient): Promise<void> {
  for (const item of CHECKLIST_ITEMS) {
    await prisma.goLiveChecklist.upsert({
      where: { itemCode: item.itemCode },
      create: {
        section: item.section,
        itemCode: item.itemCode,
        title: item.title,
        description: item.description,
        sortOrder: item.sortOrder,
        isBlocking: item.isBlocking ?? true,
        status: 'PENDING',
      },
      update: {
        title: item.title,
        description: item.description,
        sortOrder: item.sortOrder,
        isBlocking: item.isBlocking ?? true,
      },
    });
  }

  const launch = await prisma.launchExecution.upsert({
    where: { code: 'GO-LIVE-KUBERONE-V1' },
    create: {
      code: 'GO-LIVE-KUBERONE-V1',
      name: 'KuberOne Production Launch',
      status: 'PLANNED',
      targetDate: new Date('2026-07-01T00:00:00.000Z'),
      readinessPct: 0,
      metadata: { version: '1.0.0', company: 'Kuber Finserve' },
    },
    update: { name: 'KuberOne Production Launch' },
  });

  for (const type of APPROVAL_TYPES) {
    await prisma.goLiveApproval.upsert({
      where: {
        launchExecutionId_approvalType: { launchExecutionId: launch.id, approvalType: type },
      },
      create: {
        launchExecutionId: launch.id,
        approvalType: type,
        status: 'PENDING',
      },
      update: {},
    });
  }

  for (const gate of QUALITY_GATES) {
    await prisma.releaseGate.upsert({
      where: {
        launchExecutionId_gateCode: { launchExecutionId: launch.id, gateCode: gate.gateCode },
      },
      create: {
        launchExecutionId: launch.id,
        gateCode: gate.gateCode,
        label: gate.label,
        isBlocking: gate.isBlocking,
        status: 'PENDING',
      },
      update: { label: gate.label, isBlocking: gate.isBlocking },
    });
  }

  await prisma.warRoomSession.upsert({
    where: { code: `WR-${launch.code}` },
    create: {
      launchExecutionId: launch.id,
      code: `WR-${launch.code}`,
      status: 'STANDBY',
      teams: [
        { id: 'launch', label: 'Launch Team', role: 'Launch Director' },
        { id: 'engineering', label: 'Engineering Team', role: 'Principal SRE' },
        { id: 'operations', label: 'Operations Team', role: 'Production Ops Manager' },
        { id: 'security', label: 'Security Team', role: 'Security Lead' },
        { id: 'management', label: 'Management Team', role: 'CTO' },
      ],
      communicationMatrix: [
        { severity: 'SEV_1', notify: ['launch', 'engineering', 'operations', 'security', 'management'], channels: ['email', 'sms', 'whatsapp'] },
        { severity: 'SEV_2', notify: ['launch', 'engineering', 'operations'], channels: ['email', 'sms'] },
      ],
      bridgeUrl: 'https://bridge.kuberone.com/go-live',
    },
    update: { status: 'STANDBY' },
  });

  const existingEvent = await prisma.launchEvent.findFirst({ where: { launchExecutionId: launch.id } });
  if (!existingEvent) {
    await prisma.launchEvent.create({
      data: {
        launchExecutionId: launch.id,
        eventType: 'SYSTEM',
        title: 'Go-Live command center initialized',
        message: 'Launch execution framework ready — awaiting launch authorization',
      },
    });
  }

  console.log('  ✓ Go-Live checklist, launch execution, approvals, gates, war room seeded');
}
