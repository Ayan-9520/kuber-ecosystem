import type { Prisma } from '@kuberone/database';

export interface RequestContext {
  actorId: string;
  ipAddress?: string;
  userAgent?: string;
  requestId?: string;
}

export const ledgerInclude = {
  partner: { select: { id: true, partnerCode: true, businessName: true, contactName: true } },
  rule: { select: { id: true, ruleCode: true, name: true } },
  lead: { select: { id: true, leadNumber: true } },
  application: { select: { id: true, applicationNumber: true } },
  referral: { select: { id: true, referralCode: true } },
  branch: { select: { id: true, code: true, name: true } },
  product: { select: { id: true, code: true, name: true } },
  lender: { select: { id: true, code: true, name: true } },
  createdBy: { select: { id: true, email: true } },
} satisfies Prisma.CommissionLedgerInclude;

export const paymentInclude = {
  partner: { select: { id: true, partnerCode: true, businessName: true } },
  items: { include: { ledger: { select: { id: true, ledgerNumber: true, commissionAmount: true } } } },
  createdBy: { select: { id: true, email: true } },
  approvedBy: { select: { id: true, email: true } },
  releasedBy: { select: { id: true, email: true } },
} satisfies Prisma.CommissionPaymentInclude;

export interface SlabDefinition {
  minAmount: number;
  maxAmount?: number;
  percentage?: number;
  fixedAmount?: number;
}

export interface CalculationResult {
  commissionAmount: number;
  ruleId: string | null;
  calculationMethod: string;
  calculationDetails: Record<string, unknown>;
}
