import type { Prisma } from '@kuberone/database';
import type { PaginatedMeta } from '@kuberone/shared-types';

import type { RequestContext } from '../types/applications.types.js';

export function buildPaginationMeta(page: number, limit: number, total: number): PaginatedMeta {
  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit) || 1,
  };
}

export async function auditApplicationMutation(
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
  entityType: string,
  entityId: string,
  newValues?: unknown,
  oldValues?: unknown,
): Promise<void> {
  await log({
    userId: ctx.actorId,
    action,
    entityType,
    entityId,
    newValues: newValues as Prisma.InputJsonValue,
    oldValues: oldValues as Prisma.InputJsonValue,
    ipAddress: ctx.ipAddress,
    userAgent: ctx.userAgent,
    requestId: ctx.requestId,
  });
}

let appSequence = 0;

export function generateApplicationNumber(lastNumber?: string | null): string {
  if (lastNumber) {
    const match = lastNumber.match(/KFA-(\d+)/);
    if (match) {
      const next = parseInt(match[1]!, 10) + 1;
      return `KFA-${String(next).padStart(6, '0')}`;
    }
  }
  appSequence += 1;
  return `KFA-${String(Date.now()).slice(-6)}${String(appSequence).padStart(2, '0')}`;
}

import { calculateEmi as calculateSharedEmi } from '@kuberone/shared-utils';

export function calculateEmi(principal: number, annualRate: number, tenureMonths: number): number {
  return calculateSharedEmi(principal, annualRate, tenureMonths);
}
