import type { Prisma } from '@kuberone/database';

import { ConflictError, NotFoundError } from '../../../shared/errors/app-error.js';
import { devOpsRepository } from '../repositories/devops.repository.js';

export class DevOpsService {
  async listPipelines(query: {
    page: number;
    limit: number;
    pipelineType?: string;
    status?: string;
    branch?: string;
  }) {
    const where: Prisma.PipelineRunWhereInput = {};
    if (query.pipelineType) where.pipelineType = query.pipelineType as Prisma.EnumPipelineTypeFilter['equals'];
    if (query.status) where.status = query.status as Prisma.EnumPipelineStatusFilter['equals'];
    if (query.branch) where.branch = query.branch;

    const skip = (query.page - 1) * query.limit;
    return devOpsRepository.listPipelineRuns(where, skip, query.limit);
  }

  async getPipeline(id: string) {
    const run = await devOpsRepository.findPipelineRun(id);
    if (!run) throw new NotFoundError('Pipeline run not found');
    return run;
  }

  async recordPipelineWebhook(input: {
    pipelineType: string;
    name: string;
    branch?: string;
    commitSha?: string;
    prNumber?: number;
    status: string;
    workflowUrl?: string;
    triggeredBy?: string;
    durationMs?: number;
    metadata?: Record<string, unknown>;
  }) {
    const now = new Date();
    const isTerminal = ['SUCCESS', 'FAILED', 'CANCELLED'].includes(input.status);

    return devOpsRepository.createPipelineRun({
      pipelineType: input.pipelineType as Prisma.PipelineRunCreateInput['pipelineType'],
      name: input.name,
      branch: input.branch,
      commitSha: input.commitSha,
      prNumber: input.prNumber,
      status: input.status as Prisma.PipelineRunCreateInput['status'],
      startedAt: isTerminal ? new Date(now.getTime() - (input.durationMs ?? 0)) : now,
      completedAt: isTerminal ? now : undefined,
      durationMs: input.durationMs,
      workflowUrl: input.workflowUrl,
      triggeredBy: input.triggeredBy,
      metadata: input.metadata as Prisma.InputJsonValue,
    });
  }

  async listDeployments(query: {
    page: number;
    limit: number;
    environment?: string;
    status?: string;
    component?: string;
  }) {
    const where: Prisma.DeploymentWhereInput = {};
    if (query.environment) where.environment = query.environment as Prisma.EnumDeploymentEnvironmentFilter['equals'];
    if (query.status) where.status = query.status as Prisma.EnumDeploymentStatusFilter['equals'];
    if (query.component) where.component = query.component;

    const skip = (query.page - 1) * query.limit;
    return devOpsRepository.listDeployments(where, skip, query.limit);
  }

  async getDeployment(id: string) {
    const deployment = await devOpsRepository.findDeployment(id);
    if (!deployment) throw new NotFoundError('Deployment not found');
    return deployment;
  }

  async recordDeployment(input: {
    environment: string;
    component: string;
    version: string;
    strategy?: string;
    commitSha?: string;
    deployedById?: string;
    pipelineRunId?: string;
    metadata?: Record<string, unknown>;
  }) {
    const deployment = await devOpsRepository.createDeployment({
      environment: input.environment as Prisma.DeploymentCreateInput['environment'],
      component: input.component,
      version: input.version,
      strategy: (input.strategy ?? 'ROLLING') as Prisma.DeploymentCreateInput['strategy'],
      status: 'SUCCESS',
      commitSha: input.commitSha,
      startedAt: new Date(),
      completedAt: new Date(),
      deployedBy: input.deployedById ? { connect: { id: input.deployedById } } : undefined,
      pipelineRun: input.pipelineRunId ? { connect: { id: input.pipelineRunId } } : undefined,
      metadata: input.metadata as Prisma.InputJsonValue,
    });

    await devOpsRepository.createAudit({
      action: 'DEPLOY',
      entityType: 'deployment',
      entityId: deployment.id,
      actor: input.deployedById ? { connect: { id: input.deployedById } } : undefined,
      environment: input.environment,
      details: { component: input.component, version: input.version },
    });

    return deployment;
  }

  async listReleases(query: { page: number; limit: number; isPublished?: boolean }) {
    const where: Prisma.ReleaseVersionWhereInput = {};
    if (query.isPublished !== undefined) where.isPublished = query.isPublished;

    const skip = (query.page - 1) * query.limit;
    return devOpsRepository.listReleases(where, skip, query.limit);
  }

