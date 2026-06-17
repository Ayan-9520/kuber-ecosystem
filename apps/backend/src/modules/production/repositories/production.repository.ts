import type { Prisma } from '@kuberone/database';
import { prisma } from '@kuberone/database';

export class ProductionRepository {
  async findEnvironmentByCode(code: string) {
    return prisma.productionEnvironment.findUnique({
      where: { code },
      include: {
        deployments: { orderBy: { createdAt: 'desc' }, take: 10 },
        releases: { orderBy: { createdAt: 'desc' }, take: 5 },
        incidents: { where: { status: { notIn: ['RESOLVED', 'CLOSED'] } }, take: 10 },
      },
    });
  }

  async listDeployments(where: Prisma.ProductionDeploymentWhereInput, skip: number, take: number) {
    const [items, total] = await Promise.all([
      prisma.productionDeployment.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: { environment: { select: { code: true, name: true } } },
      }),
      prisma.productionDeployment.count({ where }),
    ]);
    return { items, total };
  }

  async createDeployment(data: Prisma.ProductionDeploymentCreateInput) {
    return prisma.productionDeployment.create({ data });
  }

  async listReleases(where: Prisma.ReleaseRecordWhereInput, skip: number, take: number) {
    const [items, total] = await Promise.all([
      prisma.releaseRecord.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: { environment: { select: { code: true } } },
      }),
      prisma.releaseRecord.count({ where }),
    ]);
    return { items, total };
  }

  async createRelease(data: Prisma.ReleaseRecordCreateInput) {
    return prisma.releaseRecord.create({ data });
  }

  async listIncidents(where: Prisma.IncidentRecordWhereInput, skip: number, take: number) {
    const [items, total] = await Promise.all([
      prisma.incidentRecord.findMany({
        where,
        skip,
        take,
        orderBy: { startedAt: 'desc' },
        include: { environment: { select: { code: true } } },
      }),
      prisma.incidentRecord.count({ where }),
    ]);
    return { items, total };
  }

  async createIncident(data: Prisma.IncidentRecordCreateInput) {
    return prisma.incidentRecord.create({ data });
  }

  async createAudit(data: Prisma.ProductionAuditCreateInput) {
    return prisma.productionAudit.create({ data });
  }

  async countOpenCriticalIncidents(environmentId: string) {
    return prisma.incidentRecord.count({
      where: {
        environmentId,
        severity: 'CRITICAL',
        status: { notIn: ['RESOLVED', 'CLOSED'] },
      },
    });
  }
}

export const productionRepository = new ProductionRepository();
