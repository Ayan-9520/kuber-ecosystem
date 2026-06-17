import type { Prisma } from '@kuberone/database';
import { prisma } from '@kuberone/database';

export class DevOpsRepository {
  async listPipelineRuns(where: Prisma.PipelineRunWhereInput, skip: number, take: number) {
    const [items, total] = await Promise.all([
      prisma.pipelineRun.findMany({ where, skip, take, orderBy: { createdAt: 'desc' } }),
      prisma.pipelineRun.count({ where }),
    ]);
    return { items, total };
  }

  async findPipelineRun(id: string) {
    return prisma.pipelineRun.findUnique({
      where: { id },
      include: { deployments: true },
    });
  }

  async createPipelineRun(data: Prisma.PipelineRunCreateInput) {
    return prisma.pipelineRun.create({ data });
  }

  async listDeployments(where: Prisma.DeploymentWhereInput, skip: number, take: number) {
    const [items, total] = await Promise.all([
      prisma.deployment.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: { executions: { orderBy: { createdAt: 'asc' }, take: 20 } },
      }),
      prisma.deployment.count({ where }),
    ]);
    return { items, total };
  }

  async findDeployment(id: string) {
    return prisma.deployment.findUnique({
      where: { id },
      include: { executions: true, rollbacks: true, pipelineRun: true },
    });
  }

  async createDeployment(data: Prisma.DeploymentCreateInput) {
    return prisma.deployment.create({ data });
  }

  async updateDeployment(id: string, data: Prisma.DeploymentUpdateInput) {
    return prisma.deployment.update({ where: { id }, data });
  }

  async createDeploymentExecution(data: Prisma.DeploymentExecutionCreateInput) {
    return prisma.deploymentExecution.create({ data });
  }

  async listReleases(where: Prisma.ReleaseVersionWhereInput, skip: number, take: number) {
    const [items, total] = await Promise.all([
      prisma.releaseVersion.findMany({ where, skip, take, orderBy: { createdAt: 'desc' } }),
      prisma.releaseVersion.count({ where }),
    ]);
    return { items, total };
  }

  async findRelease(id: string) {
    return prisma.releaseVersion.findUnique({ where: { id } });
  }

  async createRelease(data: Prisma.ReleaseVersionCreateInput) {
    return prisma.releaseVersion.create({ data });
  }

  async publishRelease(id: string) {
    return prisma.releaseVersion.update({
      where: { id },
      data: { isPublished: true, publishedAt: new Date() },
    });
  }

  async listRollbacks(where: Prisma.RollbackExecutionWhereInput, skip: number, take: number) {
    const [items, total] = await Promise.all([
      prisma.rollbackExecution.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: { deployment: true },
      }),
      prisma.rollbackExecution.count({ where }),
    ]);
    return { items, total };
  }

  async createRollback(data: Prisma.RollbackExecutionCreateInput) {
    return prisma.rollbackExecution.create({ data });
  }

  async updateRollback(id: string, data: Prisma.RollbackExecutionUpdateInput) {
    return prisma.rollbackExecution.update({ where: { id }, data });
  }

  async createAudit(data: Prisma.DeploymentAuditCreateInput) {
    return prisma.deploymentAudit.create({ data });
  }

  async listAudits(skip: number, take: number) {
    const [items, total] = await Promise.all([
      prisma.deploymentAudit.findMany({ skip, take, orderBy: { createdAt: 'desc' } }),
      prisma.deploymentAudit.count(),
    ]);
    return { items, total };
  }

  async getDashboardStats() {
    const [
      pipelineTotal,
      pipelineSuccess,
      deploymentTotal,
      deploymentSuccess,
      releaseTotal,
      rollbackTotal,
      recentPipelines,
      recentDeployments,
    ] = await Promise.all([
      prisma.pipelineRun.count(),
      prisma.pipelineRun.count({ where: { status: 'SUCCESS' } }),
      prisma.deployment.count(),
      prisma.deployment.count({ where: { status: 'SUCCESS' } }),
      prisma.releaseVersion.count(),
      prisma.rollbackExecution.count(),
      prisma.pipelineRun.findMany({ take: 5, orderBy: { createdAt: 'desc' } }),
      prisma.deployment.findMany({ take: 5, orderBy: { createdAt: 'desc' } }),
    ]);

    return {
      pipelines: { total: pipelineTotal, success: pipelineSuccess },
      deployments: { total: deploymentTotal, success: deploymentSuccess },
      releases: releaseTotal,
      rollbacks: rollbackTotal,
      recentPipelines,
      recentDeployments,
    };
  }
}

export const devOpsRepository = new DevOpsRepository();
