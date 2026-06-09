import type { Prisma } from '@kuberone/database';
import type { PaginatedMeta } from '@kuberone/shared-types';

import {
  ADJUSTMENT_NUMBER_PREFIX,
  APPROVAL_NUMBER_PREFIX,
  LEDGER_NUMBER_PREFIX,
  PAYMENT_NUMBER_PREFIX,
  RECOVERY_NUMBER_PREFIX,
} from '../constants/commissions.constants.js';
import type { RequestContext } from '../types/commissions.types.js';

export function buildPaginationMeta(page: number, limit: number, total: number): PaginatedMeta {
  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit) || 1,
  };
}

export function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

export async function auditCommissionMutation(
  log: (data: {
    userId?: string;
    action: string;
    entityType: string;
    entityId?: string;
    oldValues?: Prisma.InputJsonValue;
    newValues?: Prisma.InputJsonValue;
    ipAddress?: string;
    userAgent?: string;
    requestId?: string;
  }) => Promise<unknown>,
  ctx: RequestContext,
  action: string,
  entityId: string,
  newValues?: unknown,
): Promise<void> {
  await log({
    userId: ctx.actorId,
    action,
    entityType: 'commission',
    entityId,
    newValues: newValues as Prisma.InputJsonValue,
    ipAddress: ctx.ipAddress,
    userAgent: ctx.userAgent,
    requestId: ctx.requestId,
  });
}

function nextNumber(prefix: string, last?: string | null): string {
  if (last) {
    const match = last.match(new RegExp(`${prefix}-(\\d+)`));
    if (match) {
      return `${prefix}-${String(parseInt(match[1]!, 10) + 1).padStart(6, '0')}`;
    }
  }
  return `${prefix}-000001`;
}

export function generateLedgerNumber(last?: string | null): string {
  return nextNumber(LEDGER_NUMBER_PREFIX, last);
}

export function generateApprovalNumber(last?: string | null): string {
  return nextNumber(APPROVAL_NUMBER_PREFIX, last);
}

export function generatePaymentNumber(last?: string | null): string {
  return nextNumber(PAYMENT_NUMBER_PREFIX, last);
}

export function generateAdjustmentNumber(last?: string | null): string {
  return nextNumber(ADJUSTMENT_NUMBER_PREFIX, last);
}

export function generateRecoveryNumber(last?: string | null): string {
  return nextNumber(RECOVERY_NUMBER_PREFIX, last);
}

export function ledgerToCsv(
  rows: Array<{
    ledgerNumber: string;
    partner?: { partnerCode: string; businessName: string | null } | null;
    commissionType: string;
    status: string;
    baseAmount: unknown;
    commissionAmount: unknown;
    createdAt: Date;
  }>,
): string {
  const header = 'Ledger Number,Partner Code,Partner Name,Type,Status,Base Amount,Commission Amount,Created At';
  const lines = rows.map((row) =>
    [
      row.ledgerNumber,
      row.partner?.partnerCode ?? '',
      row.partner?.businessName ?? '',
      row.commissionType,
      row.status,
      Number(row.baseAmount),
      Number(row.commissionAmount),
      row.createdAt.toISOString(),
    ].join(','),
  );
  return [header, ...lines].join('\n');
}
