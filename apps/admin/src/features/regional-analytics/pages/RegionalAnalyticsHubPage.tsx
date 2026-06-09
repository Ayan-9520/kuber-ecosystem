import { useMutation, useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';

import { CanAccess } from '@/components/guards/CanAccess';
import { Card, PageHeader, Tabs } from '@/components/ui';
import { KpiGrid } from '@/features/analytics/components/KpiGrid';
import { RegionalFilterBar } from '@/features/regional-analytics/components/RegionalFilterBar';
import { formatPercent } from '@/lib/utils';
import type { AnalyticsTimePreset } from '@/services/analytics.service';
import {
  regionalAnalyticsService,
  type RegionalPeriodType,
  type RegionalRankingType,
} from '@/services/regional-analytics.service';

function str(v: unknown): string {
  if (v == null) return '—';
  if (typeof v === 'object') return JSON.stringify(v);
  return String(v);
}

type TabId =
  | 'regional'
  | 'revenue'
  | 'leads'
  | 'applications'
  | 'branches'
  | 'partners'
  | 'forecast'
  | 'rankings'
  | 'ai';

const TABS: { id: TabId; label: string }[] = [
  { id: 'regional', label: 'Regional' },
  { id: 'revenue', label: 'Revenue' },
  { id: 'leads', label: 'Leads' },
  { id: 'applications', label: 'Applications' },
  { id: 'branches', label: 'Branch Comparison' },
  { id: 'partners', label: 'Partners' },
  { id: 'forecast', label: 'Forecast' },
  { id: 'rankings', label: 'Rankings' },
  { id: 'ai', label: 'AI Insights' },
];

const REPORT_TYPE: Record<TabId, string> = {
  regional: 'dashboard',
  revenue: 'revenue',
  leads: 'leads',
  applications: 'applications',
  branches: 'branches',
  partners: 'partners',
  forecast: 'forecast',
  rankings: 'rankings',
  ai: 'ai',
};

export function RegionalAnalyticsHubPage() {
  const [tab, setTab] = useState<TabId>('regional');
  const [timePreset, setTimePreset] = useState<AnalyticsTimePreset>('THIS_MONTH');
  const [periodType, setPeriodType] = useState<RegionalPeriodType>('MONTHLY');
  const [rankingType, setRankingType] = useState<RegionalRankingType>('BRANCH');
  const [fromDate, setFromDate] = useState<string>();
  const [toDate, setToDate] = useState<string>();
  const [exportFormat, setExportFormat] = useState<'CSV' | 'EXCEL' | 'PDF'>('CSV');

  const queryParams = useMemo(
    () => ({
      timePreset,
      periodType,
      ...(fromDate ? { fromDate } : {}),
      ...(toDate ? { toDate } : {}),
      ...(tab === 'rankings' ? { rankingType, limit: 20 } : {}),
    }),
    [timePreset, periodType, fromDate, toDate, tab, rankingType],
  );

  const dashboard = useQuery({
    queryKey: ['regional-analytics', 'dashboard', queryParams],
    queryFn: () => regionalAnalyticsService.dashboard(queryParams),
    enabled: tab === 'regional' || tab === 'ai',
  });

  const revenue = useQuery({
    queryKey: ['regional-analytics', 'revenue', queryParams],
    queryFn: () => regionalAnalyticsService.revenue(queryParams),
    enabled: tab === 'revenue',
  });

  const leads = useQuery({
    queryKey: ['regional-analytics', 'leads', queryParams],
    queryFn: () => regionalAnalyticsService.leads(queryParams),
    enabled: tab === 'leads',
  });

  const applications = useQuery({
    queryKey: ['regional-analytics', 'applications', queryParams],
    queryFn: () => regionalAnalyticsService.applications(queryParams),
    enabled: tab === 'applications',
  });

  const branches = useQuery({
    queryKey: ['regional-analytics', 'branches', queryParams],
    queryFn: () => regionalAnalyticsService.branches(queryParams),
    enabled: tab === 'branches',
  });

  const partners = useQuery({
    queryKey: ['regional-analytics', 'partners', queryParams],
    queryFn: () => regionalAnalyticsService.partners(queryParams),
    enabled: tab === 'partners',
  });

  const forecast = useQuery({
    queryKey: ['regional-analytics', 'forecast', queryParams],
    queryFn: () => regionalAnalyticsService.forecast(queryParams),
    enabled: tab === 'forecast',
  });

  const rankings = useQuery({
    queryKey: ['regional-analytics', 'rankings', queryParams],
    queryFn: () => regionalAnalyticsService.rankings(queryParams),
    enabled: tab === 'rankings',
  });

  const exportMutation = useMutation({
    mutationFn: () =>
      regionalAnalyticsService.export({
        ...queryParams,
        format: exportFormat,
        reportType: REPORT_TYPE[tab],
      }),
  });

  const dashData = dashboard.data as Record<string, unknown> | undefined;
  const region = dashData?.region as Record<string, string> | undefined;
  const kpis = (dashData?.kpis as Array<{ code: string; name: string; value: number; unit?: string }>) ?? [];
  const scores = dashData?.scores as Record<string, number> | undefined;
  const ai = (dashData?.ai as Record<string, unknown>) ?? {};
  const revKpis = (revenue.data?.kpis as Array<Record<string, unknown>>) ?? [];
  const leadKpis = (leads.data?.kpis as Array<Record<string, unknown>>) ?? [];
  const leadSources = (leads.data?.sources as Array<Record<string, unknown>>) ?? [];
  const appKpis = (applications.data?.kpis as Array<Record<string, unknown>>) ?? [];
  const branchRows = (branches.data?.comparison as Record<string, unknown> | undefined)?.topBranches as
    | Array<Record<string, unknown>>
    | undefined;
  const partnerRows = (partners.data?.partners as Array<Record<string, unknown>>) ?? [];
  const forecastItems = (forecast.data?.forecasts as Array<Record<string, unknown>>) ?? [];
  const rankingEntries = (rankings.data?.entries as Array<Record<string, unknown>>) ?? [];
  const topExecutives = (dashData?.executiveAnalytics as Record<string, unknown> | undefined)?.topPerformers as
    | Array<Record<string, unknown>>
    | undefined;

  return (
    <div>
      <PageHeader
        title="Regional Analytics"
        subtitle={
          region
            ? `${region.name} (${region.code}) — multi-branch visibility, governance, and performance intelligence`
            : 'Regional multi-branch analytics for leads, revenue, applications, and branch comparison'
        }
      />

      <RegionalFilterBar
        timePreset={timePreset}
        periodType={periodType}
        onTimePresetChange={(preset, from, to) => {
          setTimePreset(preset);
          setFromDate(from);
          setToDate(to);
        }}
        onPeriodTypeChange={setPeriodType}
        fromDate={fromDate}
        toDate={toDate}
      />

      <Tabs tabs={TABS} active={tab} onChange={(id) => setTab(id as TabId)} />

      {tab === 'regional' && (
        <>
          <Card title="Regional Overview">
            <KpiGrid kpis={kpis} loading={dashboard.isLoading} />
          </Card>
          {scores && (
            <Card title="Regional Performance Score">
              <div className="stat-grid">
                {Object.entries(scores)
                  .filter(([k]) => k !== 'breakdown')
                  .map(([key, value]) => (
                    <div key={key} className="stat-card">
                      <span className="stat-label">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                      <span className="stat-value">{formatPercent(value)}</span>
                    </div>
                  ))}
              </div>
            </Card>
          )}
          {topExecutives && topExecutives.length > 0 && (
            <Card title="Top Executives">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Executive</th>
                    <th>Leads</th>
                    <th>Apps</th>
                    <th>Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {topExecutives.map((row) => {
                    const emp = row.employee as Record<string, string> | undefined;
                    return (
                      <tr key={str(emp?.id)}>
                        <td>{emp ? `${emp.firstName} ${emp.lastName}` : '—'}</td>
                        <td>{str(row.leads)}</td>
                        <td>{str(row.apps)}</td>
                        <td>{str(row.revenue)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </Card>
          )}
        </>
      )}

      {tab === 'revenue' && (
        <Card title="Revenue Analytics">
          <KpiGrid
            kpis={revKpis.map((k) => ({
              code: str(k.code),
              name: str(k.name),
              value: Number(k.value ?? 0),
              unit: str(k.unit),
            }))}
            loading={revenue.isLoading}
          />
        </Card>
      )}

      {tab === 'leads' && (
        <>
          <Card title="Lead Analytics">
            <KpiGrid
              kpis={leadKpis.map((k) => ({
                code: str(k.code),
                name: str(k.name),
                value: Number(k.value ?? 0),
                unit: str(k.unit),
              }))}
              loading={leads.isLoading}
            />
          </Card>
          <Card title="Lead Source Performance">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Source</th>
                  <th>Count</th>
                </tr>
              </thead>
              <tbody>
                {leadSources.map((s) => (
                  <tr key={str(s.sourceId)}>
                    <td>{str(s.sourceName)}</td>
                    <td>{str(s.count)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </>
      )}

      {tab === 'applications' && (
        <Card title="Application Analytics">
          <KpiGrid
            kpis={appKpis.map((k) => ({
              code: str(k.code),
              name: str(k.name),
              value: Number(k.value ?? 0),
              unit: str(k.unit),
            }))}
            loading={applications.isLoading}
          />
        </Card>
      )}

      {tab === 'branches' && (
        <Card title="Branch Comparison">
          <table className="data-table">
            <thead>
              <tr>
                <th>Branch</th>
                <th>Leads</th>
                <th>Apps</th>
                <th>Revenue</th>
                <th>Conversion %</th>
              </tr>
            </thead>
            <tbody>
              {(branchRows ?? []).map((row) => {
                const b = row.branch as Record<string, string> | undefined;
                return (
                  <tr key={str(b?.id)}>
                    <td>{b?.name ?? '—'}</td>
                    <td>{str(row.leads)}</td>
                    <td>{str(row.apps)}</td>
                    <td>{str(row.revenue)}</td>
                    <td>{formatPercent(Number(row.conversionRate ?? 0))}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      )}

      {tab === 'partners' && (
        <Card title="Partner Analytics">
          <table className="data-table">
            <thead>
              <tr>
                <th>Partner</th>
                <th>Type</th>
                <th>Leads</th>
                <th>Conversions</th>
                <th>Conversion %</th>
                <th>Revenue</th>
              </tr>
            </thead>
            <tbody>
              {partnerRows.map((p) => (
                <tr key={str(p.partnerId)}>
                  <td>{str(p.partnerName)}</td>
                  <td>{str(p.partnerType)}</td>
                  <td>{str(p.leads)}</td>
                  <td>{str(p.conversions)}</td>
                  <td>{formatPercent(Number(p.conversionRate ?? 0))}</td>
                  <td>{str(p.revenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {tab === 'forecast' && (
        <Card title="Regional Forecasting">
          <table className="data-table">
            <thead>
              <tr>
                <th>Metric</th>
                <th>Current</th>
                <th>Predicted</th>
                <th>Confidence</th>
              </tr>
            </thead>
            <tbody>
              {forecastItems.map((f, i) => (
                <tr key={str(f.metricCode ?? i)}>
                  <td>{str(f.metricName ?? f.metricCode)}</td>
                  <td>{str(f.currentValue ?? f.predictedValue)}</td>
                  <td>{str(f.predictedValue)}</td>
                  <td>{f.confidence != null ? formatPercent(Number(f.confidence)) : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {tab === 'rankings' && (
        <>
          <div className="analytics-filters">
            <div className="analytics-preset-group">
              <span className="analytics-filter-label">Ranking</span>
              {(['REGION', 'BRANCH', 'PRODUCT', 'PARTNER', 'EXECUTIVE'] as RegionalRankingType[]).map((rt) => (
                <button
                  key={rt}
                  type="button"
                  className={`analytics-preset-btn${rankingType === rt ? ' active' : ''}`}
                  onClick={() => setRankingType(rt)}
                >
                  {rt.charAt(0) + rt.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
          </div>
          <Card title="Regional Rankings">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Entity</th>
                  <th>Score</th>
                </tr>
              </thead>
              <tbody>
                {rankingEntries.map((entry) => {
                  const b = entry.branch as Record<string, string> | undefined;
                  const r = entry.region as Record<string, string> | undefined;
                  const p = entry.product as Record<string, unknown> | undefined;
                  const pr = entry.partner as Record<string, string> | undefined;
                  const emp = entry.employee as Record<string, string> | undefined;
                  return (
                    <tr key={str(entry.rank)}>
                      <td>{str(entry.rank)}</td>
                      <td>
                        {b?.name ??
                          r?.name ??
                          str(p?.name) ??
                          pr?.name ??
                          (emp ? `${emp.firstName} ${emp.lastName}` : '—')}
                      </td>
                      <td>{formatPercent(Number(entry.score ?? 0))}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Card>
        </>
      )}

      {tab === 'ai' && (
        <Card title="AI Analytics">
          <div className="stat-grid">
            <div className="stat-card">
              <span className="stat-label">AI Advisor Usage</span>
              <span className="stat-value">{str(ai.aiUsage)}</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Voice AI Usage</span>
              <span className="stat-value">{str(ai.voiceAiUsage)}</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Copilot Usage</span>
              <span className="stat-value">{str(ai.copilotUsage)}</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Recommendation Acceptance</span>
              <span className="stat-value">{str(ai.recommendationAdoption)}</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">AI Conversion Impact</span>
              <span className="stat-value">{formatPercent(Number(ai.aiConversionImpact ?? 0))}</span>
            </div>
          </div>
        </Card>
      )}

      <Card title="Export Center">
        <div className="analytics-filters">
          <select value={exportFormat} onChange={(e) => setExportFormat(e.target.value as 'CSV' | 'EXCEL' | 'PDF')}>
            <option value="CSV">CSV</option>
            <option value="EXCEL">Excel</option>
            <option value="PDF">PDF</option>
          </select>
          <CanAccess permission={['regional_analytics.export', 'regional_analytics.read']}>
            <button type="button" className="btn btn-primary" disabled={exportMutation.isPending} onClick={() => exportMutation.mutate()}>
              {exportMutation.isPending ? 'Exporting...' : 'Export Report'}
            </button>
          </CanAccess>
        </div>
      </Card>
    </div>
  );
}
