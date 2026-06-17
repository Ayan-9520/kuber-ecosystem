import type { ListAutomationLogsQuery } from '@kuberone/shared-validation';

import { automationRepository } from '../repositories/automation.repository.js';

function buildPaginationMeta(page: number, limit: number, total: number) {
  return { page, limit, total, totalPages: Math.ceil(total / limit) || 1 };
}

export const automationLogService = {
  async list(query: ListAutomationLogsQuery) {
    const where = {
      ...(query.executionId ? { executionId: query.executionId } : {}),
      ...(query.workflowId ? { workflowId: query.workflowId } : {}),
      ...(query.level ? { level: query.level as never } : {}),
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
    const [items, total] = await Promise.all([
      automationRepository.log.findMany({ where, skip, take: query.limit, orderBy: { createdAt: 'desc' } }),
      automationRepository.log.count(where),
    ]);
    return { items, meta: buildPaginationMeta(query.page, query.limit, total) };
  },

  async write(params: {
    executionId: string;
    workflowId: string;
    nodeKey?: string;
    level?: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';
    message: string;
    metadata?: Record<string, unknown>;
  }) {
    return automationRepository.log.create({
      execution: { connect: { id: params.executionId } },
      workflowId: params.workflowId,
      nodeKey: params.nodeKey,
      level: params.level ?? 'INFO',
      message: params.message,
      metadata: params.metadata as never,
    });
  },
};
