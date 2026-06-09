import type { Prisma } from '@kuberone/database';
import type { PaginatedMeta } from '@kuberone/shared-types';

import type { RequestContext } from '../types/product.types.js';

export function buildPaginationMeta(page: number, limit: number, total: number): PaginatedMeta {
  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit) || 1,
  };
}

export async function auditProductMutation(
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
