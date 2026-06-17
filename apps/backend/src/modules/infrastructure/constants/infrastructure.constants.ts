export const INFRASTRUCTURE_PERMISSIONS = {
  READ: 'infrastructure.read',
  MANAGE: 'infrastructure.manage',
  DEPLOYMENT_MANAGE: 'deployment.manage',
} as const;

export const PRODUCTION_DOMAINS = [
  'api.kuberone.com',
  'admin.kuberone.com',
  'customer.kuberone.com',
  'partner.kuberone.com',
] as const;

export const TARGET_SCALE = {
  users: 10_000,
  concurrentUsers: 1_000,
  multiRegion: true,
  ha: true,
  drReady: true,
} as const;
