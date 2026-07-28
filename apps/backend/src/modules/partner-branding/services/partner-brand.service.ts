import type {
  GenerateBrandContentInput,
  ListProfessionalsQuery,
  PartnerBrandAchievementInput,
  PartnerBrandCertificateInput,
  PartnerBrandGalleryInput,
  PartnerBrandMediaInput,
  PartnerBrandReviewInput,
  PartnerBrandTeamMemberInput,
  UpdatePartnerBrandProfileInput,
} from '@kuberone/shared-validation';
import type { AuthenticatedUser } from '@kuberone/shared-types';
import type { Prisma } from '@kuberone/database';

import { completionService } from '../../ai-platform/services/completion.service.js';
import { ConflictError, ForbiddenError, NotFoundError } from '../../../shared/errors/app-error.js';
import { partnerBrandRepository, type PartnerBrandProfileRow } from '../repositories/partner-brand.repository.js';

const EXPERTISE_LABELS: Record<string, string> = {
  HOME_LOAN: 'Home Loan',
  BUSINESS_LOAN: 'Business Loan',
  LOAN_AGAINST_PROPERTY: 'Loan Against Property',
  WORKING_CAPITAL: 'Working Capital',
  INSURANCE: 'Insurance',
  CREDIT_CARDS: 'Credit Cards',
  PERSONAL_LOAN: 'Personal Loan',
  MSME_FINANCE: 'MSME Finance',
  BUILDER_FUNDING: 'Builder Funding',
  PROJECT_FINANCE: 'Project Finance',
  VEHICLE_LOAN: 'Vehicle Loan',
};

const BADGE_LABELS: Record<string, string> = {
  VERIFIED_PROFESSIONAL: 'Verified Professional',
  KUBER_CERTIFIED: 'Kuber Certified',
  IDENTITY_VERIFIED: 'Identity Verified',
  KYC_VERIFIED: 'KYC Verified',
  ACADEMY_CERTIFIED: 'Academy Certified',
  TOP_PERFORMER: 'Top Performer',
  OFFICE_VERIFIED: 'Office Verified',
  GST_VERIFIED: 'GST Verified',
  FAST_RESPONSE: 'Fast Response',
  TRUSTED_PROFESSIONAL: 'Trusted Professional',
};

const CONTENT_PROMPTS: Record<string, string> = {
  BIOGRAPHY:
    'Write a premium professional biography (3-4 paragraphs) for a Kuber Verified Financial Business Professional. Tone: Forbes executive profile. Include experience, expertise, and trust.',
  LINKEDIN_SUMMARY: 'Write a LinkedIn Premium-style summary (max 2600 chars) for a financial business professional.',
  FACEBOOK_INTRO: 'Write a Facebook business page intro (2 short paragraphs) for a financial consultant.',
  INSTAGRAM_BIO: 'Write an Instagram bio (max 150 chars) with emojis for a loan & insurance expert.',
  BUSINESS_DESCRIPTION: 'Write a business description for a financial services company (2 paragraphs).',
  COMPANY_DESCRIPTION: 'Write a company profile description highlighting services, cities served, and trust.',
  SEO_TITLE: 'Write an SEO meta title (max 60 chars) for a financial consultant profile page.',
  SEO_DESCRIPTION: 'Write an SEO meta description (max 155 chars) for a financial consultant profile.',
  ARTICLE: 'Write a weekly finance awareness article (400-600 words) with a compelling title.',
  BLOG: 'Write a monthly blog post (600-800 words) on loans or insurance with practical tips.',
  REELS_CAPTION: 'Write an Instagram Reels caption with hooks and hashtags for a finance tip.',
  SUCCESS_STORY: 'Write a customer success story (250 words) for a loan/insurance case.',
  CASE_STUDY: 'Write a professional case study (300 words) showing business impact.',
  LINKEDIN_POST: 'Write a LinkedIn post (150-200 words) with a professional hook and CTA.',
  FACEBOOK_POST: 'Write a Facebook post (100-150 words) for a financial advisor audience.',
  INSTAGRAM_CAPTION: 'Write an Instagram caption with hashtags for a finance professional.',
  BUSINESS_QUOTE: 'Write an inspiring business quote (1-2 sentences) for social sharing.',
  MARKET_UPDATE: 'Write a brief market update on home loan/insurance rates (100 words).',
  FINANCE_TIP: 'Write a practical finance tip (80 words) for customers.',
  FESTIVAL_GREETING: 'Write a warm festival greeting message for financial clients.',
  BIRTHDAY_WISH: 'Write a professional birthday wish message for a client.',
  LOAN_AWARENESS: 'Write a loan awareness post explaining benefits and eligibility.',
  INSURANCE_AWARENESS: 'Write an insurance awareness post on protection and planning.',
};

