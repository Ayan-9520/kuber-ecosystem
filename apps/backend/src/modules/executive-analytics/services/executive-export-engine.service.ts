import type { AuthenticatedUser } from '@kuberone/shared-types';
import type { ExecutiveExportQuery } from '@kuberone/shared-validation';

import { executiveAnalyticsOrchestratorService } from './executive-analytics-orchestrator.service.js';

function escapeCsv(value: unknown): string {
  const s = String(value ?? '');
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export const executiveExportEngineService = {
  async buildExport(actor: AuthenticatedUser, query: ExecutiveExportQuery) {
    const format = query.format ?? 'CSV';
    let rows: string[][] = [['Report', query.reportType], []];

    switch (query.reportType) {
      case 'performance': {
        const data = await executiveAnalyticsOrchestratorService.performance(actor, query);
        rows = [['Metric', 'Score'], ...Object.entries(data.scores ?? {}).map(([k, v]) => [k, String(v)])];
        break;
      }
      case 'targets': {
        const data = await executiveAnalyticsOrchestratorService.targets(actor, { ...query, page: 1, limit: 100 });
        rows = [
          ['Employee', 'Metric', 'Target', 'Actual', 'Achievement %'],
          ...(data.items as Array<{ metricName: string; targetValue: unknown; actualValue: number; achievementPct: number; employee: { firstName: string; lastName: string } }>).map(
            (t) => [
              `${t.employee.firstName} ${t.employee.lastName}`,
              t.metricName,
              String(t.targetValue),
              String(t.actualValue),
              String(t.achievementPct),
            ],
          ),
        ];
        break;
      }
      case 'leaderboard': {
        const data = (await executiveAnalyticsOrchestratorService.leaderboard(actor, query)) as {
          entries: Array<{ rank: number; score: number; employee: { firstName: string; lastName: string } }>;
        };
        rows = [
          ['Rank', 'Employee', 'Score'],
          ...data.entries.map((e) => [
            String(e.rank),
            `${e.employee.firstName} ${e.employee.lastName}`,
            String(e.score),
          ]),
        ];
        break;
      }
      case 'forecast': {
        const data = await executiveAnalyticsOrchestratorService.forecast(actor, query);
        rows = [
          ['Metric', 'Current', 'Predicted', 'Confidence'],
          ...(data.forecasts as Array<{ metricCode?: string; metricName?: string; currentValue?: number; predictedValue: unknown; confidence?: unknown }>).map((f) => [
            f.metricName ?? f.metricCode ?? '',
            String(f.currentValue ?? ''),
            String(f.predictedValue),
            String(f.confidence ?? ''),
          ]),
        ];
        break;
      }
      case 'ai':
      case 'dashboard':
      default: {
        const data = (await executiveAnalyticsOrchestratorService.dashboard(actor, query)) as {
          kpis: Array<{ name: string; value: number; target?: number; achievementPct?: number }>;
        };
        rows = [
          ['KPI', 'Value', 'Target', 'Achievement %'],
          ...data.kpis.map((k) => [
            k.name,
            String(k.value),
            String(k.target ?? ''),
            String(k.achievementPct ?? ''),
          ]),
        ];
        break;
      }
    }

    if (format === 'PDF') {
      const content = `KuberOne Executive Analytics\n${'='.repeat(40)}\n${rows.map((r) => r.join(' | ')).join('\n')}\n`;
      return { content, mimeType: 'application/pdf', filename: `executive-${query.reportType}.pdf` };
    }

    const csv = rows.map((r) => r.map(escapeCsv).join(',')).join('\n');
    if (format === 'EXCEL') {
      return { content: csv, mimeType: 'application/vnd.ms-excel', filename: `executive-${query.reportType}.xls` };
    }
    return { content: csv, mimeType: 'text/csv', filename: `executive-${query.reportType}.csv` };
  },
};
