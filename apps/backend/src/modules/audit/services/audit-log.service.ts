import type { Prisma } from '@kuberone/database';
import type { ExportAuditLogsQuery, ListAuditLogsQuery } from '@kuberone/shared-validation';

import { prisma } from '../../../config/database.js';
import { NotFoundError } from '../../../shared/errors/app-error.js';
import { authAuditRepository } from '../../auth/repositories/audit.repository.js';

function buildWhere(query: ListAuditLogsQuery | ExportAuditLogsQuery): Prisma.AuditLogWhereInput {
  return {
    ...(query.userId ? { userId: query.userId } : {}),
    ...(query.action ? { action: query.action } : {}),
    ...(query.entityType ? { entityType: query.entityType } : {}),
    ...(query.entityId ? { entityId: query.entityId } : {}),
    ...(query.search
      ? {
          OR: [
            { action: { contains: query.search } },
            { entityType: { contains: query.search } },
            { requestId: { contains: query.search } },
          ],
        }
      : {}),
    ...(query.fromDate || query.toDate
      ? {
          createdAt: {
            ...(query.fromDate ? { gte: query.fromDate } : {}),
            ...(query.toDate ? { lte: query.toDate } : {}),
          },
        }
      : {}),
  };
}

function toCsv(items: Array<{
  id: string;
  userId: string | null;
  action: string;
  entityType: string;
  entityId: string | null;
  ipAddress: string | null;
  requestId: string | null;
  createdAt: Date;
}>): string {
  const header = 'id,userId,action,entityType,entityId,ipAddress,requestId,createdAt';
  const rows = items.map((item) =>
    [
      item.id,
      item.userId ?? '',
      item.action,
      item.entityType,
      item.entityId ?? '',
      item.ipAddress ?? '',
      item.requestId ?? '',
      item.createdAt.toISOString(),
    ]
      .map((v) => `"${String(v).replace(/"/g, '""')}"`)
      .join(','),
  );
  return [header, ...rows].join('\n');
}

export const auditLogService = {
  async list(query: ListAuditLogsQuery) {
    const where = buildWhere(query);
    const skip = (query.page - 1) * query.limit;
    const orderBy = { [query.sortBy]: query.sortOrder };

    const [items, total] = await Promise.all([
      prisma.auditLog.findMany({ where, skip, take: query.limit, orderBy }),
      prisma.auditLog.count({ where }),
    ]);

    return {
      items,
      meta: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit) || 1,
      },
    };
  },

  async getById(id: string) {
    const item = await prisma.auditLog.findUnique({ where: { id } });
    if (!item) throw new NotFoundError('AuditLog', id);
    return item;
  },

  async export(query: ExportAuditLogsQuery) {
    const where = buildWhere(query);
    const items = await prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 10_000,
    });

    await authAuditRepository.log({
      action: 'AUDIT_LOGS_EXPORTED',
      entityType: 'audit_log',
      newValues: { count: items.length },
    });

    return {
      format: 'csv' as const,
      contentType: 'text/csv',
      filename: `audit-logs-${Date.now()}.csv`,
      data: toCsv(items),
    };
  },
};