/** Role / partner-type based starter pack — marketplace-style defaults partners can edit later. */
const ROLE_STARTERS: Record<
  string,
  {
    designation: string;
    companyCategory: string;
    expertises: string[];
    workingAreas: string[];
    tagline: string;
  }
> = {
  DSA: {
    designation: 'Executive Partner — Financial Solutions',
    companyCategory: 'Financial Services',
    expertises: ['HOME_LOAN', 'BUSINESS_LOAN', 'PERSONAL_LOAN', 'INSURANCE', 'CREDIT_CARDS'],
    workingAreas: ['Home Loans', 'Business Loans', 'Personal Loans', 'Insurance', 'Credit Cards'],
    tagline: 'Trusted guidance for loans, insurance, and financial growth',
  },
  BUILDER: {
    designation: 'Builder Alliance Partner',
    companyCategory: 'Real Estate & Housing Finance',
    expertises: ['HOME_LOAN', 'BUILDER_FUNDING', 'PROJECT_FINANCE', 'LOAN_AGAINST_PROPERTY'],
    workingAreas: ['Home Loans', 'Project Finance', 'Builder Funding', 'LAP'],
    tagline: 'End-to-end home finance for projects and homebuyers',
  },
  PROPERTY_DEALER: {
    designation: 'Property Finance Advisor',
    companyCategory: 'Property & Mortgage Advisory',
    expertises: ['HOME_LOAN', 'LOAN_AGAINST_PROPERTY', 'BUSINESS_LOAN'],
    workingAreas: ['Home Loans', 'Loan Against Property', 'Resale Finance'],
    tagline: 'Property deals backed by the right finance options',
  },
  CA: {
    designation: 'Chartered Advisor Partner',
    companyCategory: 'Tax, Audit & Finance Advisory',
    expertises: ['BUSINESS_LOAN', 'WORKING_CAPITAL', 'MSME_FINANCE', 'PERSONAL_LOAN'],
    workingAreas: ['Business Loans', 'Working Capital', 'MSME Finance', 'Tax-linked Planning'],
    tagline: 'Finance solutions aligned with tax and business clarity',
  },
  BROKER: {
    designation: 'Loan & Insurance Broker Partner',
    companyCategory: 'Brokerage — Loans & Insurance',
    expertises: ['HOME_LOAN', 'PERSONAL_LOAN', 'VEHICLE_LOAN', 'INSURANCE', 'CREDIT_CARDS'],
    workingAreas: ['Home Loans', 'Personal Loans', 'Vehicle Loans', 'Insurance'],
    tagline: 'Compare, advise, and close the right product for every customer',
  },
  CORPORATE: {
    designation: 'Corporate Channel Partner',
    companyCategory: 'Corporate Financial Solutions',
    expertises: ['BUSINESS_LOAN', 'WORKING_CAPITAL', 'PROJECT_FINANCE', 'INSURANCE'],
    workingAreas: ['Corporate Loans', 'Working Capital', 'Employee Benefits'],
    tagline: 'Institutional-grade finance access for teams and enterprises',
  },
  CHANNEL_PARTNER: {
    designation: 'Channel Partner — Kuber Network',
    companyCategory: 'Financial Services',
    expertises: ['HOME_LOAN', 'BUSINESS_LOAN', 'PERSONAL_LOAN', 'INSURANCE'],
    workingAreas: ['Loans', 'Insurance', 'Customer Advisory'],
    tagline: 'Your neighbourhood partner for trusted financial products',
  },
  REFERRAL: {
    designation: 'Referral Partner',
    companyCategory: 'Financial Referrals',
    expertises: ['HOME_LOAN', 'PERSONAL_LOAN', 'INSURANCE'],
    workingAreas: ['Loan Referrals', 'Insurance Referrals'],
    tagline: 'Connecting customers to verified financial solutions',
  },
};

