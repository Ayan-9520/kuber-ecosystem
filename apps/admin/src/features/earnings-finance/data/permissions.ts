import type { EarningsModuleDef, FinanceRole } from './types';

/** Map admin user → finance workspace role */
export function resolveFinanceRole(input: {
  roles?: string[];
  permissions?: string[];
}): FinanceRole {
  const roles = input.roles ?? [];
  const perms = input.permissions ?? [];

  if (roles.includes('SUPER_ADMIN') || roles.includes('ADMIN')) return 'SUPER_ADMIN';
  if (
    roles.includes('FINANCE') ||
    perms.includes('commissions.approve') ||
    perms.includes('commissions.pay')
  ) {
    return 'FINANCE';
  }
  return 'PARTNER';
}

export const EARNINGS_MODULES: EarningsModuleDef[] = [
  {
    id: 'earnings-dashboard',
    label: 'Earnings Dashboard',
    description: 'Overview of earnings, payouts and pending invoices',
    icon: 'LayoutDashboard',
    roles: ['PARTNER', 'FINANCE', 'SUPER_ADMIN'],
  },
  {
    id: 'commission-tracker',
    label: 'Commission Tracker',
    description: 'Track every commission case end-to-end',
    icon: 'Target',
    roles: ['PARTNER', 'FINANCE', 'SUPER_ADMIN'],
  },
  {
    id: 'raise-invoice',
    label: 'Raise Invoice',
    description: 'Submit invoice against approved commissions',
    icon: 'FilePlus',
    roles: ['PARTNER', 'SUPER_ADMIN'],
  },
  {
    id: 'invoice-approval',
    label: 'Invoice Approval',
    description: 'Verify, approve, reject or hold invoices',
    icon: 'ClipboardCheck',
    roles: ['FINANCE', 'SUPER_ADMIN'],
  },
  {
    id: 'invoice-timeline',
    label: 'Invoice Timeline',
    description: 'Full status history with timestamps and comments',
    icon: 'History',
    roles: ['PARTNER', 'FINANCE', 'SUPER_ADMIN'],
  },
  {
    id: 'wallet',
    label: 'Wallet',
    description: 'Available balance, holds and payout-ready amount',
    icon: 'Wallet',
    roles: ['PARTNER', 'FINANCE', 'SUPER_ADMIN'],
  },
  {
    id: 'pending',
    label: 'Pending Commission',
    description: 'Commissions awaiting verification',
    icon: 'Hourglass',
    roles: ['PARTNER', 'FINANCE', 'SUPER_ADMIN'],
  },
  {
    id: 'approved',
    label: 'Approved Commission',
    description: 'Approved and ready for invoicing / payout',
    icon: 'BadgeCheck',
    roles: ['PARTNER', 'FINANCE', 'SUPER_ADMIN'],
  },
  {
    id: 'processing',
    label: 'Processing Commission',
    description: 'In payment pipeline',
    icon: 'Loader',
    roles: ['PARTNER', 'FINANCE', 'SUPER_ADMIN'],
  },
  {
    id: 'paid',
    label: 'Paid Commission',
    description: 'Successfully paid to partner',
    icon: 'Banknote',
    roles: ['PARTNER', 'FINANCE', 'SUPER_ADMIN'],
  },
  {
    id: 'rejected',
    label: 'Rejected Commission',
    description: 'Rejected with finance comments',
    icon: 'XCircle',
    roles: ['PARTNER', 'FINANCE', 'SUPER_ADMIN'],
  },
  {
    id: 'payout-history',
    label: 'Payout History',
    description: 'Past payouts and payment advice',
    icon: 'Receipt',
    roles: ['PARTNER', 'FINANCE', 'SUPER_ADMIN'],
  },
  {
    id: 'ledger',
    label: 'Ledger',
    description: 'Double-entry style commission ledger',
    icon: 'BookOpen',
    roles: ['PARTNER', 'FINANCE', 'SUPER_ADMIN'],
  },
  {
    id: 'tds-centre',
    label: 'TDS Centre',
    description: 'TDS deductions, certificates and config',
    icon: 'Percent',
    roles: ['PARTNER', 'FINANCE', 'SUPER_ADMIN'],
  },
  {
    id: 'gst-reports',
    label: 'GST Reports',
    description: 'GST on commissions and invoices',
    icon: 'FileSpreadsheet',
    roles: ['PARTNER', 'FINANCE', 'SUPER_ADMIN'],
  },
  {
    id: 'statements',
    label: 'Download Statements',
    description: 'Monthly / custom statements export',
    icon: 'Download',
    roles: ['PARTNER', 'FINANCE', 'SUPER_ADMIN'],
  },
  {
    id: 'incentives',
    label: 'Incentive Tracker',
    description: 'Rank / badge / campaign incentives',
    icon: 'Trophy',
    roles: ['PARTNER', 'FINANCE', 'SUPER_ADMIN'],
  },
  {
    id: 'bonuses',
    label: 'Bonus Tracker',
    description: 'Performance and festival bonuses',
    icon: 'Gift',
    roles: ['PARTNER', 'FINANCE', 'SUPER_ADMIN'],
  },
  {
    id: 'referral-income',
    label: 'Referral Income',
    description: 'Partner referral earnings',
    icon: 'Users',
    roles: ['PARTNER', 'FINANCE', 'SUPER_ADMIN'],
  },
  {
    id: 'analytics',
    label: 'Analytics Dashboard',
    description: 'Earnings trends and product mix',
    icon: 'BarChart3',
    roles: ['PARTNER', 'FINANCE', 'SUPER_ADMIN'],
  },
];

/** Action-level RBAC */
export const FINANCE_ACTIONS = {
  viewEarnings: ['PARTNER', 'FINANCE', 'SUPER_ADMIN'] as FinanceRole[],
  raiseInvoice: ['PARTNER', 'SUPER_ADMIN'] as FinanceRole[],
  trackInvoice: ['PARTNER', 'FINANCE', 'SUPER_ADMIN'] as FinanceRole[],
  downloadReports: ['PARTNER', 'FINANCE', 'SUPER_ADMIN'] as FinanceRole[],
  verifyInvoice: ['FINANCE', 'SUPER_ADMIN'] as FinanceRole[],
  approveRejectInvoice: ['FINANCE', 'SUPER_ADMIN'] as FinanceRole[],
  holdClarification: ['FINANCE', 'SUPER_ADMIN'] as FinanceRole[],
  schedulePayment: ['FINANCE', 'SUPER_ADMIN'] as FinanceRole[],
  generatePaymentAdvice: ['FINANCE', 'SUPER_ADMIN'] as FinanceRole[],
  overrideApprovals: ['SUPER_ADMIN'] as FinanceRole[],
  configurePayoutRules: ['SUPER_ADMIN'] as FinanceRole[],
  manageTds: ['SUPER_ADMIN'] as FinanceRole[],
  manageGst: ['SUPER_ADMIN'] as FinanceRole[],
  bulkPayments: ['SUPER_ADMIN'] as FinanceRole[],
  exportReports: ['FINANCE', 'SUPER_ADMIN'] as FinanceRole[],
  viewAuditLogs: ['SUPER_ADMIN'] as FinanceRole[],
} as const;

export type FinanceAction = keyof typeof FINANCE_ACTIONS;

export function canFinanceAction(role: FinanceRole, action: FinanceAction): boolean {
  return FINANCE_ACTIONS[action].includes(role);
}

export function modulesForRole(role: FinanceRole): EarningsModuleDef[] {
  return EARNINGS_MODULES.filter((m) => m.roles.includes(role));
}
