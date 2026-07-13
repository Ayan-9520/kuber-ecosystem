import type { PrismaClient } from '@prisma/client';

/** Demo Kuber Verified Professional profile — Narender Pal style showcase. */
export async function seedDemoPartnerBranding(prisma: PrismaClient): Promise<void> {
  const partner = await prisma.partner.findFirst({
    where: { partnerCode: 'DSA-DEMO-001', deletedAt: null },
  });
  if (!partner) {
    console.log('  → skip partner branding seed (demo DSA partner not found)');
    return;
  }

  const existing = await prisma.partnerBrandProfile.findUnique({
    where: { partnerId: partner.id },
  });

  const profileData = {
    slug: 'narender-pal',
    isPublished: true,
    displayName: 'Narender Pal',
    designation: 'Executive Partner',
    tagline: 'Trusted Financial Business Professional',
    companyName: 'Kesar Enterprises',
    companyCategory: 'Financial Services',
    biography:
      'Narender Pal is the Founder of Kesar Enterprises and an Executive Partner with Kuber Finserve. With over 15 years of experience in home loans, business finance, and insurance advisory, he has helped thousands of families and businesses achieve their financial goals across Delhi NCR.\n\nAs a Kuber Verified Professional™, Narender combines the independence of his own brand with the technology, products, and credibility of the Kuber Finserve ecosystem.',
    mission: 'To make quality financial advisory accessible to every family and business in India.',
    vision: 'To be the most trusted financial business partner in Delhi NCR.',
    experienceYears: 15,
    businessSince: 2010,
    languages: ['English', 'Hindi', 'Punjabi'],
    workingAreas: ['Delhi', 'Gurgaon', 'Noida', 'Faridabad', 'Ghaziabad'],
    city: 'Delhi NCR',
    state: 'Delhi',
    founderName: 'Narender Pal',
    establishedYear: 2010,
    officeAddress: 'Connaught Place, New Delhi, India',
    citiesServed: ['Delhi', 'Gurgaon', 'Noida', 'Chandigarh', 'Panipat'],
    phone: partner.phone,
    whatsapp: partner.phone,
    email: partner.email,
    seoTitle: 'Narender Pal | Kesar Enterprises | Kuber Verified Professional',
    seoDescription:
      'Narender Pal — Founder of Kesar Enterprises, Executive Partner at Kuber Finserve. Home Loan, Business Loan, Insurance & LAP expert in Delhi NCR. Book consultation.',
    seoKeywords: ['Home Loan Consultant Delhi', 'Loan Expert NCR', 'Insurance Consultant Gurgaon', 'Business Loan Expert'],
    businessFacilitated: 850000000,
    customersServed: 2400,
    customerRating: 4.9,
    partnerSince: partner.createdAt,
    productsCount: 8,
    citiesCovered: 12,
    statsVerified: true,
    publishedAt: new Date(),
  };

  let profileId: string;

  if (existing) {
    await prisma.partnerBrandProfile.update({
      where: { id: existing.id },
      data: profileData,
    });
    profileId = existing.id;
  } else {
    const created = await prisma.partnerBrandProfile.create({
      data: {
        partnerId: partner.id,
        ...profileData,
      },
    });
    profileId = created.id;
  }

  await prisma.partnerBrandExpertise.deleteMany({ where: { profileId } });
  await prisma.partnerBrandExpertise.createMany({
    data: [
      { profileId, type: 'HOME_LOAN', isPrimary: true, sortOrder: 0 },
      { profileId, type: 'BUSINESS_LOAN', isPrimary: false, sortOrder: 1 },
      { profileId, type: 'INSURANCE', isPrimary: false, sortOrder: 2 },
      { profileId, type: 'LOAN_AGAINST_PROPERTY', isPrimary: false, sortOrder: 3 },
      { profileId, type: 'CREDIT_CARDS', isPrimary: false, sortOrder: 4 },
    ],
  });

  await prisma.partnerBrandBadge.deleteMany({ where: { profileId } });
  await prisma.partnerBrandBadge.createMany({
    data: [
      { profileId, type: 'VERIFIED_PROFESSIONAL' },
      { profileId, type: 'KUBER_CERTIFIED' },
      { profileId, type: 'KYC_VERIFIED' },
      { profileId, type: 'IDENTITY_VERIFIED' },
      { profileId, type: 'ACADEMY_CERTIFIED' },
      { profileId, type: 'TOP_PERFORMER' },
      { profileId, type: 'TRUSTED_PROFESSIONAL' },
    ],
  });

  await prisma.partnerBrandAchievement.deleteMany({ where: { profileId } });
  await prisma.partnerBrandAchievement.createMany({
    data: [
      { profileId, type: 'TOP_PERFORMER', title: 'Top Performer 2025', year: 2025, isVerified: true, sortOrder: 0 },
      { profileId, type: 'ELITE_PARTNER', title: 'Elite Partner', year: 2024, isVerified: true, sortOrder: 1 },
      { profileId, type: 'CHAIRMANS_CIRCLE', title: "Chairman's Circle", year: 2024, isVerified: true, sortOrder: 2 },
    ],
  });

  await prisma.partnerBrandCertificate.deleteMany({ where: { profileId } });
  await prisma.partnerBrandCertificate.createMany({
    data: [
      { profileId, type: 'KUBER_ACADEMY', title: 'Kuber Academy Certified Advisor', issuer: 'Kuber Finserve', isVerified: true, sortOrder: 0 },
      { profileId, type: 'INSURANCE', title: 'IRDAI Insurance Certification', issuer: 'Kuber Academy', isVerified: true, sortOrder: 1 },
      { profileId, type: 'SALES', title: 'Sales Excellence Certificate', issuer: 'Kuber Finserve', isVerified: true, sortOrder: 2 },
    ],
  });

  await prisma.partnerBrandReview.deleteMany({ where: { profileId } });
  await prisma.partnerBrandReview.createMany({
    data: [
      {
        profileId,
        reviewerName: 'Rajesh Kumar',
        rating: 5,
        comment: 'Narender helped us get the best home loan rate. Highly professional and transparent process.',
        isVerified: true,
      },
      {
        profileId,
        reviewerName: 'Priya Sharma',
        rating: 5,
        comment: 'Excellent business loan advisory for our MSME. Kesar Enterprises is truly trustworthy.',
        isVerified: true,
      },
    ],
  });

  console.log('  → demo partner branding seeded (slug: narender-pal)');
}