type PartnerSeedRow = {
  contactName: string;
  businessName: string | null;
  phone: string;
  email: string | null;
  createdAt: Date;
  kycStatus: string;
  partnerType?: { code: string; name: string } | null;
};

function roleStarter(partnerTypeCode?: string | null) {
  const code = (partnerTypeCode ?? 'DSA').toUpperCase();
  return ROLE_STARTERS[code] ?? ROLE_STARTERS.DSA!;
}

function buildStarterBiography(partner: PartnerSeedRow, starter: ReturnType<typeof roleStarter>): string {
  const name = partner.contactName;
  const company = partner.businessName || name;
  const role = partner.partnerType?.name || 'Financial Partner';
  const products = starter.workingAreas.slice(0, 3).join(', ');
  const first = name.split(' ')[0] || name;

  return [
    `${name} is a Kuber Verified Financial Business Professional associated with ${company}. As a ${role} in the Kuber Finserve network, ${first} helps individuals and businesses access the right loan and insurance solutions with clarity and trust.`,
    `Core focus areas include ${products}, with end-to-end support from eligibility guidance and documentation to lender coordination and disbursement follow-up. Customers get practical advice — not product pressure.`,
    `Powered by Kuber Finserve technology and a pan-India product network, this practice combines local relationship strength with institutional process discipline. Reach out for a consultation tailored to your goals.`,
  ].join('\n\n');
}

function buildStarterProfileFields(partner: PartnerSeedRow) {
  const starter = roleStarter(partner.partnerType?.code);
  const company = partner.businessName || partner.contactName;
  const year = partner.createdAt.getFullYear();

  return {
    displayName: partner.contactName,
    designation: starter.designation,
    companyName: company,
    companyCategory: starter.companyCategory,
    tagline: starter.tagline,
    biography: buildStarterBiography(partner, starter),
    mission: 'Help every customer secure fair, suitable finance with transparent guidance and timely support.',
    vision:
      'Become the most trusted neighbourhood financial practice — backed by Kuber Finserve verification and technology.',
    languages: ['English', 'Hindi'] as string[],
    workingAreas: starter.workingAreas,
    citiesServed: [] as string[],
    founderName: partner.contactName,
    establishedYear: year,
    phone: partner.phone,
    whatsapp: partner.phone,
    email: partner.email,
    partnerSince: partner.createdAt,
    seoTitle: `${partner.contactName} | Kuber Verified Professional`,
    seoDescription: `${partner.contactName} — ${starter.tagline}. Associated with ${company}. Powered by Kuber Finserve.`,
    seoKeywords: ['Kuber Verified Professional', ...starter.workingAreas, company],
    expertises: starter.expertises,
  };
}

export function slugifyName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80);
}

function buildPaginationMeta(page: number, limit: number, total: number) {
  return { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) };
}

function parseJsonArray(value: unknown): string[] {
  if (!value) return [];
  if (Array.isArray(value)) return value.map(String);
  return [];
}

function computeBadges(profile: PartnerBrandProfileRow): string[] {
  const badges: string[] = ['VERIFIED_PROFESSIONAL', 'KUBER_CERTIFIED'];

  if (profile.partner.kycStatus === 'VERIFIED') {
    badges.push('IDENTITY_VERIFIED', 'KYC_VERIFIED');
  }
  if (profile.certificates.some((c) => c.type === 'KUBER_ACADEMY' && c.isVerified)) {
    badges.push('ACADEMY_CERTIFIED');
  }
  if (profile.achievements.some((a) => a.type === 'TOP_PERFORMER' && a.isVerified)) {
    badges.push('TOP_PERFORMER');
  }
  if (profile.gstNumber) {
    badges.push('GST_VERIFIED');
  }
  if (profile.officeAddress) {
    badges.push('OFFICE_VERIFIED');
  }
  if (profile.customerRating && Number(profile.customerRating) >= 4.5) {
    badges.push('TRUSTED_PROFESSIONAL');
  }
  if (profile.phone && profile.whatsapp) {
    badges.push('FAST_RESPONSE');
  }

  return [...new Set(badges)];
}

