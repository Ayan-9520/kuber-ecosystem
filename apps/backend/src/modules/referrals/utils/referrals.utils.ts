import { randomBytes } from 'crypto';

import type { Prisma } from '@kuberone/database';
import type { PaginatedMeta } from '@kuberone/shared-types';

import { DEFAULT_REFERRAL_EXPIRY_DAYS, REFERRAL_CODE_PREFIX, REFERRAL_NUMBER_PREFIX } from '../constants/referrals.constants.js';
import type { RequestContext } from '../types/referrals.types.js';

export function buildPaginationMeta(page: number, limit: number, total: number): PaginatedMeta {
  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit) || 1,
  };
}

export async function auditReferralMutation(
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
  oldValues?: unknown,
): Promise<void> {
  await log({
    userId: ctx.actorId,
    action,
    entityType: 'referral',
    entityId,
    newValues: newValues as Prisma.InputJsonValue,
    oldValues: oldValues as Prisma.InputJsonValue,
    ipAddress: ctx.ipAddress,
    userAgent: ctx.userAgent,
    requestId: ctx.requestId,
  });
}

export function generateReferralNumber(lastNumber?: string | null): string {
  if (lastNumber) {
    const match = lastNumber.match(/KRF-(\d+)/);
    if (match) {
      return `${REFERRAL_NUMBER_PREFIX}-${String(parseInt(match[1]!, 10) + 1).padStart(6, '0')}`;
    }
  }
  return `${REFERRAL_NUMBER_PREFIX}-000001`;
}

export function generateReferralCode(referrerPhone?: string | null): string {
  const suffix = randomBytes(3).toString('hex').toUpperCase();
  if (referrerPhone) {
    const tail = referrerPhone.slice(-4);
    return `${REFERRAL_CODE_PREFIX}${tail}${suffix}`.slice(0, 20);
  }
  return `${REFERRAL_CODE_PREFIX}${suffix}${randomBytes(2).toString('hex').toUpperCase()}`.slice(0, 20);
}

export function defaultExpiryDate(): Date {
  const date = new Date();
  date.setDate(date.getDate() + DEFAULT_REFERRAL_EXPIRY_DAYS);
  return date;
}

export function isReferralExpired(expiresAt: Date | null | undefined): boolean {
  if (!expiresAt) return false;
  return expiresAt.getTime() < Date.now();
}
