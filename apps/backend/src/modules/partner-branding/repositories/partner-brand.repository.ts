import type { Prisma } from '@kuberone/database';

import { prisma } from '../../../config/database.js';

const profileInclude = {
  expertises: { orderBy: { sortOrder: 'asc' as const } },
  achievements: { orderBy: { sortOrder: 'asc' as const } },
  certificates: { orderBy: { sortOrder: 'asc' as const } },
  reviews: { where: { isVerified: true }, orderBy: { reviewedAt: 'desc' as const } },
  media: { orderBy: { sortOrder: 'asc' as const } },
  gallery: { orderBy: { sortOrder: 'asc' as const } },
  socialLinks: { orderBy: { sortOrder: 'asc' as const } },
  teamMembers: { orderBy: { sortOrder: 'asc' as const } },
  badges: { where: { isActive: true } },
  partner: {
    select: {
      id: true,
      partnerCode: true,
      kycStatus: true,
      status: true,
      commissionTier: true,
      createdAt: true,
    },
  },
} satisfies Prisma.PartnerBrandProfileInclude;

export type PartnerBrandProfileRow = Prisma.PartnerBrandProfileGetPayload<{ include: typeof profileInclude }>;

export const partnerBrandRepository = {
  findBySlug(slug: string, publishedOnly = true) {
    return prisma.partnerBrandProfile.findFirst({
      where: {
        slug,
        deletedAt: null,
        ...(publishedOnly ? { isPublished: true } : {}),
      },
      include: profileInclude,
    });
  },

  findByPartnerId(partnerId: string) {
    return prisma.partnerBrandProfile.findFirst({
      where: { partnerId, deletedAt: null },
      include: profileInclude,
    });
  },

  findById(id: string) {
    return prisma.partnerBrandProfile.findFirst({
      where: { id, deletedAt: null },
      include: profileInclude,
    });
  },

  findBySlugAny(slug: string) {
    return prisma.partnerBrandProfile.findFirst({
      where: { slug, deletedAt: null },
    });
  },

  async list(where: Prisma.PartnerBrandProfileWhereInput, skip: number, take: number, orderBy: Prisma.PartnerBrandProfileOrderByWithRelationInput) {
    const [items, total] = await Promise.all([
      prisma.partnerBrandProfile.findMany({
        where,
        skip,
        take,
        orderBy,
        include: {
          expertises: true,
          badges: { where: { isActive: true } },
        },
      }),
      prisma.partnerBrandProfile.count({ where }),
    ]);
    return { items, total };
  },

  create(data: Prisma.PartnerBrandProfileCreateInput) {
    return prisma.partnerBrandProfile.create({
      data,
      include: profileInclude,
    });
  },

  update(id: string, data: Prisma.PartnerBrandProfileUpdateInput) {
    return prisma.partnerBrandProfile.update({
      where: { id },
      data,
      include: profileInclude,
    });
  },

  incrementViews(id: string) {
    return prisma.partnerBrandProfile.update({
      where: { id },
      data: { profileViews: { increment: 1 } },
    });
  },

  replaceExpertises(profileId: string, types: string[]) {
    return prisma.$transaction([
      prisma.partnerBrandExpertise.deleteMany({ where: { profileId } }),
      ...(types.length
        ? [
            prisma.partnerBrandExpertise.createMany({
              data: types.map((type, index) => ({
                profileId,
                type: type as never,
                isPrimary: index === 0,
                sortOrder: index,
              })),
            }),
          ]
        : []),
    ]);
  },

  replaceSocialLinks(profileId: string, links: { platform: string; url: string }[]) {
    return prisma.$transaction([
      prisma.partnerBrandSocialLink.deleteMany({ where: { profileId } }),
      ...(links.length
        ? [
            prisma.partnerBrandSocialLink.createMany({
              data: links.map((link, index) => ({
                profileId,
                platform: link.platform as never,
                url: link.url,
                sortOrder: index,
              })),
            }),
          ]
        : []),
    ]);
  },

  addAchievement(profileId: string, data: Prisma.PartnerBrandAchievementCreateWithoutProfileInput) {
    return prisma.partnerBrandAchievement.create({
      data: { ...data, profile: { connect: { id: profileId } } },
    });
  },

  addCertificate(profileId: string, data: Prisma.PartnerBrandCertificateCreateWithoutProfileInput) {
    return prisma.partnerBrandCertificate.create({
      data: { ...data, profile: { connect: { id: profileId } } },
    });
  },

  addReview(profileId: string, data: Prisma.PartnerBrandReviewCreateWithoutProfileInput) {
    return prisma.partnerBrandReview.create({
      data: { ...data, profile: { connect: { id: profileId } } },
    });
  },

  addMedia(profileId: string, data: Prisma.PartnerBrandMediaCreateWithoutProfileInput) {
    return prisma.partnerBrandMedia.create({
      data: { ...data, profile: { connect: { id: profileId } } },
    });
  },

  addGalleryItem(profileId: string, data: Prisma.PartnerBrandGalleryCreateWithoutProfileInput) {
    return prisma.partnerBrandGallery.create({
      data: { ...data, profile: { connect: { id: profileId } } },
    });
  },

  addTeamMember(profileId: string, data: Prisma.PartnerBrandTeamMemberCreateWithoutProfileInput) {
    return prisma.partnerBrandTeamMember.create({
      data: { ...data, profile: { connect: { id: profileId } } },
    });
  },

  upsertBadges(profileId: string, types: string[]) {
    return prisma.$transaction(
      types.map((type) =>
        prisma.partnerBrandBadge.upsert({
          where: { profileId_type: { profileId, type: type as never } },
          create: { profileId, type: type as never },
          update: { isActive: true },
        }),
      ),
    );
  },

  saveGeneratedContent(profileId: string, type: string, title: string | null, body: string, metadata?: Record<string, unknown>) {
    return prisma.partnerBrandGeneratedContent.create({
      data: {
        profileId,
        type: type as never,
        title,
        body,
        metadata: metadata ?? undefined,
      },
    });
  },

  getPartner(partnerId: string) {
    return prisma.partner.findFirst({
      where: { id: partnerId, deletedAt: null },
      include: { partnerType: true },
    });
  },
};
