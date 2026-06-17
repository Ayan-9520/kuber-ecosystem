import type { CreateTriggerInput, ListTriggersQuery } from '@kuberone/shared-validation';

import { TRIGGER_TO_SUBJECT } from '../constants/automation.constants.js';
import { automationRepository } from '../repositories/automation.repository.js';

import { automationEngineService } from './automation-engine.service.js';
import { automationLogService } from './automation-log.service.js';

function buildPaginationMeta(page: number, limit: number, total: number) {
  return { page, limit, total, totalPages: Math.ceil(total / limit) || 1 };
}

export const automationTriggerService = {
  async list(query: ListTriggersQuery) {
    const where = {
      ...(query.workflowId ? { workflowId: query.workflowId } : {}),
      ...(query.triggerType ? { triggerType: query.triggerType as never } : {}),
      ...(query.isActive !== undefined ? { isActive: query.isActive } : {}),
    };
    const skip = (query.page - 1) * query.limit;
    const [items, total] = await Promise.all([
      automationRepository.trigger.findMany({
        where,
        skip,
        take: query.limit,
        orderBy: { createdAt: 'desc' },
        include: { workflow: { select: { id: true, name: true, status: true, journeyType: true } } },
      }),
      automationRepository.trigger.count(where),
    ]);
    return { items, meta: buildPaginationMeta(query.page, query.limit, total) };
  },

  async create(input: CreateTriggerInput) {
    return automationRepository.trigger.create({
      workflow: { connect: { id: input.workflowId } },
      triggerType: input.triggerType as never,
      config: input.config as never,
      isActive: input.isActive ?? true,
    });
  },

  async update(id: string, input: Partial<CreateTriggerInput>) {
    return automationRepository.trigger.update(id, {
      ...(input.triggerType ? { triggerType: input.triggerType as never } : {}),
      ...(input.config !== undefined ? { config: input.config as never } : {}),
      ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
    });
  },

  async remove(id: string) {
    await automationRepository.trigger.delete(id);
  },

  async emit(params: {
    triggerType: string;
    subjectType?: string;
    subjectId: string;
    userId?: string;
    context?: Record<string, unknown>;
  }) {
    const subjectType = params.subjectType ?? TRIGGER_TO_SUBJECT[params.triggerType] ?? 'entity';
    const triggers = await automationRepository.trigger.findActiveByType(params.triggerType);
    const started = [];

    for (const trigger of triggers) {
      const execution = await automationEngineService.startExecution({
        workflowId: trigger.workflowId,
        triggerType: params.triggerType,
        subjectType,
        subjectId: params.subjectId,
        userId: params.userId,
        context: { ...((trigger.config as Record<string, unknown>) ?? {}), ...(params.context ?? {}) },
      });
      if (execution) started.push(execution.id);
    }

    if (started.length) {
      await automationLogService.write({
        executionId: started[0]!,
        workflowId: triggers[0]!.workflowId,
        message: `Trigger emitted: ${params.triggerType}`,
        metadata: { subjectType, subjectId: params.subjectId, executionIds: started },
      });
    }

    return { triggered: started.length, executionIds: started };
  },
};
