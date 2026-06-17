export const GO_LIVE_PERMISSIONS = {
  READ: 'golive.read',
  MANAGE: 'golive.manage',
  APPROVE: 'golive.approve',
  RELEASE_APPROVE: 'release.approve',
} as const;

export const GO_LIVE_SECTIONS = [
  { id: 'APPLICATION', label: 'Application Readiness', weight: 10 },
  { id: 'DATABASE', label: 'Database Readiness', weight: 10 },
  { id: 'API', label: 'API Readiness', weight: 8 },
  { id: 'CRM', label: 'CRM Readiness', weight: 8 },
  { id: 'CUSTOMER_APP', label: 'Customer App Readiness', weight: 8 },
  { id: 'DSA_APP', label: 'DSA App Readiness', weight: 8 },
  { id: 'AI', label: 'AI Readiness', weight: 6 },
  { id: 'NOTIFICATIONS', label: 'Notification Readiness', weight: 5 },
  { id: 'SECURITY', label: 'Security Readiness', weight: 10 },
  { id: 'INFRASTRUCTURE', label: 'Infrastructure Readiness', weight: 10 },
  { id: 'PERFORMANCE', label: 'Performance Readiness', weight: 5 },
  { id: 'COMPLIANCE', label: 'Compliance Readiness', weight: 7 },
  { id: 'ROLLBACK', label: 'Rollback Readiness', weight: 5 },
  { id: 'LAUNCH_DAY', label: 'Launch Day Readiness', weight: 5 },
] as const;

export const QUALITY_GATES = [
  { gateCode: 'critical_bugs', label: 'Critical bugs = 0', check: 'errors', isBlocking: true },
  { gateCode: 'critical_security', label: 'Critical security findings = 0', check: 'security', isBlocking: true },
  { gateCode: 'uat_signoff', label: 'UAT signed off', check: 'uat', isBlocking: true },
  { gateCode: 'backup_validation', label: 'Backup validation passed', check: 'backup', isBlocking: true },
  { gateCode: 'monitoring_active', label: 'Monitoring configured', check: 'monitoring', isBlocking: true },
  { gateCode: 'production_validation', label: 'Production validation passed', check: 'validation', isBlocking: true },
] as const;

export const APPROVAL_WORKFLOW = [
  { type: 'QA', label: 'QA Approval', permission: 'golive.approve' },
  { type: 'SECURITY', label: 'Security Approval', permission: 'golive.approve' },
  { type: 'DEVOPS', label: 'DevOps Approval', permission: 'golive.approve' },
  { type: 'PRODUCT', label: 'Product Approval', permission: 'golive.approve' },
  { type: 'MANAGEMENT', label: 'Management Approval', permission: 'golive.approve' },
  { type: 'FINAL_RELEASE', label: 'Final Release Approval', permission: 'release.approve' },
] as const;

export const LAUNCH_CHECKLISTS = {
  preLaunch: [
    'Run pnpm typecheck, lint, build, test',
    'Execute production:gate and go-live:gate',
    'Confirm UAT signoffs (all stakeholder types)',
    'Verify backup restore drill within 90 days',
    'Confirm war room roster and escalation matrix',
    'Validate rollback scripts in staging',
  ],
  launch: [
    'Enable maintenance banner (if applicable)',
    'Deploy backend to api.kuberone.com',
    'Run production:validate health checks',
    'Deploy CRM admin to admin.kuberone.com',
    'Submit App Store / Play Store releases',
    'Smoke test customer and DSA critical paths',
    'Monitor error rate and latency for 30 minutes',
  ],
  postLaunch: [
    'Disable maintenance banner',
    'Send launch communication to stakeholders',
    'Archive launch audit trail',
    'Schedule post-mortem within 48 hours',
    'Update runbooks with lessons learned',
  ],
  warRoom: [
    'SRE lead on bridge',
    'Backend engineer on bridge',
    'QA lead monitoring smoke tests',
    'Product owner sign-off channel open',
    'Incident commander identified',
  ],
  incident: [
    'Assess severity (SEV1–SEV4)',
    'Notify escalation matrix',
    'Decide: fix forward vs rollback',
    'Execute rollback if SEV1 > 15 min',
    'Document in incident record',
  ],
} as const;

export const READINESS_THRESHOLDS = {
  goLiveMinimum: 85,
  sectionMinimum: 70,
  gatePassRequired: 100,
} as const;
