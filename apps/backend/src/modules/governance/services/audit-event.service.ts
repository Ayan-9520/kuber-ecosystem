import type { Prisma } from '@kuberone/database';
import type { ExportAuditEventsQuery, ListAuditEventsQuery } from '@kuberone/shared-validation';


import { prisma } from '../../../config/database.js';
import { NotFoundError } from '../../../shared/errors/app-error.js';
import { governanceRepository } from '../repositories/governance.repository.js';

function buildWhere(query: ListAuditEventsQuery | ExportAuditEventsQuery): Prisma.AuditEventWhereInput {
  return {
    ...(query.source ? { source: query.source as never } : {}),
    ...(query.action ? { action: query.action as never } : {}),
    ...(query.entityType ? { entityType: query.entityType } : {}),
    ...(query.entityId ? { entityId: query.entityId } : {}),
    ...(query.userId ? { userId: query.userId } : {}),
    ...(query.search
      ? {
          OR: [
            { entityType: { contains: query.search } },
            { traceId: { contains: query.search } },
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

function toCsv(items: Array<Record<string, unknown>>): string {
  const header = 'id,traceId,source,action,entityType,entityId,userId,ipAddress,integrityHash,createdAt';
  const rows = items.map((item) =>
    [item.id, item.traceId, item.source, item.action, item.entityType, item.entityId ?? '', item.userId ?? '', item.ipAddress ?? '', item.integrityHash, item.createdAt]
      .map((v) => `"${String(v).replace(/"/g, '""')}"`)
      .join(','),
  );
  return [header, ...rows].join('\n');
}

function paginationMeta(page: number, limit: number, total: number) {
  return { page, limit, total, totalPages: Math.ceil(total / limit) || 1 };
}

export const auditEventService = {
  async list(query: ListAuditEventsQuery) {
    const where = buildWhere(query);
    const skip = (query.page - 1) * query.limit;
    const orderBy = { [query.sortBy]: query.sortOrder };

    const [items, total] = await Promise.all([
      governanceRepository.auditEvent.findMany({
        where,
        skip,
        take: query.limit,
        orderBy,
        include: { user: { select: { id: true, email: true } } },
      }),
      governanceRepository.auditEvent.count(where),
    ]);

    return { items, meta: paginationMeta(query.page, query.limit, total) };
  },

  async getById(id: string) {
    const item = await governanceRepository.auditEvent.findById(id);
    if (!item) throw new NotFoundError('AuditEvent', id);
    return item;
  },

  async searchUnified(query: ListAuditEventsQuery) {
    const eventResult = await this.list(query);

    if (eventResult.meta.total > 0) return eventResult;

    const legacyWhere: Prisma.AuditLogWhereInput = {
      ...(query.userId ? { userId: query.userId } : {}),
      ...(query.entityType ? { entityType: query.entityType } : {}),
      ...(query.entityId ? { entityId: query.entityId } : {}),
      ...(query.fromDate || query.toDate
        ? {
            createdAt: {
              ...(query.fromDate ? { gte: query.fromDate } : {}),
              ...(query.toDate ? { lte: query.toDate } : {}),
            },
          }
        : {}),
    };

    const skip = (query.page - 1) * query.limit;
    const [legacy, legacyTotal] = await Promise.all([
      prisma.auditLog.findMany({ where: legacyWhere, skip, take: query.limit, orderBy: { createdAt: 'desc' } }),
      prisma.auditLog.count({ where: legacyWhere }),
    ]);

    const items = legacy.map((log) => ({
      id: log.id,
      traceId: log.requestId ?? log.id,
      source: 'SYSTEM' as const,
      action: log.action as never,
      entityType: log.entityType,
      entityId: log.entityId,
      userId: log.userId,
      beforeValue: log.oldValues,
      afterValue: log.newValues,
      ipAddress: log.ipAddress,
      userAgent: log.userAgent,
      requestId: log.requestId,
      integrityHash: '',
      createdAt: log.createdAt,
      user: null,
      legacy: true,
    }));

    return { items, meta: paginationMeta(query.page, query.limit, legacyTotal) };
  },

  async dashboard(query: { fromDate?: Date; toDate?: Date }) {
    const dateFilter = query.fromDate || query.toDate
      ? {
          createdAt: {
            ...(query.fromDate ? { gte: query.fromDate } : {}),
            ...(query.toDate ? { lte: query.toDate } : {}),
          },
        }
      : {};

    const [totalEvents, bySource, byAction, recentExports] = await Promise.all([
      governanceRepository.auditEvent.count(dateFilter),
      prisma.auditEvent.groupBy({ by: ['source'], where: dateFilter, _count: { id: true } }),
      prisma.auditEvent.groupBy({ by: ['action'], where: dateFilter, _count: { id: true }, orderBy: { _count: { id: 'desc' } }, take: 10 }),
      governanceRepository.auditExport.findMany({ take: 5, orderBy: { exportedAt: 'desc' } }),
    ]);

    const legacyWhere: Prisma.AuditLogWhereInput =
      query.fromDate || query.toDate
        ? {
            createdAt: {
              ...(query.fromDate ? { gte: query.fromDate } : {}),
              ...(query.toDate ? { lte: query.toDate } : {}),
            },
          }
        : {};
    const legacyCount = await prisma.auditLog.count({ where: legacyWhere });

    return {
      summary: {
        totalEvents: totalEvents + legacyCount,
        centralizedEvents: totalEvents,
        legacyEvents: legacyCount,
        exportCount: recentExports.length,
      },
      bySource: bySource.map((s) => ({ source: s.source, count: s._count.id })),
      byAction: byAction.map((a) => ({ action: a.action, count: a._count.id })),
      recentExports,
    };
  },

  async export(query: ExportAuditEventsQuery, actorId: string) {
    const where = buildWhere(query);
    const items = await governanceRepository.auditEvent.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 10_000,
      include: { user: { select: { email: true } } },
    });

    const format = query.format ?? 'CSV';
    const fileName = `audit-events-${Date.now()}.${format.toLowerCase()}`;

    await governanceRepository.auditExport.create({
      exportType: 'AUDIT_EVENTS',
      format: format as never,
      filters: query as never,
      fileName,
      rowCount: items.length,
      exportedBy: { connect: { id: actorId } },
    });

    if (format === 'JSON') {
      return {
        format: 'json' as const,
        contentType: 'application/json',
        filename: fileName,
        data: JSON.stringify(items, null, 2),
      };
    }

    return {
      format: 'csv' as const,
      contentType: 'text/csv',
      filename: fileName,
      data: toCsv(items as never),
    };
  },
};
