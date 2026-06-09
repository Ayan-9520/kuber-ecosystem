import type { AuthenticatedUser } from '@kuberone/shared-types';
import type { CreateAnalyticsReportInput, RunAnalyticsReportInput } from '@kuberone/shared-validation';

import { analyticsRepository } from '../repositories/analytics.repository.js';
import type { AnalyticsContext } from '../types/analytics.types.js';

import { exportEngineService } from './export-engine.service.js';

export const reportEngineService = {
  async list(params: { page: number; limit: number; reportType?: string; isActive?: boolean }) {
    const skip = (params.page - 1) * params.limit;
    const { items, total } = await analyticsRepository.listReports({
      skip,
      take: params.limit,
      reportType: params.reportType,
      isActive: params.isActive,
    });
    return {
      items,
      meta: { page: params.page, limit: params.limit, total, totalPages: Math.ceil(total / params.limit) },
    };
  },

  async create(actor: AuthenticatedUser, input: CreateAnalyticsReportInput) {
    return analyticsRepository.createReport({
      code: input.code,
      name: input.name,
      reportType: input.reportType,
      description: input.description,
      config: input.config as never,
      createdById: actor.id,
    });
  },

  async run(actor: AuthenticatedUser, input: RunAnalyticsReportInput, ctx: AnalyticsContext) {
    const report = input.reportId
      ? await analyticsRepository.getClient().analyticsReport.findUnique({ where: { id: input.reportId } })
      : input.reportCode
        ? await analyticsRepository.findReportByCode(input.reportCode)
        : null;

    const reportId = report?.id ?? (await analyticsRepository.findReportByCode('overview'))?.id;
    if (!reportId) throw new Error('Report not found');

    const execution = await analyticsRepository.createExecution({
      reportId,
      status: 'RUNNING',
      format: input.format,
      parameters: input.parameters as never,
      executedById: actor.id,
      startedAt: new Date(),
    });

    try {
      const exportResult = await exportEngineService.buildExport(actor, {
        format: input.format,
        reportType: (report?.reportType ?? 'overview') as never,
        ...input.parameters,
      });

      await analyticsRepository.updateExecution(execution.id, {
        status: 'COMPLETED',
        completedAt: new Date(),
        rowCount: exportResult.content.split('\n').length,
      });

      await analyticsRepository.createAudit({
        userId: actor.id,
        action: 'REPORT_EXECUTED',
        resource: 'analytics_report',
        resourceId: reportId,
        metadata: { executionId: execution.id, format: input.format },
        ipAddress: ctx.ipAddress,
        userAgent: ctx.userAgent,
      });

      return { execution, export: exportResult };
    } catch (error) {
      await analyticsRepository.updateExecution(execution.id, {
        status: 'FAILED',
        completedAt: new Date(),
        errorMessage: error instanceof Error ? error.message : 'Export failed',
      });
      throw error;
    }
  },

  async executions(reportId: string) {
    return analyticsRepository.listExecutions(reportId);
  },
};
