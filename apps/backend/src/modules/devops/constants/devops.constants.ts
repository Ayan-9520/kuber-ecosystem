export const DEVOPS_PERMISSIONS = {
  READ: 'devops.read',
  DEPLOY: 'devops.deploy',
  ROLLBACK: 'devops.rollback',
  MANAGE: 'devops.manage',
} as const;

export const DEVOPS_COMPONENTS = [
  'backend',
  'admin',
  'worker',
  'monitoring',
  'mobile-customer',
  'mobile-dsa',
] as const;
