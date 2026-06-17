import type { AuthenticatedUser } from '@kuberone/shared-types';
import type { ListExecutionsQuery } from '@kuberone/shared-validation';

import { NotFoundError } from '../../../shared/errors/app-error.js';
import { automationRepository } from '../repositories/automation.repository.js';

import { automationEngineService } from './automation-engine.service.js';

function buildPaginationMeta(page: number, limit: number, total: number) {
  return { page, limit, total, totalPages: Math.ceil(total / limit) || 1 };
}

export const automationExecutionService = {
  async list(_actor: AuthenticatedUser, query: ListExecutionsQuery) {
    const where = {
      ...(query.workflowId ? { workflowId: query.workflowId } : {}),
      ...(query.status ? { status: query.status as never } : {}),
      ...(query.triggerType ? { triggerType: query.triggerType as never } : {}),
      ...(query.subjectType ? { subjectType: query.subjectType } : {}),
      ...(query.subjectId ? { subjectId: query.subjectId } : {}),
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
      automationRepository.execution.findMany({
        where,
        skip,
        take: query.limit,
        orderBy: { [query.sortBy ?? 'createdAt']: query.sortOrder },
        include: { workflow: { select: { id: true, name: true, journeyType: true } } },
      }),
      automationRepository.execution.count(where),
    ]);
    return { items, meta: buildPaginationMeta(query.page, query.limit, total) };
  },

  async getById(_actor: AuthenticatedUser, id: string) {
    const execution = await automationRepository.execution.findById(id);
    if (!execution) throw new NotFoundError('AutomationExecution', id);
    return execution;
  },

  async cancel(_actor: AuthenticatedUser, id: string) {
    const execution = await automationRepository.execution.findById(id);
    if (!execution) throw new NotFoundError('AutomationExecution', id);
    return automationRepository.execution.update(id, {
      status: 'CANCELLED',
      completedAt: new Date(),
      exitReason: 'Cancelled by user',
    });
  },

  async retry(_actor: AuthenticatedUser, id: string) {
    const execution = await automationRepository.execution.findById(id);
    if (!execution) throw new NotFoundError('AutomationExecution', id);
    const workflow = await automationRepository.workflow.findById(execution.workflowId);
    if (!workflow) throw new NotFoundError('AutomationWorkflow', execution.workflowId);

    await automationRepository.execution.update(id, {
      status: 'RUNNING',
      errorMessage: null,
      retryCount: { increment: 1 },
    });

    const startNode = workflow.nodes.find((n) => n.type === 'TRIGGER') ?? workflow.nodes[0];
    if (startNode) {
      await automationEngineService.processNode(
        { ...execution, workflow: { nodes: workflow.nodes, goals: workflow.goals } } as never,
        startNode.nodeKey,
      );
    }

    return automationRepository.execution.findById(id);
  },
};
