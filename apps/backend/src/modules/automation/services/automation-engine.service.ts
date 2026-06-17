import type { Prisma } from '@kuberone/database';

import { prisma } from '../../../config/database.js';
import { automationRepository } from '../repositories/automation.repository.js';

import { actionExecutorService } from './action-executor.service.js';
import { automationLogService } from './automation-log.service.js';
import { automationQueueService } from './automation-queue.service.js';
import { conditionEvaluatorService } from './condition-evaluator.service.js';


type WorkflowNode = {
  nodeKey: string;
  type: string;
  label: string;
  config?: Prisma.JsonValue;
  nextNodeKeys?: Prisma.JsonValue;
  conditions?: Array<{ field: string; operator: string; value?: unknown }>;
  actions?: Array<{ actionType: string; channel?: string | null; templateCode?: string | null; config?: Prisma.JsonValue }>;
};

type ExecutionRecord = {
  id: string;
  workflowId: string;
  status: string;
  subjectType: string;
  subjectId: string;
  userId?: string | null;
  currentNodeKey?: string | null;
  context?: Prisma.JsonValue;
  workflow: {
    nodes: WorkflowNode[];
    goals?: Array<{ goalType: string }>;
  };
};

function parseNextKeys(nextNodeKeys: Prisma.JsonValue | undefined): string[] {
  if (!nextNodeKeys) return [];
  if (Array.isArray(nextNodeKeys)) return nextNodeKeys.map(String);
  return [];
}

function addDelay(config: Record<string, unknown>): Date {
  const delayType = String(config.delayType ?? 'HOURS');
  const value = Number(config.value ?? 1);
  const now = Date.now();
  switch (delayType) {
    case 'MINUTES':
      return new Date(now + value * 60_000);
    case 'HOURS':
      return new Date(now + value * 3_600_000);
    case 'DAYS':
      return new Date(now + value * 86_400_000);
    case 'WEEKS':
      return new Date(now + value * 7 * 86_400_000);
    case 'UNTIL_DATE':
      return new Date(String(config.untilDate ?? now));
    default:
      return new Date(now + value * 3_600_000);
  }
}

async function enrichContext(execution: ExecutionRecord): Promise<Record<string, unknown>> {
  const base = (execution.context ?? {}) as Record<string, unknown>;

  if (execution.subjectType === 'lead') {
    const lead = await prisma.lead.findUnique({
      where: { id: execution.subjectId },
      include: { scores: { orderBy: { createdAt: 'desc' }, take: 1 } },
    });
    if (lead) {
      return {
        ...base,
        leadId: lead.id,
        leadScore: lead.score ?? lead.scores[0]?.score,
        leadGrade: lead.grade,
        productId: lead.productId,
        loanAmount: lead.requestedAmount,
        branchId: lead.branchId,
        regionId: lead.regionId,
        applicationStatus: lead.status,
        customerType: lead.customerId ? 'EXISTING' : 'PROSPECT',
      };
    }
  }

  if (execution.subjectType === 'application') {
    const app = await prisma.application.findUnique({ where: { id: execution.subjectId } });
    if (app) {
      return {
        ...base,
        applicationId: app.id,
        applicationStatus: app.status,
        loanAmount: app.requestedAmount,
        productId: app.productId,
        branchId: app.branchId,
        regionId: app.regionId,
      };
    }
  }

  return base;
}

