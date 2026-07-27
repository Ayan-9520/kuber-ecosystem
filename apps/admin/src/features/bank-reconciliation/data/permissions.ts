import type { BcreRole } from './types';

export function resolveBcreRole(input: { roles?: string[]; permissions?: string[] }): BcreRole {
  const roles = input.roles ?? [];
  const perms = input.permissions ?? [];
  if (roles.includes('SUPER_ADMIN') || roles.includes('ADMIN')) return 'ADMIN';
  if (
    roles.includes('FINANCE') ||
    perms.includes('commissions.approve') ||
    perms.includes('commissions.pay')
  ) {
    return 'FINANCE';
  }
  return 'PARTNER';
}

export const BCRE_ACTIONS = {
  uploadStatement: ['FINANCE', 'ADMIN'] as BcreRole[],
  reconcile: ['FINANCE', 'ADMIN'] as BcreRole[],
  reviewMatch: ['FINANCE', 'ADMIN'] as BcreRole[],
  raiseDispute: ['FINANCE', 'ADMIN'] as BcreRole[],
  resolveDispute: ['FINANCE', 'ADMIN'] as BcreRole[],
  writeOff: ['FINANCE', 'ADMIN'] as BcreRole[],
  fullAudit: ['ADMIN', 'FINANCE'] as BcreRole[],
  export: ['FINANCE', 'ADMIN'] as BcreRole[],
} as const;

export type BcreAction = keyof typeof BCRE_ACTIONS;

export function canBcre(role: BcreRole, action: BcreAction): boolean {
  return BCRE_ACTIONS[action].includes(role);
}
