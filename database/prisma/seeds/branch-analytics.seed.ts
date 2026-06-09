import type { PrismaClient } from '@prisma/client';

const DEFAULT_TARGETS = [
  { metricCode: 'total_leads', metricName: 'Total Leads', category: 'LEAD' as const, targetValue: 200 },
  { metricCode: 'revenue_generated', metricName: 'Revenue Generated', category: 'REVENUE' as const, targetValue: 25000000 },
  { metricCode: 'applications_submitted', metricName: 'Applications Submitted', category: 'APPLICATION' as const, targetValue: 80 },
  { metricCode: 'disbursements', metricName: 'Disbursements', category: 'APPLICATION' as const, targetValue: 40 },
];

function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function endOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0);
}

export async function seedBranchAnalytics(prisma: PrismaClient): Promise<void> {
  const now = new Date();
  const periodStart = startOfMonth(now);
  const periodEnd = endOfMonth(now);

  const branches = await prisma.branch.findMany({ where: { isActive: true }, take: 20 });

  for (const branch of branches) {
    for (const t of DEFAULT_TARGETS) {
      const existing = await prisma.branchTarget.findFirst({
        where: { branchId: branch.id, metricCode: t.metricCode, periodType: 'MONTHLY', periodStart },
      });
      if (existing) {
        await prisma.branchTarget.update({
          where: { id: existing.id },
          data: { targetValue: t.targetValue, isActive: true },
        });
      } else {
        await prisma.branchTarget.create({
          data: {
            branchId: branch.id,
            regionId: branch.regionId,
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

  console.log('  ✓ Branch analytics targets seeded');
}
