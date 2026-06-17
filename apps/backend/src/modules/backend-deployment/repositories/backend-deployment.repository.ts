import type { Prisma } from '@kuberone/database';
import { prisma } from '@kuberone/database';

export const backendDeploymentRepository = {
  findLatestDeployment() {
    return prisma.backendDeployment.findFirst({ orderBy: { createdAt: 'desc' } });
  },

  listDeployments(where: Prisma.BackendDeploymentWhereInput, skip: number, take: number) {
    return Promise.all([
      prisma.backendDeployment.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: { versionRef: true, deployedBy: { select: { id: true, email: true } } },
      }),
      prisma.backendDeployment.count({ where }),
    ]);
  },

  createDeployment(data: Prisma.BackendDeploymentCreateInput) {
    return prisma.backendDeployment.create({ data });
  },

  listVersions(where: Prisma.DeploymentVersionWhereInput, skip: number, take: number) {
    return Promise.all([
      prisma.deploymentVersion.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: { releasedBy: { select: { id: true, email: true } } },
      }),
      prisma.deploymentVersion.count({ where }),
    ]);
  },

  findVersionByVersion(version: string) {
    return prisma.deploymentVersion.findUnique({ where: { version } });
  },

  createVersion(data: Prisma.DeploymentVersionCreateInput) {
    return prisma.deploymentVersion.create({ data });
  },

  upsertServiceHealth(serviceCode: string, data: Prisma.ServiceHealthUpdateInput & { serviceName: string }) {
    const { serviceName, ...update } = data;
    return prisma.serviceHealth.upsert({
      where: { serviceCode },
      create: {
        serviceCode,
        serviceName,
        status: (update.status as never) ?? 'UNKNOWN',
        lastCheckedAt: update.lastCheckedAt as Date | undefined,
        latencyMs: update.latencyMs as number | undefined,
        errorMessage: update.errorMessage as string | undefined,
        metadata: update.metadata as Prisma.InputJsonValue | undefined,
      },
      update,
    });
  },

  listServiceHealth() {
    return prisma.serviceHealth.findMany({ orderBy: { serviceCode: 'asc' } });
  },

  createAudit(data: Prisma.BackendDeploymentAuditCreateInput) {
    return prisma.backendDeploymentAudit.create({ data });
  },

  createArtifact(data: Prisma.ReleaseArtifactCreateInput) {
    return prisma.releaseArtifact.create({ data });
  },

  listReports(limit = 10) {
    return prisma.backendDeploymentReport.findMany({
      orderBy: { generatedAt: 'desc' },
      take: limit,
    });
  },

  createReport(data: Prisma.BackendDeploymentReportCreateInput) {
    return prisma.backendDeploymentReport.create({ data });
  },
};
