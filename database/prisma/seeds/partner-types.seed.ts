import type { PrismaClient } from '@prisma/client';

const PARTNER_TYPES = [
  { code: 'DSA', name: 'Direct Selling Agent', description: 'DSA partner channel' },
  { code: 'BUILDER', name: 'Builder Partner', description: 'Real estate builder partner' },
  { code: 'PROPERTY_DEALER', name: 'Property Dealer', description: 'Property dealer partner channel' },
  { code: 'CA', name: 'Chartered Accountant', description: 'CA referral partner' },
  { code: 'BROKER', name: 'Broker Partner', description: 'Loan and property broker partner' },
  { code: 'CORPORATE', name: 'Corporate Partner', description: 'Corporate tie-up partner' },
  { code: 'CHANNEL_PARTNER', name: 'Channel Partner', description: 'General channel partner' },
  { code: 'REFERRAL', name: 'Referral Partner', description: 'Legacy referral partner code' },
];

export async function seedPartnerTypes(prisma: PrismaClient): Promise<void> {
  for (const type of PARTNER_TYPES) {
    await prisma.partnerType.upsert({
      where: { code: type.code },
      update: { name: type.name, description: type.description },
      create: type,
    });
  }
  console.log('  → partner_types seeded');
}
