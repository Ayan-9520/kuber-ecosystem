import type { Prisma } from '@kuberone/database';
import { prisma } from '@kuberone/database';

export class AppStoreRepository {
  async findListingByApp(app: 'CUSTOMER' | 'DSA') {
    return prisma.appStoreListing.findUnique({
      where: { app },
      include: {
        releases: { orderBy: { createdAt: 'desc' }, take: 5 },
        reports: { orderBy: { generatedAt: 'desc' }, take: 3 },
      },
    });
  }

  async listListings() {
    return prisma.appStoreListing.findMany({ orderBy: { app: 'asc' } });
  }

  async listReleases(where: Prisma.AppStoreReleaseWhereInput, skip: number, take: number) {
    const [items, total] = await Promise.all([
      prisma.appStoreRelease.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: { listing: { select: { app: true, appName: true, bundleId: true } } },
      }),
      prisma.appStoreRelease.count({ where }),
    ]);
    return { items, total };
  }

  async createRelease(data: Prisma.AppStoreReleaseCreateInput) {
    return prisma.appStoreRelease.create({ data });
  }

  async createReport(data: Prisma.AppStoreReportCreateInput) {
    return prisma.appStoreReport.create({ data });
  }

  async listReports(app?: 'CUSTOMER' | 'DSA') {
    return prisma.appStoreReport.findMany({
      where: app ? { app } : undefined,
      orderBy: { generatedAt: 'desc' },
      take: 20,
    });
  }

  async createAudit(data: Prisma.AppStoreAuditCreateInput) {
    return prisma.appStoreAudit.create({ data });
  }
}

export const appStoreRepository = new AppStoreRepository();