function toPublicProfile(profile: PartnerBrandProfileRow, baseUrl: string) {
  const expertiseLabels = profile.expertises.map((e) => EXPERTISE_LABELS[e.type] ?? e.type);
  const badgeTypes = profile.badges.length ? profile.badges.map((b) => b.type) : computeBadges(profile);

  return {
    id: profile.id,
    slug: profile.slug,
    profileUrl: `${baseUrl}/partner/${profile.slug}`,
    isPublished: profile.isPublished,
    coverImageUrl: profile.coverImageUrl,
    photoUrl: profile.photoUrl,
    companyLogoUrl: profile.companyLogoUrl,
    displayName: profile.displayName,
    designation: profile.designation ?? 'Executive Partner',
    tagline: profile.tagline,
    companyName: profile.companyName,
    companyCategory: profile.companyCategory,
    associatedWith: 'Kuber Finserve',
    poweredBy: 'Kuber Finserve',
    biography: profile.biography,
    mission: profile.mission,
    vision: profile.vision,
    experienceYears: profile.experienceYears,
    businessSince: profile.businessSince,
    languages: parseJsonArray(profile.languages),
    workingAreas: parseJsonArray(profile.workingAreas),
    gender: profile.gender,
    location: {
      city: profile.city,
      state: profile.state,
      country: profile.country,
      label: [profile.city, profile.state].filter(Boolean).join(', '),
    },
    company: {
      name: profile.companyName,
      logoUrl: profile.companyLogoUrl,
      category: profile.companyCategory,
      gstNumber: profile.gstNumber,
      establishedYear: profile.establishedYear,
      founderName: profile.founderName,
      officeAddress: profile.officeAddress,
      citiesServed: parseJsonArray(profile.citiesServed),
      website: profile.companyWebsite,
    },
    contact: {
      phone: profile.phone,
      whatsapp: profile.whatsapp,
      email: profile.email,
      consultationUrl: profile.consultationUrl,
      calendarUrl: profile.calendarUrl,
      applyLoanUrl: profile.applyLoanUrl,
      applyInsuranceUrl: profile.applyInsuranceUrl,
    },
    seo: {
      title:
        profile.seoTitle ??
        `${profile.displayName} | ${profile.companyName ?? 'Financial Consultant'} | Kuber Verified Professional`,
      description:
        profile.seoDescription ??
        `${profile.displayName} — ${profile.designation ?? 'Executive Partner'} at ${profile.companyName ?? 'Kuber Finserve'}. ${expertiseLabels.slice(0, 4).join(' | ')}. ${profile.city ?? 'India'}.`,
      keywords: parseJsonArray(profile.seoKeywords),
    },
    expertises: profile.expertises.map((e) => ({
      type: e.type,
      label: EXPERTISE_LABELS[e.type] ?? e.type,
      isPrimary: e.isPrimary,
    })),
    statistics: profile.statsVerified
      ? {
          businessFacilitated: profile.businessFacilitated ? Number(profile.businessFacilitated) : null,
          customersServed: profile.customersServed,
          experienceYears: profile.experienceYears,
          partnerSince: profile.partnerSince?.toISOString() ?? profile.partner.createdAt.toISOString(),
          customerRating: profile.customerRating ? Number(profile.customerRating) : null,
          productsCount: profile.productsCount,
          citiesCovered: profile.citiesCovered,
          verified: true,
        }
      : null,
    achievements: profile.achievements.map((a) => ({
      id: a.id,
      type: a.type,
      title: a.title,
      description: a.description,
      year: a.year,
      imageUrl: a.imageUrl,
      isVerified: a.isVerified,
    })),
    certificates: profile.certificates.map((c) => ({
      id: c.id,
      type: c.type,
      title: c.title,
      issuer: c.issuer,
      issuedAt: c.issuedAt?.toISOString() ?? null,
      imageUrl: c.imageUrl,
      downloadUrl: c.downloadUrl,
      isVerified: c.isVerified,
    })),
    reviews: profile.reviews.map((r) => ({
      id: r.id,
      reviewerName: r.reviewerName,
      rating: r.rating,
      comment: r.comment,
      photoUrl: r.photoUrl,
      videoUrl: r.videoUrl,
      reviewedAt: r.reviewedAt.toISOString(),
    })),
    media: profile.media.map((m) => ({
      id: m.id,
      type: m.type,
      title: m.title,
      description: m.description,
      url: m.url,
      thumbnailUrl: m.thumbnailUrl,
      publishedAt: m.publishedAt?.toISOString() ?? null,
    })),
    gallery: profile.gallery.map((g) => ({
      id: g.id,
      category: g.category,
      title: g.title,
      imageUrl: g.imageUrl,
      caption: g.caption,
    })),
    team: profile.teamMembers.map((t) => ({
      id: t.id,
      name: t.name,
      role: t.role,
      photoUrl: t.photoUrl,
    })),
    socialLinks: profile.socialLinks.map((s) => ({
      platform: s.platform,
      url: s.url,
    })),
    badges: badgeTypes.map((type) => ({
      type,
      label: BADGE_LABELS[type] ?? type,
    })),
    themePreference: profile.themePreference,
    profileViews: profile.profileViews,
    publishedAt: profile.publishedAt?.toISOString() ?? null,
    partnerCode: profile.partner.partnerCode,
    kycStatus: profile.partner.kycStatus,
  };
}

