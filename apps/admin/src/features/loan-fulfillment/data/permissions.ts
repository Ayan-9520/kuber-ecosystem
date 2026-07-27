import type { LoanFulfillmentRole } from './types';

/** Map admin user → loan fulfillment workspace role */
export function resolveLoanFulfillmentRole(input: {
  roles?: string[];
  permissions?: string[];
}): LoanFulfillmentRole {
  const roles = (input.roles ?? []).map((r) => r.toUpperCase());
  const perms = input.permissions ?? [];

  if (roles.includes('SUPER_ADMIN')) return 'SUPER_ADMIN';
  if (roles.includes('ADMIN')) return 'ADMIN';
  if (roles.includes('FINANCE') || perms.includes('loan_fulfillment.finance') || perms.includes('commissions.approve')) {
    return 'FINANCE';
  }
  if (roles.includes('OPERATIONS') || perms.includes('loan_fulfillment.operate')) {
    return 'OPERATIONS';
  }
  if (roles.includes('TEAM_LEADER') || roles.includes('TEAM LEADER')) return 'TEAM_LEADER';
  if (roles.includes('SALES') || roles.includes('RELATIONSHIP_MANAGER') || perms.includes('loan_fulfillment.write')) {
    return 'SALES';
  }
  if (roles.includes('PARTNER') || roles.includes('DSA') || perms.includes('partners.self')) {
    return 'PARTNER';
  }
  if (perms.includes('loan_fulfillment.configure') || perms.includes('loan_fulfillment.write')) {
    return 'OPERATIONS';
  }
  return 'PARTNER';
}

export const LF_ACTIONS = {
  viewDashboard: ['SUPER_ADMIN', 'ADMIN', 'FINANCE', 'OPERATIONS', 'SALES', 'TEAM_LEADER', 'PARTNER'] as LoanFulfillmentRole[],
  viewCases: ['SUPER_ADMIN', 'ADMIN', 'FINANCE', 'OPERATIONS', 'SALES', 'TEAM_LEADER', 'PARTNER'] as LoanFulfillmentRole[],
  createCase: ['SUPER_ADMIN', 'ADMIN', 'OPERATIONS', 'SALES', 'TEAM_LEADER'] as LoanFulfillmentRole[],
  editCase: ['SUPER_ADMIN', 'ADMIN', 'OPERATIONS', 'SALES', 'TEAM_LEADER'] as LoanFulfillmentRole[],
  viewInternalNotes: ['SUPER_ADMIN', 'ADMIN', 'FINANCE', 'OPERATIONS', 'SALES', 'TEAM_LEADER'] as LoanFulfillmentRole[],
  viewFullRevenue: ['SUPER_ADMIN', 'ADMIN', 'FINANCE', 'OPERATIONS'] as LoanFulfillmentRole[],
  editDistribution: ['SUPER_ADMIN', 'ADMIN', 'FINANCE'] as LoanFulfillmentRole[],
  approvePayouts: ['SUPER_ADMIN', 'ADMIN', 'FINANCE'] as LoanFulfillmentRole[],
  configureRevenueRules: ['SUPER_ADMIN', 'ADMIN', 'FINANCE'] as LoanFulfillmentRole[],
  viewAllStakeholders: ['SUPER_ADMIN', 'ADMIN', 'FINANCE', 'OPERATIONS', 'TEAM_LEADER'] as LoanFulfillmentRole[],
} as const;

export type LoanFulfillmentAction = keyof typeof LF_ACTIONS;

export function canLoanFulfillmentAction(role: LoanFulfillmentRole, action: LoanFulfillmentAction): boolean {
  return LF_ACTIONS[action].includes(role);
}

export function isPartnerRole(role: LoanFulfillmentRole): boolean {
  return role === 'PARTNER';
}
