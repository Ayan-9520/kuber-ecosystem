export const LAUNCH_WORKFLOW_STEPS = [
  { step: 'PRODUCTION_FREEZE', order: 1, label: 'Production Freeze', description: 'Freeze production deployments and config changes' },
  { step: 'DATABASE_BACKUP', order: 2, label: 'Database Backup', description: 'Take verified pre-launch database backup' },
  { step: 'RELEASE_DEPLOYMENT', order: 3, label: 'Release Deployment', description: 'Deploy backend, CRM, and mobile releases' },
  { step: 'HEALTH_VALIDATION', order: 4, label: 'Health Validation', description: 'Validate API, workers, Redis, queues, monitoring' },
  { step: 'SMOKE_TESTING', order: 5, label: 'Smoke Testing', description: 'Run critical path smoke tests' },
  { step: 'BUSINESS_VALIDATION', order: 6, label: 'Business Validation', description: 'Validate lead, application, document, commission flows' },
  { step: 'LAUNCH_APPROVAL', order: 7, label: 'Launch Approval', description: 'Final launch authorization from command center' },
  { step: 'TRAFFIC_ENABLEMENT', order: 8, label: 'Traffic Enablement', description: 'Enable production traffic and monitor' },
] as const;

export const PRE_LAUNCH_CHECKS = [
  { id: 'production_env', label: 'Production Environment', category: 'INFRASTRUCTURE' },
  { id: 'database', label: 'Database', category: 'INFRASTRUCTURE' },
  { id: 'redis', label: 'Redis', category: 'INFRASTRUCTURE' },
  { id: 'workers', label: 'Workers', category: 'INFRASTRUCTURE' },
  { id: 'queues', label: 'Queues', category: 'INFRASTRUCTURE' },
  { id: 'monitoring', label: 'Monitoring', category: 'OPERATIONS' },
  { id: 'logging', label: 'Logging', category: 'OPERATIONS' },
  { id: 'error_tracking', label: 'Error Tracking', category: 'OPERATIONS' },
  { id: 'backup', label: 'Backup', category: 'OPERATIONS' },
  { id: 'disaster_recovery', label: 'Disaster Recovery', category: 'OPERATIONS' },
  { id: 'domains', label: 'Domains', category: 'INFRASTRUCTURE' },
  { id: 'ssl', label: 'SSL', category: 'SECURITY' },
  { id: 'ai_services', label: 'AI Services', category: 'AI' },
  { id: 'notification_services', label: 'Notification Services', category: 'NOTIFICATIONS' },
] as const;

export const PRODUCTION_VALIDATION_CHECKS = [
  'Backend APIs', 'CRM', 'Customer App', 'DSA App', 'Authentication', 'RBAC',
  'Data Scope', 'Analytics', 'Monitoring',
] as const;

export const BUSINESS_VALIDATION_CHECKS = [
  'Lead Creation', 'Application Creation', 'Document Upload', 'Referral Creation',
  'Commission Flow', 'Support Flow', 'AI Advisor', 'Voice AI',
] as const;

export const SMOKE_TESTS = [
  { id: 'login', label: 'Login', critical: true },
  { id: 'otp', label: 'OTP', critical: true },
  { id: 'dashboard', label: 'Dashboard', critical: true },
  { id: 'lead_creation', label: 'Lead Creation', critical: true },
  { id: 'application_creation', label: 'Application Creation', critical: true },
  { id: 'document_upload', label: 'Document Upload', critical: true },
  { id: 'notifications', label: 'Notifications', critical: false },
  { id: 'ai_advisor', label: 'AI Advisor', critical: false },
  { id: 'voice_ai', label: 'Voice AI', critical: false },
] as const;

export const TRAFFIC_METRICS = [
  'active_users', 'logins', 'api_requests', 'errors', 'response_times', 'application_submissions',
] as const;

export const MONITORING_WATCHLIST = [
  'cpu', 'memory', 'database', 'redis', 'queues', 'notifications', 'ai', 'errors',
] as const;

export const ALERT_CHANNELS = ['email', 'sms', 'whatsapp', 'webhook'] as const;

export const WAR_ROOM_TEAMS = [
  { id: 'launch', label: 'Launch Team', role: 'Launch Director' },
  { id: 'engineering', label: 'Engineering Team', role: 'Principal SRE / Backend Lead' },
  { id: 'operations', label: 'Operations Team', role: 'Production Operations Manager' },
  { id: 'security', label: 'Security Team', role: 'Security Lead' },
  { id: 'management', label: 'Management Team', role: 'CTO / Executive Sponsor' },
] as const;

export const COMMUNICATION_MATRIX = [
  { severity: 'SEV_1', notify: ['launch', 'engineering', 'operations', 'security', 'management'], channels: ['email', 'sms', 'whatsapp'] },
  { severity: 'SEV_2', notify: ['launch', 'engineering', 'operations'], channels: ['email', 'sms'] },
  { severity: 'SEV_3', notify: ['launch', 'engineering'], channels: ['email'] },
  { severity: 'SEV_4', notify: ['launch'], channels: ['email'] },
] as const;

export const INCIDENT_RUNBOOKS = {
  SEV_1: 'Immediate rollback assessment. War room ACTIVE. Notify all teams. Fix forward vs rollback decision within 15 minutes.',
  SEV_2: 'War room ACTIVE. Engineering + Ops on bridge. Customer comms draft within 30 minutes.',
  SEV_3: 'Assign owner. Track in incident dashboard. Daily status until resolved.',
  SEV_4: 'Log and triage. Resolve in next business window.',
} as const;

export const ROLLBACK_OPTIONS = [
  'Immediate Rollback', 'Application Rollback', 'Database Recovery', 'Traffic Rollback', 'Feature Rollback',
] as const;

export const LAUNCH_SUCCESS_CRITERIA = [
  'No Critical Errors',
  'No Major Outages',
  'No Security Incidents',
  'Core Business Flows Working',
  'Monitoring Active',
] as const;

export const LAUNCH_PERMISSIONS = {
  READ: 'launch.read',
  MANAGE: 'launch.manage',
  APPROVE: 'launch.approve',
  INCIDENT_MANAGE: 'incident.manage',
} as const;
