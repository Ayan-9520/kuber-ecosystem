export const PRODUCTION_PERMISSIONS = {
  READ: 'production.read',
  MANAGE: 'production.manage',
  DEPLOYMENT_MANAGE: 'deployment.manage',
  RELEASE_MANAGE: 'release.manage',
} as const;

export const PRODUCTION_DOMAINS = {
  api: 'api.kuberone.com',
  admin: 'admin.kuberone.com',
  customer: 'customer.kuberone.com',
  partner: 'partner.kuberone.com',
} as const;

export const GO_LIVE_GATES = [
  { id: 'critical_bugs', label: 'No critical unresolved bugs', check: 'errors' },
  { id: 'security', label: 'No critical security findings', check: 'security' },
  { id: 'uat_signoff', label: 'UAT signed off', check: 'uat' },
  { id: 'production_validation', label: 'Production validation passed', check: 'validation' },
  { id: 'monitoring', label: 'Monitoring configured', check: 'monitoring' },
  { id: 'backup', label: 'Backup validation passed', check: 'backup' },
] as const;

export const BUSINESS_SERVICES = [
  'customer-journey', 'dsa-journey', 'lead-lifecycle', 'application-lifecycle',
  'document-lifecycle', 'referral-lifecycle', 'commission-lifecycle', 'support-lifecycle',
] as const;

export const AI_SERVICES = [
  'ai-advisor', 'voice-ai', 'lead-scoring', 'recommendations',
  'knowledge-base', 'rag', 'content-generation',
] as const;

export const NOTIFICATION_SERVICES = [
  'email', 'sms', 'whatsapp', 'push', 'in-app',
] as const;