function toDirectoryItem(profile: PartnerBrandProfileRow) {
  return {
    slug: profile.slug,
    displayName: profile.displayName,
    designation: profile.designation ?? 'Executive Partner',
    companyName: profile.companyName,
    photoUrl: profile.photoUrl,
    city: profile.city,
    state: profile.state,
    experienceYears: profile.experienceYears,
    customerRating: profile.customerRating ? Number(profile.customerRating) : null,
    expertises: profile.expertises.map((e) => ({
      type: e.type,
      label: EXPERTISE_LABELS[e.type] ?? e.type,
    })),
    badges: profile.badges.map((b) => ({
      type: b.type,
      label: BADGE_LABELS[b.type] ?? b.type,
    })),
    languages: parseJsonArray(profile.languages),
  };
}

function buildListWhere(query: ListProfessionalsQuery): Prisma.PartnerBrandProfileWhereInput {
  const expertiseFilter = query.expertise
    ? { expertises: { some: { type: query.expertise } } }
    : {};

  return {
    deletedAt: null,
    isPublished: true,
    ...(query.city ? { city: { contains: query.city } } : {}),
    ...(query.state ? { state: { contains: query.state } } : {}),
    ...(query.companyName ? { companyName: { contains: query.companyName } } : {}),
    ...(query.gender ? { gender: query.gender } : {}),
    ...(query.minExperience ? { experienceYears: { gte: query.minExperience } } : {}),
    ...(query.minRating ? { customerRating: { gte: query.minRating } } : {}),
    ...(query.language
      ? {
          languages: {
            path: '$',
            array_contains: query.language,
          } as never,
        }
      : {}),
    ...(query.search
      ? {
          OR: [
            { displayName: { contains: query.search } },
            { companyName: { contains: query.search } },
            { city: { contains: query.search } },
            { designation: { contains: query.search } },
          ],
        }
      : {}),
    ...expertiseFilter,
  };
}

async function ensureUniqueSlug(baseSlug: string, excludeId?: string): Promise<string> {
  let slug = baseSlug;
  let counter = 1;
  while (true) {
    const existing = await partnerBrandRepository.findBySlugAny(slug);
    if (!existing || existing.id === excludeId) return slug;
    counter += 1;
    slug = `${baseSlug}-${counter}`;
  }
}

async function syncBadges(profileId: string, profile: PartnerBrandProfileRow) {
  const badgeTypes = computeBadges(profile);
  await partnerBrandRepository.upsertBadges(profileId, badgeTypes);
}

function buildProfileContext(profile: PartnerBrandProfileRow): string {
  const expertise = profile.expertises.map((e) => EXPERTISE_LABELS[e.type] ?? e.type).join(', ');
  return [
    `Name: ${profile.displayName}`,
    `Designation: ${profile.designation ?? 'Executive Partner'}`,
    `Company: ${profile.companyName ?? 'Independent'}`,
    `Location: ${[profile.city, profile.state].filter(Boolean).join(', ')}`,
    `Experience: ${profile.experienceYears ?? 'N/A'} years`,
    `Expertise: ${expertise || 'Financial Services'}`,
    `Languages: ${parseJsonArray(profile.languages).join(', ') || 'English, Hindi'}`,
    profile.biography ? `Bio: ${profile.biography}` : '',
  ]
    .filter(Boolean)
    .join('\n');
}

