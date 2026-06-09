import type { Prisma } from '@kuberone/database';
import type { PaginatedMeta } from '@kuberone/shared-types';

import type { RequestContext } from '../types/notifications.types.js';

export function buildPaginationMeta(page: number, limit: number, total: number): PaginatedMeta {
  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit) || 1,
  };
}

export async function auditNotificationMutation(
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
    entityType: 'notification',
    entityId,
    newValues: newValues as Prisma.InputJsonValue,
    ipAddress: ctx.ipAddress,
    userAgent: ctx.userAgent,
    requestId: ctx.requestId,
  });
}

export function renderTemplateString(template: string, variables: Record<string, unknown>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key: string) => {
    const value = variables[key];
    return value !== undefined && value !== null ? String(value) : '';
  });
}

export function pct(numerator: number, denominator: number): number {
  if (denominator <= 0) return 0;
  return Math.round((numerator / denominator) * 10000) / 100;
}
