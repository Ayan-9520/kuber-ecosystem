import type { Prisma } from '@kuberone/database';
import { prisma } from '@kuberone/database';

export class MobileReleaseRepository {
  async listBuilds(where: Prisma.MobileBuildWhereInput, skip: number, take: number) {
    const [items, total] = await Promise.all([
      prisma.mobileBuild.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: { release: { select: { id: true, versionName: true, status: true } } },
      }),
      prisma.mobileBuild.count({ where }),
    ]);
    return { items, total };
  }

  async createBuild(data: Prisma.MobileBuildCreateInput) {
    return prisma.mobileBuild.create({ data });
  }

  async updateBuild(id: string, data: Prisma.MobileBuildUpdateInput) {
    return prisma.mobileBuild.update({ where: { id }, data });
  }

  async findBuildById(id: string) {
    return prisma.mobileBuild.findUnique({ where: { id }, include: { release: true } });
  }

  async listReleases(where: Prisma.MobileReleaseWhereInput, skip: number, take: number) {
    const [items, total] = await Promise.all([
      prisma.mobileRelease.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: { builds: { orderBy: { createdAt: 'desc' }, take: 3 } },
      }),
      prisma.mobileRelease.count({ where }),
    ]);
    return { items, total };
  }

  async createRelease(data: Prisma.MobileReleaseCreateInput) {
    return prisma.mobileRelease.create({ data });
  }

  async updateRelease(id: string, data: Prisma.MobileReleaseUpdateInput) {
    return prisma.mobileRelease.update({ where: { id }, data });
  }

  async findReleaseById(id: string) {
    return prisma.mobileRelease.findUnique({
      where: { id },
      include: { builds: { orderBy: { createdAt: 'desc' } }, audits: { orderBy: { createdAt: 'desc' }, take: 20 } },
    });
  }

  async createAudit(data: Prisma.MobileReleaseAuditCreateInput) {
    return prisma.mobileReleaseAudit.create({ data });
  }

  async countBuildsByStatus() {
    const groups = await prisma.mobileBuild.groupBy({
      by: ['status'],
      _count: { id: true },
    });
    return Object.fromEntries(groups.map((g) => [g.status, g._count.id]));
  }

  async latestSuccessfulBuild(app: 'CUSTOMER' | 'DSA', environment: 'PRODUCTION' | 'STAGING' | 'QA' | 'DEVELOPMENT') {
    return prisma.mobileBuild.findFirst({
      where: { app, environment, status: 'SUCCESS' },
      orderBy: { createdAt: 'desc' },
    });
  }
}

export const mobileReleaseRepository = new MobileReleaseRepository();
