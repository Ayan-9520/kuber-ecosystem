import type { PrismaClient } from '@prisma/client';

const DEFAULT_TARGETS = [
  { metricCode: 'total_leads', metricName: 'Regional Leads', category: 'LEAD' as const, targetValue: 1200 },
  { metricCode: 'revenue_generated', metricName: 'Regional Revenue', category: 'REVENUE' as const, targetValue: 150000000 },
  { metricCode: 'applications_submitted', metricName: 'Applications Submitted', category: 'APPLICATION' as const, targetValue: 400 },
  { metricCode: 'applications_disbursed', metricName: 'Disbursements', category: 'APPLICATION' as const, targetValue: 200 },
  { metricCode: 'regional_growth_rate', metricName: 'Regional Growth Rate', category: 'GROWTH' as const, targetValue: 15 },
];

function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function endOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0);
}

export async function seedRegionalAnalytics(prisma: PrismaClient): Promise<void> {
  const now = new Date();
  const periodStart = startOfMonth(now);
  const periodEnd = endOfMonth(now);

  const regions = await prisma.region.findMany({ where: { isActive: true }, take: 20 });

  for (const region of regions) {
    for (const t of DEFAULT_TARGETS) {
      const existing = await prisma.regionalTarget.findFirst({
        where: { regionId: region.id, metricCode: t.metricCode, periodType: 'MONTHLY', periodStart },
      });
      if (existing) {
        await prisma.regionalTarget.update({
          where: { id: existing.id },
          data: { targetValue: t.targetValue, isActive: true },
        });
      } else {
        await prisma.regionalTarget.create({
          data: {
            regionId: region.id,
            metricCode: t.metricCode,
            metricName: t.metricName,
            category: t.category,
            targetValue: t.targetValue,
            periodType: 'MONTHLY',
            periodStart,
            periodEnd,
            isActive: true,
          },
        });
      }
    }
  }

  console.log('  ✓ Regional analytics targets seeded');
}
