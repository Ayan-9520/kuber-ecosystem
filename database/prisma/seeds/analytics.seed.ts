import type { PrismaClient } from '@prisma/client';

const METRICS = [
  { code: 'total_leads', name: 'Total Leads', category: 'LEAD' as const, unit: 'count', sortOrder: 1 },
  { code: 'hot_leads', name: 'Hot Leads', category: 'LEAD' as const, unit: 'count', sortOrder: 2 },
  { code: 'applications', name: 'Applications', category: 'APPLICATION' as const, unit: 'count', sortOrder: 3 },
  { code: 'sanctions', name: 'Sanctions', category: 'APPLICATION' as const, unit: 'count', sortOrder: 4 },
  { code: 'disbursements', name: 'Disbursements', category: 'DISBURSEMENT' as const, unit: 'count', sortOrder: 5 },
  { code: 'revenue', name: 'Revenue', category: 'REVENUE' as const, unit: 'INR', sortOrder: 6 },
  { code: 'commission_paid', name: 'Commission Paid', category: 'COMMISSION' as const, unit: 'INR', sortOrder: 7 },
  { code: 'commission_pending', name: 'Commission Pending', category: 'COMMISSION' as const, unit: 'INR', sortOrder: 8 },
  { code: 'customer_growth', name: 'Customer Growth', category: 'CUSTOMER' as const, unit: 'count', sortOrder: 9 },
  { code: 'document_completion', name: 'Document Completion', category: 'DOCUMENT' as const, unit: 'percent', sortOrder: 10 },
  { code: 'approval_rate', name: 'Approval Rate', category: 'APPLICATION' as const, unit: 'percent', sortOrder: 11 },
  { code: 'disbursal_rate', name: 'Disbursal Rate', category: 'DISBURSEMENT' as const, unit: 'percent', sortOrder: 12 },
  { code: 'conversion_rate', name: 'Conversion Rate', category: 'LEAD' as const, unit: 'percent', sortOrder: 13 },
  { code: 'ai_usage', name: 'AI Usage', category: 'AI' as const, unit: 'count', sortOrder: 14 },
  { code: 'voice_ai_usage', name: 'Voice AI Usage', category: 'AI' as const, unit: 'count', sortOrder: 15 },
  { code: 'notification_sent', name: 'Notifications Sent', category: 'NOTIFICATION' as const, unit: 'count', sortOrder: 16 },
  { code: 'support_open', name: 'Open Tickets', category: 'SUPPORT' as const, unit: 'count', sortOrder: 17 },
];

const DASHBOARDS = [
  { code: 'system', name: 'System Dashboard', dashboardType: 'SYSTEM' as const },
  { code: 'business', name: 'Business Dashboard', dashboardType: 'BUSINESS' as const },
  { code: 'operations', name: 'Operations Dashboard', dashboardType: 'OPERATIONS' as const },
  { code: 'sales', name: 'Sales Dashboard', dashboardType: 'SALES' as const },
  { code: 'credit', name: 'Credit Dashboard', dashboardType: 'CREDIT' as const },
  { code: 'management', name: 'Management Dashboard', dashboardType: 'MANAGEMENT' as const },
];

const REPORTS = [
  { code: 'overview', name: 'Executive Overview', reportType: 'overview' },
  { code: 'kpis', name: 'KPI Summary', reportType: 'kpis' },
  { code: 'revenue', name: 'Revenue Report', reportType: 'revenue' },
  { code: 'leads', name: 'Lead Performance', reportType: 'leads' },
  { code: 'applications', name: 'Application Pipeline', reportType: 'applications' },
  { code: 'commissions', name: 'Commission Report', reportType: 'commissions' },
  { code: 'ai', name: 'AI Usage Report', reportType: 'ai' },
];

const WIDGETS: Record<string, Array<{ title: string; chartType: 'SCORECARD' | 'LINE' | 'BAR' | 'PIE' | 'TABLE'; metricCode?: string; position: number }>> = {
  management: [
    { title: 'Total Leads', chartType: 'SCORECARD', metricCode: 'total_leads', position: 0 },
    { title: 'Revenue', chartType: 'SCORECARD', metricCode: 'revenue', position: 1 },
    { title: 'Disbursements', chartType: 'SCORECARD', metricCode: 'disbursements', position: 2 },
    { title: 'Approval Rate', chartType: 'TREND' as never, metricCode: 'approval_rate', position: 3 },
    { title: 'Revenue Trend', chartType: 'LINE', position: 4 },
    { title: 'Lead Funnel', chartType: 'BAR', position: 5 },
  ],
  sales: [
    { title: 'Hot Leads', chartType: 'SCORECARD', metricCode: 'hot_leads', position: 0 },
    { title: 'Conversion Rate', chartType: 'SCORECARD', metricCode: 'conversion_rate', position: 1 },
    { title: 'Executive Performance', chartType: 'TABLE', position: 2 },
  ],
};

export async function seedAnalytics(prisma: PrismaClient): Promise<void> {
  for (const m of METRICS) {
    await prisma.metricDefinition.upsert({
      where: { code: m.code },
      create: m,
      update: { name: m.name, category: m.category, unit: m.unit, sortOrder: m.sortOrder, isActive: true },
    });
  }

  for (const d of DASHBOARDS) {
    const dashboard = await prisma.dashboard.upsert({
      where: { code: d.code },
      create: { ...d, isSystem: true, isActive: true },
      update: { name: d.name, dashboardType: d.dashboardType, isActive: true },
    });

    const widgets = WIDGETS[d.code] ?? [];
    for (const w of widgets) {
      const existing = await prisma.dashboardWidget.findFirst({
        where: { dashboardId: dashboard.id, title: w.title },
      });
      if (!existing) {
        await prisma.dashboardWidget.create({
          data: {
            dashboardId: dashboard.id,
            title: w.title,
            chartType: w.chartType,
            metricCode: w.metricCode,
            position: w.position,
          },
        });
      }
    }

    const existingFilter = await prisma.dashboardFilter.findFirst({
      where: { dashboardId: dashboard.id, filterKey: 'timePreset' },
    });
    if (!existingFilter) {
      await prisma.dashboardFilter.create({
        data: { dashboardId: dashboard.id, filterKey: 'timePreset', timePreset: 'THIS_MONTH' },
      });
    }
  }

  for (const r of REPORTS) {
    await prisma.analyticsReport.upsert({
      where: { code: r.code },
      create: { ...r, isActive: true },
      update: { name: r.name, reportType: r.reportType, isActive: true },
    });
  }

  console.log('  ✓ Analytics metrics, dashboards, and reports seeded');
}
