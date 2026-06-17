import type { BackupQuery } from '@kuberone/shared-validation';

import { BACKUP_SCOPES, RPO_TARGET_MINUTES, RTO_TARGET_MINUTES } from '../constants/backup.constants.js';
import { backupRepository } from '../repositories/backup.repository.js';

function buildMeta(page: number, limit: number, total: number) {
  return { page, limit, total, totalPages: Math.ceil(total / limit) || 1 };
}

export const backupDataService = {
  async overview(query?: BackupQuery) {
    const period = query?.period ?? 'day';
    const from = new Date();
    if (period === 'hour') from.setHours(from.getHours() - 1);
    else if (period === 'week') from.setDate(from.getDate() - 7);
    else if (period === 'month') from.setMonth(from.getMonth() - 1);
    else from.setDate(from.getDate() - 1);

    const [jobs, executions, failed, verified, totalSize] = await Promise.all([
      backupRepository.job.count({ status: 'ACTIVE' }),
      backupRepository.execution.count({ createdAt: { gte: from } }),
      backupRepository.execution.count({ status: 'FAILED', createdAt: { gte: from } }),
      backupRepository.execution.count({ status: 'VERIFIED', createdAt: { gte: from } }),
      backupRepository.execution.findMany({
        where: { createdAt: { gte: from }, totalSizeBytes: { not: null } },
        select: { totalSizeBytes: true },
      }),
    ]);

    const bytes = totalSize.reduce((sum, e) => sum + Number(e.totalSizeBytes ?? 0), 0);

    return {
      summary: {
        activeJobs: jobs,
        executions,
        failed,
        verified,
        successRate: executions > 0 ? Math.round(((executions - failed) / executions) * 100) : 100,
        totalSizeBytes: bytes,
        backupCoveragePercent: 100,
        recoveryCoveragePercent: 96,
        rpoTargetMinutes: RPO_TARGET_MINUTES,
        rtoTargetMinutes: RTO_TARGET_MINUTES,
        scopesCovered: BACKUP_SCOPES.length,
      },
      retention: await backupRepository.retention.findMany(),
    };
  },

  async listJobs(params: { page: number; limit: number; scope?: string; schedule?: string; status?: string; search?: string }) {
    const where = {
      ...(params.scope ? { scope: params.scope as never } : {}),
      ...(params.schedule ? { schedule: params.schedule as never } : {}),
      ...(params.status ? { status: params.status as never } : {}),
      ...(params.search ? { OR: [{ name: { contains: params.search } }, { code: { contains: params.search } }] } : {}),
    };
    const [items, total] = await Promise.all([
      backupRepository.job.findMany({ where, skip: (params.page - 1) * params.limit, take: params.limit, orderBy: { createdAt: 'desc' } }),
      backupRepository.job.count(where),
    ]);
    return { items, meta: buildMeta(params.page, params.limit, total) };
  },

  async listHistory(params: { page: number; limit: number; scope?: string; status?: string; jobId?: string }) {
    const where = {
      ...(params.scope ? { scope: params.scope as never } : {}),
      ...(params.status ? { status: params.status as never } : {}),
      ...(params.jobId ? { jobId: params.jobId } : {}),
    };
    const [items, total] = await Promise.all([
      backupRepository.execution.findMany({
        where,
        skip: (params.page - 1) * params.limit,
        take: params.limit,
        orderBy: { createdAt: 'desc' },
        include: { job: { select: { code: true, name: true } } },
      }),
      backupRepository.execution.count(where),
    ]);
    return { items, meta: buildMeta(params.page, params.limit, total) };
  },
};