export const partnerBrandService = {
  health: async () => ({ module: 'partner-branding', status: 'ok' }),

  listProfessionals: async (query: ListProfessionalsQuery, baseUrl: string) => {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;
    const where = buildListWhere(query);

    const orderBy: Prisma.PartnerBrandProfileOrderByWithRelationInput = {
      [query.sortBy]: query.sortOrder,
    };

    const { items, total } = await partnerBrandRepository.list(where, skip, limit, orderBy);

    return {
      items: items.map(toDirectoryItem),
      meta: buildPaginationMeta(page, limit, total),
      directoryTitle: 'Find a Kuber Verified Professional™',
      baseUrl,
    };
  },

  getPublicProfile: async (slug: string, baseUrl: string) => {
    const profile = await partnerBrandRepository.findBySlug(slug, true);
    if (!profile) throw new NotFoundError('Professional profile not found');
    void partnerBrandRepository.incrementViews(profile.id);
    return toPublicProfile(profile, baseUrl);
  },

  getMyProfile: async (partnerId: string, baseUrl: string) => {
    let profile = await partnerBrandRepository.findByPartnerId(partnerId);
    const partner = await partnerBrandRepository.getPartner(partnerId);
    if (!partner) throw new NotFoundError('Partner not found');

    if (!profile) {
      const starter = buildStarterProfileFields(partner);
      const slug = await ensureUniqueSlug(slugifyName(partner.contactName));
      const { expertises, ...scalar } = starter;
      profile = await partnerBrandRepository.create({
        partner: { connect: { id: partnerId } },
        slug,
        displayName: scalar.displayName,
        designation: scalar.designation,
        companyName: scalar.companyName,
        companyCategory: scalar.companyCategory,
        tagline: scalar.tagline,
        biography: scalar.biography,
        mission: scalar.mission,
        vision: scalar.vision,
        languages: scalar.languages,
        workingAreas: scalar.workingAreas,
        citiesServed: scalar.citiesServed,
        founderName: scalar.founderName,
        establishedYear: scalar.establishedYear,
        phone: scalar.phone,
        whatsapp: scalar.whatsapp,
        email: scalar.email,
        partnerSince: scalar.partnerSince,
        seoTitle: scalar.seoTitle,
        seoDescription: scalar.seoDescription,
        seoKeywords: scalar.seoKeywords,
        isPublished: partner.kycStatus === 'VERIFIED',
        publishedAt: partner.kycStatus === 'VERIFIED' ? new Date() : null,
      });
      await partnerBrandRepository.replaceExpertises(profile.id, expertises);
      await syncBadges(profile.id, profile);
      profile = (await partnerBrandRepository.findByPartnerId(partnerId))!;
    } else {
      // Backfill thin drafts (created before starter content existed)
      const needsContent = !profile.biography || profile.expertises.length === 0 || !profile.tagline;
      if (needsContent) {
        const starter = buildStarterProfileFields(partner);
        await partnerBrandRepository.update(profile.id, {
          ...(profile.biography ? {} : { biography: starter.biography }),
          ...(profile.tagline ? {} : { tagline: starter.tagline }),
          ...(profile.mission ? {} : { mission: starter.mission }),
          ...(profile.vision ? {} : { vision: starter.vision }),
          ...(profile.designation && profile.designation !== 'Executive Partner'
            ? {}
            : { designation: starter.designation }),
          ...(profile.companyCategory ? {} : { companyCategory: starter.companyCategory }),
          ...(profile.founderName ? {} : { founderName: starter.founderName }),
          ...(profile.establishedYear ? {} : { establishedYear: starter.establishedYear }),
          ...(parseJsonArray(profile.languages).length
            ? {}
            : { languages: starter.languages }),
          ...(parseJsonArray(profile.workingAreas).length
            ? {}
            : { workingAreas: starter.workingAreas }),
          ...(profile.seoTitle ? {} : { seoTitle: starter.seoTitle }),
          ...(profile.seoDescription ? {} : { seoDescription: starter.seoDescription }),
          ...(parseJsonArray(profile.seoKeywords).length
            ? {}
            : { seoKeywords: starter.seoKeywords }),
          ...(profile.whatsapp ? {} : { whatsapp: starter.whatsapp }),
        });
        if (profile.expertises.length === 0) {
          await partnerBrandRepository.replaceExpertises(profile.id, starter.expertises);
        }
        profile = (await partnerBrandRepository.findByPartnerId(partnerId))!;
      }

      // Real flow: KYC verified → public website goes live automatically
      if (partner.kycStatus === 'VERIFIED' && !profile.isPublished) {
        await partnerBrandRepository.update(profile.id, {
          isPublished: true,
          publishedAt: new Date(),
        });
        profile = (await partnerBrandRepository.findByPartnerId(partnerId))!;
      }

      await syncBadges(profile.id, profile);
      profile = (await partnerBrandRepository.findByPartnerId(partnerId))!;
    }

    return toPublicProfile(profile, baseUrl);
  },

  /** Called when Admin verifies KYC — ensure public site exists and is live. */
  ensurePublishedAfterKyc: async (partnerId: string, baseUrl: string) => {
    await partnerBrandService.getMyProfile(partnerId, baseUrl);
    const profile = await partnerBrandRepository.findByPartnerId(partnerId);
    if (!profile) return null;
    if (!profile.isPublished) {
      const updated = await partnerBrandRepository.update(profile.id, {
        isPublished: true,
        publishedAt: new Date(),
      });
      return toPublicProfile(updated, baseUrl);
    }
    return toPublicProfile(profile, baseUrl);
  },

  updateMyProfile: async (partnerId: string, input: UpdatePartnerBrandProfileInput, baseUrl: string) => {
    const profile = await partnerBrandRepository.findByPartnerId(partnerId);
    if (!profile) throw new NotFoundError('Brand profile not found — open profile first to initialize');

    let slug = input.slug;
    if (slug && slug !== profile.slug) {
      slug = await ensureUniqueSlug(slug, profile.id);
    }

    const { expertises, socialLinks, ...scalarFields } = input;

    await partnerBrandRepository.update(profile.id, {
      ...scalarFields,
      ...(slug ? { slug } : {}),
      languages: input.languages ?? undefined,
      workingAreas: input.workingAreas ?? undefined,
      citiesServed: input.citiesServed ?? undefined,
      seoKeywords: input.seoKeywords ?? undefined,
    });

    if (expertises) {
      await partnerBrandRepository.replaceExpertises(profile.id, expertises);
    }
    if (socialLinks) {
      await partnerBrandRepository.replaceSocialLinks(profile.id, socialLinks);
    }

    const refreshed = (await partnerBrandRepository.findByPartnerId(partnerId))!;
    await syncBadges(profile.id, refreshed);
    const finalProfile = (await partnerBrandRepository.findByPartnerId(partnerId))!;
    return toPublicProfile(finalProfile, baseUrl);
  },

  publishMyProfile: async (partnerId: string, publish: boolean, baseUrl: string) => {
    const profile = await partnerBrandRepository.findByPartnerId(partnerId);
    if (!profile) throw new NotFoundError('Brand profile not found');

    const partner = await partnerBrandRepository.getPartner(partnerId);
    if (publish && partner?.kycStatus !== 'VERIFIED') {
      throw new ForbiddenError('Complete KYC verification before publishing your public profile');
    }

    const updated = await partnerBrandRepository.update(profile.id, {
      isPublished: publish,
      publishedAt: publish ? new Date() : null,
    });

    return toPublicProfile(updated, baseUrl);
  },

  generateContent: async (
    partnerId: string,
    input: GenerateBrandContentInput,
    actor: AuthenticatedUser,
    ctx: { ipAddress?: string },
  ) => {
    const profile = await partnerBrandRepository.findByPartnerId(partnerId);
    if (!profile) throw new NotFoundError('Brand profile not found');

    const systemPrompt =
      'You are a premium personal branding copywriter for Kuber Finserve Verified Financial Professionals. Write polished, trustworthy, conversion-focused content. Never mention DSA. Position the professional as an independent business owner backed by Kuber Finserve technology.';
    const userPrompt = `${CONTENT_PROMPTS[input.type] ?? 'Generate professional branding content.'}\n\nProfile context:\n${buildProfileContext(profile)}${input.prompt ? `\n\nAdditional instructions: ${input.prompt}` : ''}`;

    const result = await completionService.chat(
      {
        module: 'CONTENT',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        fallback: () => ({
          content: `${profile.displayName} is a trusted Kuber Verified Financial Business Professional offering ${profile.expertises.map((e) => EXPERTISE_LABELS[e.type]).join(', ') || 'comprehensive financial solutions'} in ${profile.city ?? 'India'}. Associated with Kuber Finserve — your partner for loans, insurance, and financial planning.`,
          model: 'rules-engine',
          tokensUsed: 0,
        }),
      },
      { actorId: actor.id, ipAddress: ctx.ipAddress },
      actor,
    );

    const body = result.content;
    const saved = await partnerBrandRepository.saveGeneratedContent(profile.id, input.type, null, body, {
      model: result.model,
      tokensUsed: result.totalTokens,
    });

    return {
      id: saved.id,
      type: input.type,
      body,
      createdAt: saved.createdAt.toISOString(),
    };
  },

  addAchievement: async (partnerId: string, input: PartnerBrandAchievementInput) => {
    const profile = await partnerBrandRepository.findByPartnerId(partnerId);
    if (!profile) throw new NotFoundError('Brand profile not found');
    return partnerBrandRepository.addAchievement(profile.id, {
      type: input.type,
      title: input.title,
      description: input.description,
      year: input.year,
      imageUrl: input.imageUrl,
    });
  },

  addCertificate: async (partnerId: string, input: PartnerBrandCertificateInput) => {
    const profile = await partnerBrandRepository.findByPartnerId(partnerId);
    if (!profile) throw new NotFoundError('Brand profile not found');
    return partnerBrandRepository.addCertificate(profile.id, {
      type: input.type,
      title: input.title,
      issuer: input.issuer,
      issuedAt: input.issuedAt ? new Date(input.issuedAt) : undefined,
      imageUrl: input.imageUrl,
      downloadUrl: input.downloadUrl,
    });
  },

  addReview: async (partnerId: string, input: PartnerBrandReviewInput) => {
    const profile = await partnerBrandRepository.findByPartnerId(partnerId);
    if (!profile) throw new NotFoundError('Brand profile not found');
    return partnerBrandRepository.addReview(profile.id, {
      reviewerName: input.reviewerName,
      rating: input.rating,
      comment: input.comment,
      photoUrl: input.photoUrl,
      videoUrl: input.videoUrl,
      isVerified: false,
    });
  },

  addMedia: async (partnerId: string, input: PartnerBrandMediaInput) => {
    const profile = await partnerBrandRepository.findByPartnerId(partnerId);
    if (!profile) throw new NotFoundError('Brand profile not found');
    return partnerBrandRepository.addMedia(profile.id, {
      type: input.type,
      title: input.title,
      description: input.description,
      url: input.url,
      thumbnailUrl: input.thumbnailUrl,
    });
  },

  addGalleryItem: async (partnerId: string, input: PartnerBrandGalleryInput) => {
    const profile = await partnerBrandRepository.findByPartnerId(partnerId);
    if (!profile) throw new NotFoundError('Brand profile not found');
    return partnerBrandRepository.addGalleryItem(profile.id, {
      category: input.category,
      title: input.title,
      imageUrl: input.imageUrl,
      caption: input.caption,
    });
  },

  addTeamMember: async (partnerId: string, input: PartnerBrandTeamMemberInput) => {
    const profile = await partnerBrandRepository.findByPartnerId(partnerId);
    if (!profile) throw new NotFoundError('Brand profile not found');
    return partnerBrandRepository.addTeamMember(profile.id, {
      name: input.name,
      role: input.role,
      photoUrl: input.photoUrl,
    });
  },

  getShareUrls: (slug: string, baseUrl: string, displayName: string) => {
    const profileUrl = `${baseUrl}/partner/${slug}`;
    const text = encodeURIComponent(`${displayName} — Kuber Verified Professional™`);
    const url = encodeURIComponent(profileUrl);
    return {
      profileUrl,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      whatsapp: `https://wa.me/?text=${text}%20${url}`,
      x: `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
      telegram: `https://t.me/share/url?url=${url}&text=${text}`,
      email: `mailto:?subject=${text}&body=${url}`,
    };
  },
};
