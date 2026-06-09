import type { AuthenticatedUser } from '@kuberone/shared-types';
import type { RegionalExportQuery } from '@kuberone/shared-validation';

import { regionalAnalyticsOrchestratorService } from './regional-analytics-orchestrator.service.js';

function escapeCsv(value: unknown): string {
  const s = String(value ?? '');
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export const regionalExportEngineService = {
  async buildExport(actor: AuthenticatedUser, query: RegionalExportQuery) {
    const format = query.format ?? 'CSV';
    let rows: string[][] = [['Report', query.reportType], []];

    switch (query.reportType) {
      case 'performance': {
        const data = await regionalAnalyticsOrchestratorService.performance(actor, query);
        rows = [['Metric', 'Score'], ...Object.entries(data.scores ?? {}).map(([k, v]) => [k, String(v)])];
        break;
      }
      case 'revenue': {
        const data = await regionalAnalyticsOrchestratorService.revenue(actor, query);
        rows = [
          ['KPI', 'Value', 'Target', 'Achievement %'],
          ...(data.kpis as Array<{ name: string; value: number; target?: number; achievementPct?: number }>).map((k) => [
            k.name,
            String(k.value),
            String(k.target ?? ''),
            String(k.achievementPct ?? ''),
          ]),
        ];
        break;
      }
      case 'leads': {
        const data = await regionalAnalyticsOrchestratorService.leads(actor, query);
        rows = [
          ['KPI', 'Value'],
          ...(data.kpis as Array<{ name: string; value: number }>).map((k) => [k.name, String(k.value)]),
        ];
        break;
      }
      case 'applications': {
        const data = await regionalAnalyticsOrchestratorService.applications(actor, query);
        rows = [
          ['KPI', 'Value'],
          ...(data.kpis as Array<{ name: string; value: number }>).map((k) => [k.name, String(k.value)]),
        ];
        break;
      }
      case 'branches': {
        const data = await regionalAnalyticsOrchestratorService.branches(actor, query);
        const top = (data.comparison as { topBranches?: Array<{ branch: { name: string }; revenue: number; leads: number }> })?.topBranches ?? [];
        rows = [
          ['Branch', 'Leads', 'Revenue'],
          ...top.map((b) => [b.branch.name, String(b.leads), String(b.revenue)]),
        ];
        break;
      }
      case 'partners': {
        const data = await regionalAnalyticsOrchestratorService.partners(actor, query);
        rows = [
          ['Partner', 'Type', 'Leads'],
          ...(data.partners as Array<{ partnerName: string; partnerType: string; leads: number }>).map((p) => [
            p.partnerName,
            p.partnerType,
            String(p.leads),
          ]),
        ];
        break;
      }
      case 'forecast': {
        const data = await regionalAnalyticsOrchestratorService.forecast(actor, query);
        rows = [
          ['Metric', 'Current', 'Predicted', 'Confidence'],
          ...(data.forecasts as Array<{ metricName?: string; metricCode?: string; currentValue?: number; predictedValue: unknown; confidence?: unknown }>).map(
            (f) => [f.metricName ?? f.metricCode ?? '', String(f.currentValue ?? ''), String(f.predictedValue), String(f.confidence ?? '')],
          ),
        ];
        break;
      }
      case 'rankings': {
        const data = (await regionalAnalyticsOrchestratorService.rankings(actor, query)) as {
          entries: Array<{ rank: number; score: number; branch?: { name: string }; region?: { name: string }; employee?: { firstName: string; lastName: string } }>;
        };
        rows = [
          ['Rank', 'Score', 'Entity'],
          ...data.entries.map((e) => [
            String(e.rank),
            String(e.score),
            e.branch?.name ?? e.region?.name ?? (e.employee ? `${e.employee.firstName} ${e.employee.lastName}` : ''),
          ]),
        ];
        break;
      }
      case 'ai':
      case 'dashboard':
      default: {
        const data = (await regionalAnalyticsOrchestratorService.dashboard(actor, query)) as {
          kpis: Array<{ name: string; value: number; target?: number; achievementPct?: number }>;
        };
        rows = [
          ['KPI', 'Value', 'Target', 'Achievement %'],
          ...data.kpis.map((k) => [k.name, String(k.value), String(k.target ?? ''), String(k.achievementPct ?? '')]),
        ];
        break;
      }
    }

    if (format === 'PDF') {
      const content = `KuberOne Regional Analytics\n${'='.repeat(40)}\n${rows.map((r) => r.join(' | ')).join('\n')}\n`;
      return { content, mimeType: 'application/pdf', filename: `regional-${query.reportType}.pdf` };
    }

    const csv = rows.map((r) => r.map(escapeCsv).join(',')).join('\n');
    if (format === 'EXCEL') {
      return { content: csv, mimeType: 'application/vnd.ms-excel', filename: `regional-${query.reportType}.xls` };
    }
    return { content: csv, mimeType: 'text/csv', filename: `regional-${query.reportType}.csv` };
  },
};
