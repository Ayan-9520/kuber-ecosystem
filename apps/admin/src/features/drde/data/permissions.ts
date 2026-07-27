import type { DrdeModuleDef, DrdeRole, StakeholderShare } from './types';

export function resolveDrdeRole(input: { roles?: string[]; permissions?: string[] }): DrdeRole {
  const roles = input.roles ?? [];
  const perms = input.permissions ?? [];

  if (roles.includes('SUPER_ADMIN') || roles.includes('ADMIN')) return 'ADMIN';
  if (roles.includes('FINANCE') || perms.includes('commissions.approve') || perms.includes('commissions.pay')) {
    return 'FINANCE';
  }
  if (roles.includes('MANAGER') || roles.includes('BRANCH_MANAGER')) return 'MANAGER';
  if (roles.includes('SALES_COORDINATOR') || roles.includes('COORDINATOR')) return 'SALES_COORDINATOR';
  if (roles.includes('CALLER') || roles.includes('TELECALLER')) return 'CALLER';
  if (roles.includes('PARTNER') || roles.includes('DSA')) return 'PARTNER';
  return 'FINANCE';
}

export const DRDE_MODULES: DrdeModuleDef[] = [
  {
    id: 'revenue-distribution',
    label: 'Revenue Distribution',
    description: 'Configure stakeholder shares, GST & TDS per rule',
    roles: ['ADMIN', 'FINANCE', 'MANAGER'],
  },
  {
    id: 'simulate',
    label: 'Simulate',
    description: 'Preview allocations for a gross revenue amount',
    roles: ['ADMIN', 'FINANCE', 'MANAGER', 'PARTNER'],
  },
  {
    id: 'runs',
    label: 'Distribution Runs',
    description: 'Persisted distribution results against cases',
    roles: ['ADMIN', 'FINANCE', 'MANAGER', 'PARTNER'],
  },
  {
    id: 'audit-log',
    label: 'Audit Log',
    description: 'History of rule and run changes',
    roles: ['ADMIN', 'FINANCE', 'MANAGER'],
  },
];

export const DRDE_ACTIONS = {
  viewRules: ['ADMIN', 'FINANCE', 'MANAGER', 'PARTNER', 'CALLER', 'SALES_COORDINATOR'] as DrdeRole[],
  configureDistribution: ['ADMIN', 'FINANCE'] as DrdeRole[],
  editPayouts: ['ADMIN', 'FINANCE'] as DrdeRole[],
  simulate: ['ADMIN', 'FINANCE', 'MANAGER', 'PARTNER'] as DrdeRole[],
  createRun: ['ADMIN', 'FINANCE'] as DrdeRole[],
  viewAudit: ['ADMIN', 'FINANCE', 'MANAGER'] as DrdeRole[],
  exportReports: ['ADMIN', 'FINANCE'] as DrdeRole[],
} as const;

export type DrdeAction = keyof typeof DRDE_ACTIONS;

export function canDrdeAction(role: DrdeRole, action: DrdeAction): boolean {
  return DRDE_ACTIONS[action].includes(role);
}

/** Client-side share sum helper for editor UX (server still validates). */
export function sumPercentShares(stakeholders: StakeholderShare[]): number {
  return stakeholders
    .filter((s) => s.mode === 'PERCENT')
    .reduce((acc, s) => acc + (Number(s.percentage) || 0), 0);
}

export function isShareSumValid(stakeholders: StakeholderShare[], tolerance = 0.01): boolean {
  const percentShares = stakeholders.filter((s) => s.mode === 'PERCENT');
  if (!percentShares.length) return stakeholders.length > 0;
  return Math.abs(sumPercentShares(stakeholders) - 100) <= tolerance;
}
