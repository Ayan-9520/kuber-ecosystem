import type { Prisma } from '@kuberone/database';
import type { PaginatedMeta } from '@kuberone/shared-types';

import type { RequestContext } from '../types/support.types.js';

export function buildPaginationMeta(page: number, limit: number, total: number): PaginatedMeta {
  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit) || 1,
  };
}

export async function auditTicketMutation(
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
    entityType: 'ticket',
    entityId,
    newValues: newValues as Prisma.InputJsonValue,
    oldValues: oldValues as Prisma.InputJsonValue,
    ipAddress: ctx.ipAddress,
    userAgent: ctx.userAgent,
    requestId: ctx.requestId,
  });
}

export function generateTicketNumber(lastNumber?: string | null): string {
  if (lastNumber) {
    const match = lastNumber.match(/TKT-(\d+)/);
    if (match) {
      return `TKT-${String(parseInt(match[1]!, 10) + 1).padStart(6, '0')}`;
    }
  }
  return 'TKT-000001';
}

export function addHours(date: Date, hours: number): Date {
  return new Date(date.getTime() + hours * 60 * 60 * 1000);
}
