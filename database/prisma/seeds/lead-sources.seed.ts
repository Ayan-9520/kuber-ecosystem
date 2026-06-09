import type { PrismaClient } from '@prisma/client';
import { LeadSourceChannel } from '@prisma/client';

const LEAD_SOURCES = [
  { code: 'WEBSITE', name: 'Website', channel: LeadSourceChannel.DIGITAL },
  { code: 'MOBILE_APP', name: 'Mobile App', channel: LeadSourceChannel.DIGITAL },
  { code: 'DSA', name: 'DSA', channel: LeadSourceChannel.PARTNER },
  { code: 'REFERRAL_PARTNER', name: 'Referral Partner', channel: LeadSourceChannel.PARTNER },
  { code: 'BUILDER', name: 'Builder', channel: LeadSourceChannel.PARTNER },
  { code: 'CA', name: 'Chartered Accountant', channel: LeadSourceChannel.PARTNER },
  { code: 'PROPERTY_DEALER', name: 'Property Dealer', channel: LeadSourceChannel.PARTNER },
  { code: 'CAMPAIGN', name: 'Campaign', channel: LeadSourceChannel.DIGITAL },
  { code: 'MANUAL_ENTRY', name: 'Manual Entry', channel: LeadSourceChannel.DIRECT },
  { code: 'IMPORT', name: 'Import', channel: LeadSourceChannel.INBOUND },
];

export async function seedLeadSources(prisma: PrismaClient): Promise<void> {
  for (const source of LEAD_SOURCES) {
    await prisma.leadSource.upsert({
      where: { code: source.code },
      update: { name: source.name, channel: source.channel, isActive: true },
      create: source,
    });
  }

  console.log('  → lead_sources seeded');
}
