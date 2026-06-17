import type { Prisma } from '@kuberone/database';
import { prisma } from '@kuberone/database';

export class StagingRepository {
  async findEnvironmentByCode(code: string) {
    return prisma.environment.findUnique({
      where: { code },
      include: {
        deployments: { orderBy: { createdAt: 'desc' }, take: 10 },
        releaseValidations: { orderBy: { createdAt: 'desc' }, take: 5 },
      },
    });
  }

  async listEnvironments() {
    return prisma.environment.findMany({ orderBy: { code: 'asc' } });
  }

  async listDeployments(where: Prisma.EnvironmentDeploymentWhereInput, skip: number, take: number) {
    const [items, total] = await Promise.all([
      prisma.environmentDeployment.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: { environment: { select: { code: true, name: true } } },
      }),
      prisma.environmentDeployment.count({ where }),
    ]);
    return { items, total };
  }

  async createDeployment(data: Prisma.EnvironmentDeploymentCreateInput) {
    return prisma.environmentDeployment.create({ data });
  }

  async updateDeployment(id: string, data: Prisma.EnvironmentDeploymentUpdateInput) {
    return prisma.environmentDeployment.update({ where: { id }, data });
  }

  async listReleaseValidations(where: Prisma.ReleaseValidationWhereInput, skip: number, take: number) {
    const [items, total] = await Promise.all([
      prisma.releaseValidation.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: { environment: { select: { code: true, name: true } } },
      }),
      prisma.releaseValidation.count({ where }),
    ]);
    return { items, total };
  }

  async createReleaseValidation(data: Prisma.ReleaseValidationCreateInput) {
    return prisma.releaseValidation.create({ data });
  }

  async updateReleaseValidation(id: string, data: Prisma.ReleaseValidationUpdateInput) {
    return prisma.releaseValidation.update({ where: { id }, data });
  }

  async createAudit(data: Prisma.StagingAuditCreateInput) {
    return prisma.stagingAudit.create({ data });
  }

  async listAudits(environmentId: string | undefined, skip: number, take: number) {
    const where: Prisma.StagingAuditWhereInput = environmentId ? { environmentId } : {};
    const [items, total] = await Promise.all([
      prisma.stagingAudit.findMany({ where, skip, take, orderBy: { createdAt: 'desc' } }),
      prisma.stagingAudit.count({ where }),
    ]);
    return { items, total };
  }
}

export const stagingRepository = new StagingRepository();
