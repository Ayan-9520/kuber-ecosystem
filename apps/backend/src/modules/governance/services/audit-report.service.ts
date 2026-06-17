import type { AuthenticatedUser } from '@kuberone/shared-types';
import type { CreateAuditReportInput } from '@kuberone/shared-validation';

import { prisma } from '../../../config/database.js';
import { ConflictError } from '../../../shared/errors/app-error.js';
import { governanceRepository } from '../repositories/governance.repository.js';

import { auditEventService } from './audit-event.service.js';

function paginationMeta(page: number, limit: number, total: number) {
  return { page, limit, total, totalPages: Math.ceil(total / limit) || 1 };
}

export const auditReportService = {
  async list(_actor: AuthenticatedUser, page: number, limit: number) {
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      governanceRepository.auditReport.findMany({ skip, take: limit, orderBy: { createdAt: 'desc' } }),
      prisma.auditReport.count(),
    ]);
    return { items, meta: paginationMeta(page, limit, total) };
  },

  async create(actor: AuthenticatedUser, input: CreateAuditReportInput) {
    const existing = await prisma.auditReport.findUnique({ where: { code: input.code } });
    if (existing) throw new ConflictError(`Report code "${input.code}" already exists`);

    const report = await governanceRepository.auditReport.create({
      code: input.code,
      name: input.name,
      description: input.description,
      reportType: input.reportType,
      filters: input.filters as never,
      format: input.format as never,
      status: 'GENERATING',
      generatedBy: { connect: { id: actor.id } },
    });

    const exportResult = await auditEventService.export(
      {
        format: input.format,
        ...(input.filters as object),
      } as never,
      actor.id,
    );

    await governanceRepository.auditReport.update(report.id, {
      status: 'COMPLETED',
      generatedAt: new Date(),
      rowCount: exportResult.data.split('\n').length - 1,
    });

    return prisma.auditReport.findUnique({ where: { id: report.id } });
  },
};
