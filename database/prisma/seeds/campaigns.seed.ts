import type { PrismaClient } from '@prisma/client';
import { CampaignAudience, CampaignStatus, NotificationChannel } from '@prisma/client';

const DEMO_CAMPAIGNS: Array<{
  name: string;
  description: string;
  channel: NotificationChannel;
  audience: CampaignAudience;
  status: CampaignStatus;
  subject?: string;
  body: string;
  sent: number;
  opened: number;
  clicked: number;
  converted: number;
  startDate: Date;
}> = [
  {
    name: 'Home Loan Festival Offer',
    description: 'Seasonal home loan rate promotion for existing leads',
    channel: NotificationChannel.EMAIL,
    audience: CampaignAudience.LEADS,
    status: CampaignStatus.ACTIVE,
    subject: 'Exclusive home loan rates this festival season',
    body: 'Apply now for special festival interest rates on home loans.',
    sent: 12500,
    opened: 4200,
    clicked: 890,
    converted: 142,
    startDate: new Date('2026-01-15'),
  },
  {
    name: 'DSA Partner Onboarding',
    description: 'WhatsApp outreach to onboard new DSA partners',
    channel: NotificationChannel.WHATSAPP,
    audience: CampaignAudience.DSA_PARTNERS,
    status: CampaignStatus.ACTIVE,
    body: 'Join KuberOne DSA network and earn competitive commissions.',
    sent: 3200,
    opened: 2800,
    clicked: 640,
    converted: 58,
    startDate: new Date('2026-02-01'),
  },
  {
    name: 'EMI Reminder SMS',
    description: 'Automated SMS reminders for upcoming EMI due dates',
    channel: NotificationChannel.SMS,
    audience: CampaignAudience.ALL_CUSTOMERS,
    status: CampaignStatus.COMPLETED,
    body: 'Your EMI of Rs.{amount} is due on {date}. Pay on time to avoid penalties.',
    sent: 45000,
    opened: 44100,
    clicked: 1200,
    converted: 980,
    startDate: new Date('2025-12-01'),
  },
  {
    name: 'Personal Loan Pre-Approval',
    description: 'Push notification campaign for pre-approved personal loans',
    channel: NotificationChannel.PUSH,
    audience: CampaignAudience.BRANCH_CUSTOMERS,
    status: CampaignStatus.SCHEDULED,
    subject: 'You are pre-approved for a personal loan',
    body: 'Complete your application in minutes with instant eligibility.',
    sent: 0,
    opened: 0,
    clicked: 0,
    converted: 0,
    startDate: new Date('2026-07-01'),
  },
];

export async function seedCampaigns(prisma: PrismaClient): Promise<void> {
  const existing = await prisma.campaign.count();
  if (existing > 0) {
    console.log('  Campaigns already seeded, skipping');
    return;
  }

  for (const campaign of DEMO_CAMPAIGNS) {
    await prisma.campaign.create({ data: campaign });
  }

  console.log(`  Seeded ${DEMO_CAMPAIGNS.length} campaigns`);
}