  async createRelease(input: {
    version: string;
    name: string;
    branch?: string;
    commitSha?: string;
    changelog?: string;
    createdById?: string;
  }) {
    const existing = await devOpsRepository.listReleases({ version: input.version }, 0, 1);
    if (existing.total > 0) throw new ConflictError('Release version already exists');

    const release = await devOpsRepository.createRelease({
      version: input.version,
      name: input.name,
      branch: input.branch,
      commitSha: input.commitSha,
      changelog: input.changelog,
      createdBy: input.createdById ? { connect: { id: input.createdById } } : undefined,
    });

    await devOpsRepository.createAudit({
      action: 'RELEASE_CREATE',
      entityType: 'release',
      entityId: release.id,
      actor: input.createdById ? { connect: { id: input.createdById } } : undefined,
      details: { version: input.version },
    });

    return release;
  }

  async publishRelease(id: string, actorId?: string) {
    const release = await devOpsRepository.findRelease(id);
    if (!release) throw new NotFoundError('Release not found');
    if (release.isPublished) throw new ConflictError('Release already published');

    const published = await devOpsRepository.publishRelease(id);

    await devOpsRepository.createAudit({
      action: 'RELEASE_PUBLISH',
      entityType: 'release',
      entityId: id,
      actor: actorId ? { connect: { id: actorId } } : undefined,
      details: { version: release.version },
    });

    return published;
  }

  async listRollbacks(query: { page: number; limit: number; status?: string }) {
    const where: Prisma.RollbackExecutionWhereInput = {};
    if (query.status) where.status = query.status as Prisma.EnumRollbackStatusFilter['equals'];

    const skip = (query.page - 1) * query.limit;
    return devOpsRepository.listRollbacks(where, skip, query.limit);
  }

  async createRollback(input: {
    deploymentId?: string;
    fromVersion: string;
    toVersion: string;
    reason?: string;
    executedById?: string;
  }) {
    const rollback = await devOpsRepository.createRollback({
      fromVersion: input.fromVersion,
      toVersion: input.toVersion,
      reason: input.reason,
      status: 'SUCCESS',
      startedAt: new Date(),
      completedAt: new Date(),
      deployment: input.deploymentId ? { connect: { id: input.deploymentId } } : undefined,
      executedBy: input.executedById ? { connect: { id: input.executedById } } : undefined,
    });

    if (input.deploymentId) {
      await devOpsRepository.updateDeployment(input.deploymentId, { status: 'ROLLED_BACK' });
    }

    await devOpsRepository.createAudit({
      action: 'ROLLBACK',
      entityType: 'rollback',
      entityId: rollback.id,
      actor: input.executedById ? { connect: { id: input.executedById } } : undefined,
      details: {
        fromVersion: input.fromVersion,
        toVersion: input.toVersion,
        reason: input.reason,
      },
    });

    return rollback;
  }

  async getHistory(query: { page: number; limit: number; type?: string }) {
    const skip = (query.page - 1) * query.limit;
    const type = query.type ?? 'all';

    if (type === 'pipelines') {
      const { items, total } = await devOpsRepository.listPipelineRuns({}, skip, query.limit);
      return { items: items.map((i) => ({ ...i, historyType: 'pipeline' })), total };
    }
    if (type === 'deployments') {
      const { items, total } = await devOpsRepository.listDeployments({}, skip, query.limit);
      return { items: items.map((i) => ({ ...i, historyType: 'deployment' })), total };
    }
    if (type === 'releases') {
      const { items, total } = await devOpsRepository.listReleases({}, skip, query.limit);
      return { items: items.map((i) => ({ ...i, historyType: 'release' })), total };
    }
    if (type === 'rollbacks') {
      const { items, total } = await devOpsRepository.listRollbacks({}, skip, query.limit);
      return { items: items.map((i) => ({ ...i, historyType: 'rollback' })), total };
    }

    const audits = await devOpsRepository.listAudits(skip, query.limit);
    return { items: audits.items.map((i) => ({ ...i, historyType: 'audit' })), total: audits.total };
  }

  async getDashboard() {
    return devOpsRepository.getDashboardStats();
  }
}

export const devOpsService = new DevOpsService();
