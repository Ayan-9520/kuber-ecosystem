import type { Prisma } from '@kuberone/database';
import type { AuthenticatedUser } from '@kuberone/shared-types';
import type { CreateWorkflowInput, ListWorkflowsQuery, UpdateWorkflowInput } from '@kuberone/shared-validation';

import { prisma } from '../../../config/database.js';
import { NotFoundError, ValidationError } from '../../../shared/errors/app-error.js';
import { automationRepository } from '../repositories/automation.repository.js';

import { automationAuditService } from './automation-audit.service.js';

type RequestContext = { actorId: string; ipAddress?: string; userAgent?: string };

function buildPaginationMeta(page: number, limit: number, total: number) {
  return { page, limit, total, totalPages: Math.ceil(total / limit) || 1 };
}

async function persistNodes(workflowId: string, nodes: CreateWorkflowInput['nodes']) {
  if (!nodes?.length) return;
  await automationRepository.deleteWorkflowNodes(workflowId);

  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i]!;
    const dbNode = await prismaNodeCreate(workflowId, node, i);
    for (const cond of node.conditions ?? []) {
      await condCreate(dbNode.id, cond);
    }
    for (const action of node.actions ?? []) {
      await actionCreate(dbNode.id, action);
    }
  }
}

async function prismaNodeCreate(workflowId: string, node: NonNullable<CreateWorkflowInput['nodes']>[number], sortOrder: number) {
  return prisma.automationNode.create({
    data: {
      workflowId,
      nodeKey: node.nodeKey,
      type: node.type as never,
      label: node.label,
      positionX: node.positionX ?? 0,
      positionY: node.positionY ?? 0,
      config: node.config as Prisma.InputJsonValue,
      nextNodeKeys: node.nextNodeKeys as Prisma.InputJsonValue,
      parentKey: node.parentKey,
      sortOrder,
    },
  });
}

async function condCreate(nodeId: string, cond: { field: string; operator: string; value?: unknown; logicGroup?: string }) {
  return prisma.automationCondition.create({
    data: { nodeId, field: cond.field, operator: cond.operator, value: cond.value as Prisma.InputJsonValue, logicGroup: cond.logicGroup },
  });
}

async function actionCreate(
  nodeId: string,
  action: { actionType: string; channel?: string; templateCode?: string; config?: Record<string, unknown>; delayBefore?: number },
) {
  return prisma.automationAction.create({
    data: {
      nodeId,
      actionType: action.actionType as never,
      channel: action.channel,
      templateCode: action.templateCode,
      config: action.config as Prisma.InputJsonValue,
      delayBefore: action.delayBefore,
    },
  });
}

