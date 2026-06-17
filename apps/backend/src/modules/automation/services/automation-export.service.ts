import type { AuthenticatedUser } from '@kuberone/shared-types';
import type { AutomationExportQuery } from '@kuberone/shared-validation';

import { automationRepository } from '../repositories/automation.repository.js';

function toCsv(rows: Record<string, unknown>[], headers: string[]): string {
  const lines = [headers.join(',')];
  for (const row of rows) {
    lines.push(headers.map((h) => `"${String(row[h] ?? '').replace(/"/g, '""')}"`).join(','));
  }
  return lines.join('\n');
}

export const automationExportService = {
  async export(_actor: AuthenticatedUser, query: AutomationExportQuery) {
    const dateFilter =
      query.fromDate || query.toDate
        ? {
            createdAt: {
              ...(query.fromDate ? { gte: query.fromDate } : {}),
              ...(query.toDate ? { lte: query.toDate } : {}),
            },
          }
        : {};

    let rows: Record<string, unknown>[] = [];
    let headers: string[] = [];
    const filename = `automation-${query.type}-${Date.now()}`;

    switch (query.type) {
      case 'workflows': {
        const items = await automationRepository.workflow.findMany({
          where: { deletedAt: null, ...(query.workflowId ? { id: query.workflowId } : {}) },
          take: 5000,
        });
        headers = ['id', 'name', 'journeyType', 'status', 'version', 'createdAt'];
        rows = items.map((w) => ({
          id: w.id,
          name: w.name,
          journeyType: w.journeyType,
          status: w.status,
          version: w.version,
          createdAt: w.createdAt.toISOString(),
        }));
        break;
      }
      case 'executions': {
        const items = await automationRepository.execution.findMany({
          where: { ...dateFilter, ...(query.workflowId ? { workflowId: query.workflowId } : {}) },
          take: 10000,
          include: { workflow: { select: { name: true } } },
        });
        headers = ['id', 'workflowName', 'status', 'triggerType', 'subjectType', 'subjectId', 'goalAchieved', 'createdAt'];
        rows = items.map((e) => ({
          id: e.id,
          workflowName: (e as { workflow?: { name: string } }).workflow?.name,
          status: e.status,
          triggerType: e.triggerType,
          subjectType: e.subjectType,
          subjectId: e.subjectId,
          goalAchieved: e.goalAchieved,
          createdAt: e.createdAt.toISOString(),
        }));
        break;
      }
      case 'logs': {
        const items = await automationRepository.log.findMany({
          where: { ...dateFilter, ...(query.workflowId ? { workflowId: query.workflowId } : {}) },
          take: 20000,
          orderBy: { createdAt: 'desc' },
        });
        headers = ['id', 'executionId', 'workflowId', 'nodeKey', 'level', 'message', 'createdAt'];
        rows = items.map((l) => ({
          id: l.id,
          executionId: l.executionId,
          workflowId: l.workflowId,
          nodeKey: l.nodeKey,
          level: l.level,
          message: l.message,
          createdAt: l.createdAt.toISOString(),
        }));
        break;
      }
      case 'analytics': {
        const items = await automationRepository.analytics.findMany({
          where: query.workflowId ? { workflowId: query.workflowId } : {},
          take: 5000,
          orderBy: { periodStart: 'desc' },
        });
        headers = ['workflowId', 'periodStart', 'periodEnd', 'totalRuns', 'successCount', 'conversionRate', 'revenueGenerated', 'roi'];
        rows = items.map((a) => ({
          workflowId: a.workflowId,
          periodStart: a.periodStart.toISOString(),
          periodEnd: a.periodEnd.toISOString(),
          totalRuns: a.totalRuns,
          successCount: a.successCount,
          conversionRate: a.conversionRate,
          revenueGenerated: a.revenueGenerated,
          roi: a.roi,
        }));
        break;
      }
    }

    if (query.format === 'json') {
      return { format: 'json', filename: `${filename}.json`, data: rows };
    }

    return {
      format: 'csv',
      filename: `${filename}.csv`,
      contentType: 'text/csv',
      data: toCsv(rows, headers),
    };
  },
};
