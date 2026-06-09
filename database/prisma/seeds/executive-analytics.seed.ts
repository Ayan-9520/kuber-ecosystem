import type { PrismaClient } from '@prisma/client';

const DEFAULT_TARGETS = [
  { metricCode: 'leads_assigned', metricName: 'Leads Assigned', targetValue: 50, unit: 'count' },
  { metricCode: 'applications_submitted', metricName: 'Applications Submitted', targetValue: 20, unit: 'count' },
  { metricCode: 'revenue_generated', metricName: 'Revenue Generated', targetValue: 5000000, unit: 'INR' },
  { metricCode: 'conversions', metricName: 'Conversions', targetValue: 15, unit: 'count' },
  { metricCode: 'portfolio_size', metricName: 'Portfolio Size', targetValue: 100, unit: 'count' },
  { metricCode: 'applications_reviewed', metricName: 'Applications Reviewed', targetValue: 40, unit: 'count' },
  { metricCode: 'disbursements', metricName: 'Disbursements', targetValue: 25, unit: 'count' },
];

function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function endOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0);
}

export async function seedExecutiveAnalytics(prisma: PrismaClient): Promise<void> {
  const now = new Date();
  const periodStart = startOfMonth(now);
  const periodEnd = endOfMonth(now);

  const employees = await prisma.employee.findMany({
    where: { isActive: true, deletedAt: null },
    include: {
      branch: { select: { regionId: true } },
    },
    take: 20,
  });

  for (const employee of employees) {
    const role = employee.department?.includes('Credit')
      ? 'CREDIT_EXECUTIVE'
      : employee.department?.includes('Ops')
        ? 'OPERATIONS_EXECUTIVE'
        : employee.designation?.includes('Relationship')
          ? 'RELATIONSHIP_MANAGER'
          : 'SALES_EXECUTIVE';

    for (const t of DEFAULT_TARGETS.slice(0, 3)) {
      const existing = await prisma.executiveTarget.findFirst({
        where: {
          employeeId: employee.id,
          metricCode: t.metricCode,
          periodType: 'MONTHLY',
          periodStart,
        },
      });

      if (existing) {
        await prisma.executiveTarget.update({
          where: { id: existing.id },
          data: { targetValue: t.targetValue, isActive: true },
        });
      } else {
        await prisma.executiveTarget.create({
          data: {
            employeeId: employee.id,
            executiveRole: role as never,
            metricCode: t.metricCode,
            metricName: t.metricName,
            targetValue: t.targetValue,
            periodType: 'MONTHLY',
            periodStart,
            periodEnd,
            branchId: employee.branchId,
            regionId: employee.branch.regionId,
            isActive: true,
          },
        });
      }
    }
  }

  console.log('  ✓ Executive analytics targets seeded');
}
