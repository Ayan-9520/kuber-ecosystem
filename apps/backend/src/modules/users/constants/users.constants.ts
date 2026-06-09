export const USER_TYPES = {
  CUSTOMER: 'CUSTOMER',
  PARTNER: 'PARTNER',
  EMPLOYEE: 'EMPLOYEE',
  ADMIN: 'ADMIN',
} as const;

export const USER_TYPE_LABELS: Record<string, string> = {
  CUSTOMER: 'Customer',
  PARTNER: 'DSA / Referral Partner',
  EMPLOYEE: 'Employee',
  ADMIN: 'Admin',
};

export const EMPLOYEE_ROLE_CODES = [
  'SALES_EXECUTIVE',
  'RELATIONSHIP_MANAGER',
  'CREDIT_EXECUTIVE',
  'CREDIT_ANALYST',
  'OPERATIONS_EXECUTIVE',
  'OPS_EXECUTIVE',
  'BRANCH_MANAGER',
  'REGIONAL_MANAGER',
  'SUPPORT',
  'COMPLIANCE_MANAGER',
  'ADMIN',
  'SUPER_ADMIN',
] as const;
