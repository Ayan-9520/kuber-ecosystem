import type { PrismaClient } from '@prisma/client';
import { ReferralTypeCode } from '@prisma/client';

const REFERRAL_TYPES: Array<{
  code: ReferralTypeCode;
  name: string;
  description: string;
  defaultRewardPct: number;
  displayOrder: number;
}> = [
  {
    code: ReferralTypeCode.CUSTOMER,
    name: 'Customer Referral',
    description: 'Existing customer referring a new prospect',
    defaultRewardPct: 0.25,
    displayOrder: 1,
  },
  {
    code: ReferralTypeCode.DSA,
    name: 'DSA Referral',
    description: 'Direct Selling Agent channel referral',
    defaultRewardPct: 1.0,
    displayOrder: 2,
  },
  {
    code: ReferralTypeCode.BUILDER,
    name: 'Builder Referral',
    description: 'Real estate builder partner referral',
    defaultRewardPct: 0.75,
    displayOrder: 3,
  },
  {
    code: ReferralTypeCode.PROPERTY_DEALER,
    name: 'Property Dealer Referral',
    description: 'Property dealer channel referral',
    defaultRewardPct: 0.5,
    displayOrder: 4,
  },
  {
    code: ReferralTypeCode.CA,
    name: 'CA Referral',
    description: 'Chartered Accountant professional referral',
    defaultRewardPct: 0.5,
    displayOrder: 5,
  },
  {
    code: ReferralTypeCode.BROKER,
    name: 'Broker Referral',
    description: 'Loan or property broker referral',
    defaultRewardPct: 0.75,
    displayOrder: 6,
  },
  {
    code: ReferralTypeCode.CORPORATE,
    name: 'Corporate Referral',
    description: 'Corporate tie-up or employer referral program',
    defaultRewardPct: 0.35,
    displayOrder: 7,
  },
];

export async function seedReferralTypes(prisma: PrismaClient): Promise<void> {
  for (const type of REFERRAL_TYPES) {
    await prisma.referralType.upsert({
      where: { code: type.code },
      update: {
        name: type.name,
        description: type.description,
        defaultRewardPct: type.defaultRewardPct,
        displayOrder: type.displayOrder,
        isActive: true,
      },
      create: type,
    });
  }

  console.log('  → referral_types seeded');
}
