import type { PrismaClient } from '@prisma/client';
import { LeadGrade, LeadPriority, LeadStatus, Prisma } from '@prisma/client';

const DEMO_LEADS = [
  {
    leadNumber: 'KFL-000001',
    prospectName: 'Rahul Sharma',
    prospectPhone: '9811122233',
    prospectEmail: 'rahul.sharma@example.com',
    status: LeadStatus.NEW,
    grade: LeadGrade.A,
    score: new Prisma.Decimal(82),
    priority: LeadPriority.HIGH,
    requestedAmount: new Prisma.Decimal(2500000),
  },
  {
    leadNumber: 'KFL-000002',
    prospectName: 'Priya Patel',
    prospectPhone: '9822233344',
    prospectEmail: 'priya.patel@example.com',
    status: LeadStatus.QUALIFIED,
    grade: LeadGrade.A_PLUS,
    score: new Prisma.Decimal(91),
    priority: LeadPriority.HIGH,
    requestedAmount: new Prisma.Decimal(4500000),
  },
  {
    leadNumber: 'KFL-000003',
    prospectName: 'Amit Kumar',
    prospectPhone: '9833344455',
    status: LeadStatus.IN_PROCESS,
    grade: LeadGrade.B,
    score: new Prisma.Decimal(68),
    priority: LeadPriority.MEDIUM,
    requestedAmount: new Prisma.Decimal(1200000),
  },
  {
    leadNumber: 'KFL-000004',
    prospectName: 'Sneha Reddy',
    prospectPhone: '9844455566',
    prospectEmail: 'sneha.reddy@example.com',
    status: LeadStatus.APPLICATION_CREATED,
    grade: LeadGrade.A,
    score: new Prisma.Decimal(88),
    priority: LeadPriority.MEDIUM,
    requestedAmount: new Prisma.Decimal(3200000),
  },
  {
    leadNumber: 'KFL-000005',
    prospectName: 'Vikram Singh',
    prospectPhone: '9855566677',
    status: LeadStatus.LOST,
    grade: LeadGrade.C,
    score: new Prisma.Decimal(42),
    priority: LeadPriority.LOW,
    requestedAmount: new Prisma.Decimal(800000),
    lostReason: 'Not interested',
  },
] as const;

export async function seedDemoLeads(prisma: PrismaClient): Promise<void> {
  const product = await prisma.product.findFirst({ where: { code: 'HL-01' } });
  const source = await prisma.leadSource.findUnique({ where: { code: 'WEBSITE' } });
  const branch = await prisma.branch.findUnique({ where: { code: 'HQ-001' } });

  if (!product || !source) {
    console.log('  → demo leads skipped (product or lead source missing)');
    return;
  }

  const admin = await prisma.user.findUnique({ where: { email: 'admin@kuberone.com' } });
  const demoPartner = await prisma.partner.findUnique({ where: { partnerCode: 'DSA-DEMO-001' } });

  for (const lead of DEMO_LEADS) {
    await prisma.lead.upsert({
      where: { leadNumber: lead.leadNumber },
      update: {
        prospectName: lead.prospectName,
        prospectPhone: lead.prospectPhone,
        prospectEmail: lead.prospectEmail ?? null,
        status: lead.status,
        grade: lead.grade,
        score: lead.score,
        priority: lead.priority,
        requestedAmount: lead.requestedAmount,
        lostReason: 'lostReason' in lead ? lead.lostReason : null,
        branchId: branch?.id ?? null,
        regionId: branch?.regionId ?? null,
        partnerId: demoPartner?.id ?? null,
      },
      create: {
        leadNumber: lead.leadNumber,
        prospectName: lead.prospectName,
        prospectPhone: lead.prospectPhone,
        prospectEmail: lead.prospectEmail ?? null,
        productId: product.id,
        sourceId: source.id,
        partnerId: demoPartner?.id ?? null,
        status: lead.status,
        grade: lead.grade,
        score: lead.score,
        priority: lead.priority,
        requestedAmount: lead.requestedAmount,
        lostReason: 'lostReason' in lead ? lead.lostReason : null,
        branchId: branch?.id ?? null,
        regionId: branch?.regionId ?? null,
        createdById: admin?.id ?? null,
      },
    });
  }

  console.log('  → demo leads seeded');
}
