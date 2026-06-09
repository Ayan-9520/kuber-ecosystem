import type { AuthenticatedUser } from '@kuberone/shared-types';
import type { AnalyticsExportQuery } from '@kuberone/shared-validation';

import { scopedQuery } from '../utils/analytics-date.utils.js';
import { applyAnalyticsScope } from '../utils/analytics-scope.utils.js';

import { aggregationEngineService } from './aggregation-engine.service.js';
import { metricEngineService } from './metric-engine.service.js';

function escapeCsv(value: unknown): string {
  const s = String(value ?? '');
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function kpisToRows(kpis: Array<{ code: string; name: string; value: number; unit?: string }>): string[][] {
  return [['Code', 'Name', 'Value', 'Unit'], ...kpis.map((k) => [k.code, k.name, String(k.value), k.unit ?? ''])];
}

export const exportEngineService = {
  async buildExport(actor: AuthenticatedUser, rawQuery: AnalyticsExportQuery): Promise<{ content: string; mimeType: string; filename: string }> {
    const query = scopedQuery(applyAnalyticsScope(actor, rawQuery));
    const format = rawQuery.format ?? 'CSV';

    let rows: string[][] = [['Report', rawQuery.reportType], ['From', query.fromDate.toISOString()], ['To', query.toDate.toISOString()], []];

    switch (rawQuery.reportType) {
      case 'kpis': {
        const kpis = await metricEngineService.computeKpis(actor, query);
        rows = [...rows, ...kpisToRows(kpis)];
        break;
      }
      case 'overview':
      default: {
        const overview = await aggregationEngineService.getOverview(actor, query);
        rows = [
          ...rows,
          ['Metric', 'Value'],
          ...overview.scorecards.map((k): string[] => [k.name, String(k.value)]),
        ];
        break;
      }
    }

    if (format === 'PDF') {
      const lines = rows.map((r) => r.join(' | ')).join('\n');
      const content = `KuberOne Analytics Report\n${'='.repeat(40)}\n${lines}\n`;
      return { content, mimeType: 'application/pdf', filename: `analytics-${rawQuery.reportType}.pdf` };
    }

    const csv = rows.map((r) => r.map(escapeCsv).join(',')).join('\n');
    if (format === 'EXCEL') {
      return {
        content: csv,
        mimeType: 'application/vnd.ms-excel',
        filename: `analytics-${rawQuery.reportType}.xls`,
      };
    }
    return { content: csv, mimeType: 'text/csv', filename: `analytics-${rawQuery.reportType}.csv` };
  },
};
