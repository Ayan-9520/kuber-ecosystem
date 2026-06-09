import type { Prisma } from '@kuberone/database';
import type { PaginatedMeta } from '@kuberone/shared-types';

import type { RequestContext } from '../types/leads.types.js';

export function buildPaginationMeta(page: number, limit: number, total: number): PaginatedMeta {
  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit) || 1,
  };
}

export async function auditLeadMutation(
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

let leadSequence = 0;

export function generateLeadNumber(lastNumber?: string | null): string {
  if (lastNumber) {
    const match = lastNumber.match(/KFL-(\d+)/);
    if (match) {
      const next = parseInt(match[1]!, 10) + 1;
      return `KFL-${String(next).padStart(6, '0')}`;
    }
  }
  leadSequence += 1;
  return `KFL-${String(Date.now()).slice(-6)}${String(leadSequence).padStart(2, '0')}`;
}

export function computeSlaDeadline(grade: string): Date | null {
  const hours: Record<string, number> = {
    A_PLUS: 1,
    A: 4,
    B: 24,
    C: 48,
    REJECTED: 0,
  };
  const h = hours[grade];
  if (!h) return null;
  return new Date(Date.now() + h * 60 * 60 * 1000);
}

export function scoreToGrade(score: number): 'A_PLUS' | 'A' | 'B' | 'C' | 'REJECTED' {
  if (score >= 90) return 'A_PLUS';
  if (score >= 75) return 'A';
  if (score >= 50) return 'B';
  if (score >= 20) return 'C';
  return 'REJECTED';
}

export function leadsToCsv(
  rows: {
    leadNumber: string;
    prospectName: string;
    prospectPhone: string;
    status: string;
    grade: string | null;
    score: unknown;
    requestedAmount: unknown;
    createdAt: Date;
  }[],
): string {
  const header = 'Lead Number,Prospect Name,Phone,Status,Grade,Score,Requested Amount,Created At';
  const lines = rows.map((r) =>
    [
      r.leadNumber,
      `"${r.prospectName.replace(/"/g, '""')}"`,
      r.prospectPhone,
      r.status,
      r.grade ?? '',
      r.score?.toString() ?? '',
      r.requestedAmount?.toString() ?? '',
      r.createdAt.toISOString(),
    ].join(','),
  );
  return [header, ...lines].join('\n');
}