export const automationWorkflowService = {
  async list(_actor: AuthenticatedUser, query: ListWorkflowsQuery) {
    const where = {
      deletedAt: null,
      ...(query.status ? { status: query.status as never } : {}),
      ...(query.journeyType ? { journeyType: query.journeyType as never } : {}),
      ...(query.branchId ? { branchId: query.branchId } : {}),
      ...(query.regionId ? { regionId: query.regionId } : {}),
      ...(query.search
        ? { OR: [{ name: { contains: query.search } }, { description: { contains: query.search } }] }
        : {}),
    };
    const skip = (query.page - 1) * query.limit;
    const orderBy = { [query.sortBy ?? 'createdAt']: query.sortOrder };
    const [items, total] = await Promise.all([
      automationRepository.workflow.findMany({
        where,
        skip,
        take: query.limit,
        orderBy,
        include: {
          triggers: { where: { isActive: true } },
          goals: true,
          _count: { select: { executions: true } },
        },
      }),
      automationRepository.workflow.count(where),
    ]);
    return { items, meta: buildPaginationMeta(query.page, query.limit, total) };
  },

  async getById(_actor: AuthenticatedUser, id: string) {
    const workflow = await automationRepository.workflow.findById(id);
    if (!workflow) throw new NotFoundError('AutomationWorkflow', id);
    return workflow;
  },

  async create(actor: AuthenticatedUser, input: CreateWorkflowInput, ctx: RequestContext) {
    const workflow = await automationRepository.workflow.create({
      name: input.name,
      description: input.description,
      journeyType: input.journeyType as never,
      status: 'DRAFT',
      branch: input.branchId ? { connect: { id: input.branchId } } : undefined,
      region: input.regionId ? { connect: { id: input.regionId } } : undefined,
      dataScopeJson: input.dataScopeJson as Prisma.InputJsonValue,
      requiresApproval: input.requiresApproval ?? true,
      canvasJson: input.canvasJson as Prisma.InputJsonValue,
      createdBy: { connect: { id: actor.id } },
      updatedBy: { connect: { id: actor.id } },
    });

    if (input.nodes?.length) await persistNodes(workflow.id, input.nodes);

    if (input.triggers?.length) {
      for (const t of input.triggers) {
        await prisma.automationTrigger.create({
          data: {
            workflowId: workflow.id,
            triggerType: t.triggerType as never,
            config: t.config as Prisma.InputJsonValue,
            isActive: t.isActive ?? true,
          },
        });
      }
    }

    if (input.goals?.length) {
      for (const g of input.goals) {
        await prisma.automationGoal.create({
          data: {
            workflowId: workflow.id,
            goalType: g.goalType as never,
            config: g.config as Prisma.InputJsonValue,
            targetCount: g.targetCount,
          },
        });
      }
    }

    await automationAuditService.log({
      workflowId: workflow.id,
      action: 'WORKFLOW_CREATED',
      actorId: ctx.actorId,
      after: { name: workflow.name, journeyType: workflow.journeyType },
      ipAddress: ctx.ipAddress,
      userAgent: ctx.userAgent,
    });

    return automationRepository.workflow.findById(workflow.id);
  },

  async update(actor: AuthenticatedUser, id: string, input: UpdateWorkflowInput, ctx: RequestContext) {
    const existing = await automationRepository.workflow.findById(id);
    if (!existing) throw new NotFoundError('AutomationWorkflow', id);

    if (input.status === 'ACTIVE' && existing.requiresApproval && !existing.approvedAt) {
      throw new ValidationError({ workflow: ['Workflow requires approval before activation'] });
    }

    await automationRepository.workflow.update(id, {
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.description !== undefined ? { description: input.description } : {}),
      ...(input.journeyType !== undefined ? { journeyType: input.journeyType as never } : {}),
      ...(input.status !== undefined ? { status: input.status as never } : {}),
      ...(input.branchId !== undefined ? { branch: { connect: { id: input.branchId } } } : {}),
      ...(input.regionId !== undefined ? { region: { connect: { id: input.regionId } } } : {}),
      ...(input.dataScopeJson !== undefined ? { dataScopeJson: input.dataScopeJson as Prisma.InputJsonValue } : {}),
      ...(input.canvasJson !== undefined ? { canvasJson: input.canvasJson as Prisma.InputJsonValue } : {}),
      ...(input.status === 'ACTIVE' ? { activatedAt: new Date() } : {}),
      ...(input.status === 'PAUSED' ? { pausedAt: new Date() } : {}),
      updatedBy: { connect: { id: actor.id } },
    });

    if (input.nodes) await persistNodes(id, input.nodes);

    if (input.triggers) {
      await prisma.automationTrigger.deleteMany({ where: { workflowId: id } });
      for (const t of input.triggers) {
        await prisma.automationTrigger.create({
          data: {
            workflowId: id,
            triggerType: t.triggerType as never,
            config: t.config as Prisma.InputJsonValue,
            isActive: t.isActive ?? true,
          },
        });
      }
    }

    if (input.goals) {
      await prisma.automationGoal.deleteMany({ where: { workflowId: id } });
      for (const g of input.goals) {
        await prisma.automationGoal.create({
          data: {
            workflowId: id,
            goalType: g.goalType as never,
            config: g.config as Prisma.InputJsonValue,
            targetCount: g.targetCount,
          },
        });
      }
    }

    await automationAuditService.log({
      workflowId: id,
      action: 'WORKFLOW_UPDATED',
      actorId: ctx.actorId,
      before: { status: existing.status, version: existing.version },
      after: input as never,
      ipAddress: ctx.ipAddress,
      userAgent: ctx.userAgent,
    });

    return automationRepository.workflow.findById(id);
  },

  async approve(actor: AuthenticatedUser, id: string, ctx: RequestContext) {
    const workflow = await automationRepository.workflow.findById(id);
    if (!workflow) throw new NotFoundError('AutomationWorkflow', id);

    await automationRepository.workflow.update(id, {
      status: 'ACTIVE',
      approvedBy: { connect: { id: actor.id } },
      approvedAt: new Date(),
      activatedAt: new Date(),
      updatedBy: { connect: { id: actor.id } },
    });

    await automationAuditService.log({
      workflowId: id,
      action: 'WORKFLOW_APPROVED',
      actorId: ctx.actorId,
      ipAddress: ctx.ipAddress,
      userAgent: ctx.userAgent,
    });

    return automationRepository.workflow.findById(id);
  },

  async remove(actor: AuthenticatedUser, id: string, ctx: RequestContext) {
    const workflow = await automationRepository.workflow.findById(id);
    if (!workflow) throw new NotFoundError('AutomationWorkflow', id);

    await automationRepository.workflow.update(id, {
      deletedAt: new Date(),
      status: 'ARCHIVED',
      updatedBy: { connect: { id: actor.id } },
    });

    await automationAuditService.log({
      workflowId: id,
      action: 'WORKFLOW_ARCHIVED',
      actorId: ctx.actorId,
      ipAddress: ctx.ipAddress,
      userAgent: ctx.userAgent,
    });
  },

  async createFromTemplate(actor: AuthenticatedUser, templateId: string, ctx: RequestContext) {
    const template = await automationRepository.template.findById(templateId);
    if (!template) throw new NotFoundError('AutomationTemplate', templateId);

    await automationRepository.template.incrementUsage(templateId);

    return automationWorkflowService.create(
      actor,
      {
        name: `${template.name} (Copy)`,
        description: template.description ?? undefined,
        journeyType: template.journeyType,
        canvasJson: (template.canvasJson as Record<string, unknown>) ?? undefined,
        nodes: (template.nodesJson as CreateWorkflowInput['nodes']) ?? undefined,
        triggers: (template.triggersJson as CreateWorkflowInput['triggers']) ?? undefined,
        goals: (template.goalsJson as CreateWorkflowInput['goals']) ?? undefined,
      },
      ctx,
    );
  },
};
