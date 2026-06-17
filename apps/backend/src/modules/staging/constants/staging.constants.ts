export const STAGING_PERMISSIONS = {
  READ: 'staging.read',
  MANAGE: 'staging.manage',
  RELEASE_MANAGE: 'release.manage',
} as const;

export const STAGING_DOMAINS = {
  api: 'staging-api.kuberone.com',
  admin: 'staging-admin.kuberone.com',
  customer: 'staging-customer.kuberone.com',
  partner: 'staging-partner.kuberone.com',
} as const;

export const PRE_DEPLOY_CHECKLIST = [
  'PR validation passed',
  'Security scan clean',
  'Database backup completed',
  'Migration gate passed',
  'OpenAPI validation passed',
  'Staging branch up to date',
] as const;

export const POST_DEPLOY_CHECKLIST = [
  'Health /health/live OK',
  'Health /health/ready OK',
  'Deep health check passed',
  'CRM login verified',
  'API smoke tests passed',
  'Monitoring dashboards green',
  'Error rate within threshold',
] as const;

export const ROLLBACK_CHECKLIST = [
  'Rollback target version identified',
  'Database backup verified',
  'Rollback script tested on staging',
  'Stakeholders notified',
  'Post-rollback health verified',
] as const;
