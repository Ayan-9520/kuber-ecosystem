import type { Prisma } from '@kuberone/database';
import { prisma } from '@kuberone/database';

export class PlayStoreRepository {
  async findListingByApp(app: 'CUSTOMER' | 'DSA') {
    return prisma.playStoreListing.findUnique({
      where: { app },
      include: {
        releases: { orderBy: { createdAt: 'desc' }, take: 5 },
        reports: { orderBy: { generatedAt: 'desc' }, take: 3 },
      },
    });
  }

  async listListings() {
    return prisma.playStoreListing.findMany({ orderBy: { app: 'asc' } });
  }

  async upsertListing(data: Prisma.PlayStoreListingCreateInput) {
    return prisma.playStoreListing.upsert({
      where: { app: data.app },
      create: data,
      update: {
        appName: data.appName,
        shortDescription: data.shortDescription,
        fullDescription: data.fullDescription,
        keywords: data.keywords,
        category: data.category,
        secondaryCategory: data.secondaryCategory,
        privacyPolicyUrl: data.privacyPolicyUrl,
        termsUrl: data.termsUrl,
        contactEmail: data.contactEmail,
        contactWebsite: data.contactWebsite,
        metadata: data.metadata ?? undefined,
      },
    });
  }

  async listReleases(where: Prisma.PlayStoreReleaseWhereInput, skip: number, take: number) {
    const [items, total] = await Promise.all([
      prisma.playStoreRelease.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: { listing: { select: { app: true, appName: true, packageName: true } } },
      }),
      prisma.playStoreRelease.count({ where }),
    ]);
    return { items, total };
  }

  async createRelease(data: Prisma.PlayStoreReleaseCreateInput) {
    return prisma.playStoreRelease.create({ data });
  }

  async createReport(data: Prisma.PlayStoreReportCreateInput) {
    return prisma.playStoreReport.create({ data });
  }

  async listReports(app?: 'CUSTOMER' | 'DSA', reportType?: Prisma.EnumPlayStoreReportTypeFilter['equals']) {
    return prisma.playStoreReport.findMany({
      where: { ...(app ? { app } : {}), ...(reportType ? { reportType } : {}) },
      orderBy: { generatedAt: 'desc' },
      take: 20,
    });
  }

  async createAudit(data: Prisma.PlayStoreAuditCreateInput) {
    return prisma.playStoreAudit.create({ data });
  }
}

export const playStoreRepository = new PlayStoreRepository();
