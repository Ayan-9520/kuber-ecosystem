export const AUTH_ROUTES = {
  SEND_OTP: '/send-otp',
  VERIFY_OTP: '/verify-otp',
  LOGIN: '/login',
  REFRESH: '/refresh',
  LOGOUT: '/logout',
  LOGOUT_ALL: '/logout-all',
  ME: '/me',
  CHANGE_MOBILE_SEND_OTP: '/change-mobile/send-otp',
  CHANGE_MOBILE_VERIFY: '/change-mobile/verify',
} as const;

export const ORGANIZATION_SCOPE_ROLES = new Set([
  'SUPER_ADMIN',
  'ADMIN',
  'COMPLIANCE_MANAGER',
  'OPERATIONS_HEAD',
]);

export const REGION_SCOPE_ROLES = new Set(['REGIONAL_MANAGER', 'REGION_MANAGER']);

export const BRANCH_SCOPE_ROLES = new Set(['BRANCH_MANAGER']);

export const ASSIGNED_SCOPE_ROLES = new Set([
  'SALES_EXECUTIVE',
  'CREDIT_ANALYST',
  'OPS_EXECUTIVE',
  'CREDIT_EXECUTIVE',
  'OPERATIONS_EXECUTIVE',
]);