export const automationEngineService = {
  async startExecution(params: {
    workflowId: string;
    triggerType: string;
    subjectType: string;
    subjectId: string;
    userId?: string;
    context?: Record<string, unknown>;
  }) {
    const workflow = await automationRepository.workflow.findById(params.workflowId);
    if (!workflow || workflow.status !== 'ACTIVE') return null;

    const execution = await automationRepository.execution.create({
      workflow: { connect: { id: params.workflowId } },
      status: 'RUNNING',
      triggerType: params.triggerType as never,
      subjectType: params.subjectType,
      subjectId: params.subjectId,
      user: params.userId ? { connect: { id: params.userId } } : undefined,
      context: params.context as never,
      startedAt: new Date(),
    });

    const startNode =
      workflow.nodes.find((n) => n.type === 'TRIGGER') ??
      workflow.nodes.sort((a, b) => a.sortOrder - b.sortOrder)[0];

    if (!startNode) {
      await automationRepository.execution.update(execution.id, {
        status: 'FAILED',
        errorMessage: 'Workflow has no start node',
        completedAt: new Date(),
      });
      return execution;
    }

    await automationLogService.write({
      executionId: execution.id,
      workflowId: params.workflowId,
      message: `Execution started via ${params.triggerType}`,
      metadata: { subjectType: params.subjectType, subjectId: params.subjectId },
    });

    const fullExecution = await automationRepository.execution.findById(execution.id);
    if (fullExecution) {
      await automationEngineService.processNode(
        { ...fullExecution, workflow: { nodes: workflow.nodes, goals: workflow.goals } } as ExecutionRecord,
        startNode.nodeKey,
      );
    }

    return execution;
  },

  async processNode(execution: ExecutionRecord, nodeKey: string) {
    const node = execution.workflow.nodes.find((n) => n.nodeKey === nodeKey);
    if (!node) {
      await automationRepository.execution.update(execution.id, {
        status: 'FAILED',
        errorMessage: `Node not found: ${nodeKey}`,
        completedAt: new Date(),
      });
      return;
    }

    const context = await enrichContext(execution);
    await automationRepository.execution.update(execution.id, { currentNodeKey: nodeKey, context: context as never });

    await automationLogService.write({
      executionId: execution.id,
      workflowId: execution.workflowId,
      nodeKey,
      message: `Processing node: ${node.label} (${node.type})`,
    });

    const execCtx = {
      executionId: execution.id,
      workflowId: execution.workflowId,
      subjectType: execution.subjectType,
      subjectId: execution.subjectId,
      userId: execution.userId,
      context,
    };

    switch (node.type) {
      case 'TRIGGER':
      case 'BRANCH':
        await automationEngineService.advance(execution, node, true);
        break;

      case 'CONDITION': {
        const pass = conditionEvaluatorService.evaluate(node.conditions ?? [], context);
        await automationLogService.write({
          executionId: execution.id,
          workflowId: execution.workflowId,
          nodeKey,
          message: pass ? 'Conditions passed' : 'Conditions failed',
        });
        await automationEngineService.advance(execution, node, pass);
        break;
      }

      case 'DELAY': {
        const config = (node.config ?? {}) as Record<string, unknown>;
        const scheduledAt = addDelay(config);
        await automationRepository.execution.update(execution.id, { status: 'WAITING', scheduledAt });
        const nextKeys = parseNextKeys(node.nextNodeKeys);
        const nextKey = nextKeys[0];
        if (nextKey) {
          await automationQueueService.enqueue({ executionId: execution.id, nodeKey: nextKey, scheduledAt });
        }
        break;
      }

      case 'ACTION': {
        for (const action of node.actions ?? []) {
          await actionExecutorService.execute(action, execCtx);
        }
        await automationEngineService.advance(execution, node, true);
        break;
      }

      case 'LOOP': {
        const config = (node.config ?? {}) as Record<string, unknown>;
        const maxIterations = Number(config.maxIterations ?? 3);
        const loopCount = Number((context.loopCount as number) ?? 0) + 1;
        const updatedContext = { ...context, loopCount };
        await automationRepository.execution.update(execution.id, { context: updatedContext as never });
        if (loopCount < maxIterations) {
          const nextKeys = parseNextKeys(node.nextNodeKeys);
          if (nextKeys[0]) await automationEngineService.processNode(execution, nextKeys[0]);
        } else {
          await automationEngineService.advance(execution, node, true);
        }
        break;
      }

      case 'GOAL': {
        const config = (node.config ?? {}) as Record<string, unknown>;
        await automationRepository.execution.update(execution.id, {
          status: 'GOAL_ACHIEVED',
          goalAchieved: true,
          completedAt: new Date(),
        });
        await prisma.automationGoal.updateMany({
          where: { workflowId: execution.workflowId, goalType: (config.goalType as string) as never },
          data: { achievedCount: { increment: 1 } },
        });
        await automationLogService.write({
          executionId: execution.id,
          workflowId: execution.workflowId,
          nodeKey,
          message: `Goal achieved: ${config.goalType ?? node.label}`,
        });
        break;
      }

      case 'EXIT': {
        const config = (node.config ?? {}) as Record<string, unknown>;
        await automationRepository.execution.update(execution.id, {
          status: 'EXITED',
          exitReason: (config.reason as string) ?? 'Exit condition met',
          completedAt: new Date(),
        });
        break;
      }

      default:
        await automationEngineService.advance(execution, node, true);
    }
  },

  async advance(execution: ExecutionRecord, node: WorkflowNode, takeFirstBranch: boolean) {
    const nextKeys = parseNextKeys(node.nextNodeKeys);
    if (!nextKeys.length) {
      await automationRepository.execution.update(execution.id, {
        status: 'COMPLETED',
        completedAt: new Date(),
      });
      return;
    }

    const nextKey = takeFirstBranch ? nextKeys[0] : nextKeys[1] ?? nextKeys[0];
    if (!nextKey) {
      await automationRepository.execution.update(execution.id, { status: 'COMPLETED', completedAt: new Date() });
      return;
    }

    const nextNode = execution.workflow.nodes.find((n) => n.nodeKey === nextKey);
    if (nextNode?.type === 'DELAY') {
      await automationEngineService.processNode(execution, nextKey);
    } else {
      await automationQueueService.enqueue({
        executionId: execution.id,
        nodeKey: nextKey,
        scheduledAt: new Date(),
      });
    }
  },
};
