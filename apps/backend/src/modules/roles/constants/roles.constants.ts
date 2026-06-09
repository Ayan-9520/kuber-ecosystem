export const ROLE_HIERARCHY: Record<
  string,
  { level: number; inherits?: string[]; dataScope?: string }
> = {
  SUPER_ADMIN: { level: 100, dataScope: 'ORGANIZATION' },
  ADMIN: { level: 90, inherits: ['SUPER_ADMIN'], dataScope: 'ORGANIZATION' },
  MANAGEMENT: { level: 85, inherits: ['ADMIN'], dataScope: 'ORGANIZATION' },
  COMPLIANCE_MANAGER: { level: 80, inherits: ['ADMIN'], dataScope: 'ORGANIZATION' },
  REGIONAL_MANAGER: { level: 70, dataScope: 'REGION' },
  BRANCH_MANAGER: { level: 60, inherits: ['REGIONAL_MANAGER'], dataScope: 'BRANCH' },
  RELATIONSHIP_MANAGER: { level: 50, inherits: ['BRANCH_MANAGER'], dataScope: 'ASSIGNED' },
  SALES_EXECUTIVE: { level: 40, inherits: ['BRANCH_MANAGER'], dataScope: 'ASSIGNED' },
  CREDIT_EXECUTIVE: { level: 40, inherits: ['BRANCH_MANAGER'], dataScope: 'ORGANIZATION' },
  CREDIT_ANALYST: { level: 40, inherits: ['CREDIT_EXECUTIVE'], dataScope: 'ORGANIZATION' },
  OPERATIONS_EXECUTIVE: { level: 40, inherits: ['BRANCH_MANAGER'], dataScope: 'ORGANIZATION' },
  OPS_EXECUTIVE: { level: 40, inherits: ['OPERATIONS_EXECUTIVE'], dataScope: 'ORGANIZATION' },
  SUPPORT: { level: 30, dataScope: 'BRANCH' },
  DSA_PARTNER: { level: 10, dataScope: 'OWN' },
  CUSTOMER: { level: 5, dataScope: 'OWN' },
};

export const PROTECTED_SYSTEM_ROLES = new Set(['SUPER_ADMIN', 'ADMIN', 'CUSTOMER', 'DSA_PARTNER']);
