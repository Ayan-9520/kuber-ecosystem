import { useMutation, useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';

import { CanAccess } from '@/components/guards/CanAccess';
import { Card, PageHeader, Tabs } from '@/components/ui';
import { AnalyticsQueryState } from '@/features/analytics/components/AnalyticsQueryState';
import { KpiGrid } from '@/features/analytics/components/KpiGrid';
import { BranchFilterBar } from '@/features/branch-analytics/components/BranchFilterBar';
import { formatPercent } from '@/lib/utils';
import type { AnalyticsTimePreset } from '@/services/analytics.service';
import {
  branchAnalyticsService,
  type BranchPeriodType,
  type BranchRankingType,
} from '@/services/branch-analytics.service';

function str(v: unknown): string {
  if (v == null) return '—';
  if (typeof v === 'object') return JSON.stringify(v);
  return String(v);
}

type TabId =
  | 'branch'
  | 'revenue'
  | 'leads'
  | 'applications'
  | 'partners'
  | 'performance'
  | 'forecast'
  | 'rankings'
  | 'ai';

const TABS: { id: TabId; label: string }[] = [
  { id: 'branch', label: 'Branch' },
  { id: 'revenue', label: 'Revenue' },
  { id: 'leads', label: 'Leads' },
  { id: 'applications', label: 'Applications' },
  { id: 'partners', label: 'Partners' },
  { id: 'performance', label: 'Performance' },
  { id: 'forecast', label: 'Forecast' },
  { id: 'rankings', label: 'Rankings' },
  { id: 'ai', label: 'AI Insights' },
];

const REPORT_TYPE: Record<TabId, string> = {
  branch: 'dashboard',
  revenue: 'revenue',
  leads: 'leads',
  applications: 'applications',
  partners: 'partners',
  performance: 'performance',
  forecast: 'forecast',
  rankings: 'rankings',
  ai: 'ai',
};

export function BranchAnalyticsHubPage() {
  const [tab, setTab] = useState<TabId>('branch');
  const [timePreset, setTimePreset] = useState<AnalyticsTimePreset>('THIS_MONTH');
  const [periodType, setPeriodType] = useState<BranchPeriodType>('MONTHLY');
  const [rankingType, setRankingType] = useState<BranchRankingType>('BRANCH');
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
    queryKey: ['branch-analytics', 'dashboard', queryParams],
    queryFn: () => branchAnalyticsService.dashboard(queryParams),
    enabled: tab === 'branch' || tab === 'ai',
  });

  const revenue = useQuery({
    queryKey: ['branch-analytics', 'revenue', queryParams],
    queryFn: () => branchAnalyticsService.revenue(queryParams),
    enabled: tab === 'revenue',
  });

  const leads = useQuery({
    queryKey: ['branch-analytics', 'leads', queryParams],
    queryFn: () => branchAnalyticsService.leads(queryParams),
    enabled: tab === 'leads',
  });

  const applications = useQuery({
    queryKey: ['branch-analytics', 'applications', queryParams],
    queryFn: () => branchAnalyticsService.applications(queryParams),
    enabled: tab === 'applications',
  });

  const partners = useQuery({
    queryKey: ['branch-analytics', 'partners', queryParams],
    queryFn: () => branchAnalyticsService.partners(queryParams),
    enabled: tab === 'partners',
  });

  const performance = useQuery({
    queryKey: ['branch-analytics', 'performance', queryParams],
    queryFn: () => branchAnalyticsService.performance(queryParams),
    enabled: tab === 'performance' || tab === 'branch',
  });

  const forecast = useQuery({
    queryKey: ['branch-analytics', 'forecast', queryParams],
    queryFn: () => branchAnalyticsService.forecast(queryParams),
    enabled: tab === 'forecast',
  });

  const rankings = useQuery({
    queryKey: ['branch-analytics', 'rankings', queryParams],
    queryFn: () => branchAnalyticsService.rankings(queryParams),
    enabled: tab === 'rankings',
  });

  const exportMutation = useMutation({
    mutationFn: () =>
      branchAnalyticsService.export({
        ...queryParams,
        format: exportFormat,
        reportType: REPORT_TYPE[tab],
      }),
  });

  const dashData = dashboard.data as Record<string, unknown> | undefined;
  const branch = dashData?.branch as Record<string, string> | undefined;
  const kpis = (dashData?.kpis as Array<{ code: string; name: string; value: number; unit?: string }>) ?? [];
  const scores = (dashData?.scores ?? performance.data?.scores) as Record<string, number> | undefined;
  const ai = (dashData?.ai as Record<string, unknown>) ?? {};
  const revKpis = (revenue.data?.kpis as Array<Record<string, unknown>>) ?? [];
  const leadKpis = (leads.data?.kpis as Array<Record<string, unknown>>) ?? [];
  const leadSources = (leads.data?.sources as Array<Record<string, unknown>>) ?? [];
  const appKpis = (applications.data?.kpis as Array<Record<string, unknown>>) ?? [];
  const productMix = (applications.data?.productMix as Array<Record<string, unknown>>) ?? [];
  const partnerRows = (partners.data?.partners as Array<Record<string, unknown>>) ?? [];
  const forecastItems = (forecast.data?.forecasts as Array<Record<string, unknown>>) ?? [];
  const rankingEntries = (rankings.data?.entries as Array<Record<string, unknown>>) ?? [];
  const topPerformers = (dashData?.executiveAnalytics as Record<string, unknown> | undefined)?.topPerformers as
    | Array<Record<string, unknown>>
    | undefined;

  return (
    <div>
      <PageHeader
        title="Branch Analytics"
        subtitle={
          branch
            ? `${branch.name} (${branch.code}) — ${branch.city ?? ''}, ${branch.state ?? ''}`
            : 'Branch-level visibility for leads, applications, revenue, partners, and performance'
        }
      />

      <BranchFilterBar
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

      {tab === 'branch' && (
        <>
          <Card title="Branch KPIs">
            <KpiGrid kpis={kpis} loading={dashboard.isLoading} />
          </Card>
          {scores && (
            <Card title="Branch Performance Score">
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
          {topPerformers && topPerformers.length > 0 && (
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
                  {topPerformers.map((row) => {
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
        <>
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
          <Card title="Product Mix">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Family</th>
                  <th>Count</th>
                </tr>
              </thead>
              <tbody>
                {productMix.map((p) => (
                  <tr key={str(p.productId)}>
                    <td>{str(p.productName)}</td>
                    <td>{str(p.familyCode)}</td>
                    <td>{str(p.count)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </>
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

      {tab === 'performance' && (
        <Card title="Branch Performance Scoring">
          <AnalyticsQueryState
            isLoading={performance.isLoading}
            isError={performance.isError}
            error={performance.error}
            onRetry={() => void performance.refetch()}
            isEmpty={!scores}
            emptyTitle="No performance data"
            emptyDescription="Performance scores are not available for the selected branch."
          >
            <div className="stat-grid">
              {Object.entries(scores ?? {})
                .filter(([k]) => k !== 'breakdown')
                .map(([key, value]) => (
                  <div key={key} className="stat-card">
                    <span className="stat-label">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                    <span className="stat-value">{formatPercent(value)}</span>
                  </div>
                ))}
            </div>
          </AnalyticsQueryState>
        </Card>
      )}

      {tab === 'forecast' && (
        <Card title="Branch Forecasting">
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
              {(['BRANCH', 'REGIONAL', 'PRODUCT', 'REVENUE'] as BranchRankingType[]).map((rt) => (
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
          <Card title="Branch Rankings">
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
                  const p = entry.product as Record<string, string> | undefined;
                  return (
                    <tr key={str(entry.rank)}>
                      <td>{str(entry.rank)}</td>
                      <td>{b?.name ?? r?.name ?? p?.name ?? '—'}</td>
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
              <span className="stat-label">AI Impact on Conversion</span>
              <span className="stat-value">{formatPercent(Number(ai.aiEffectiveness ?? 0))}</span>
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
          <CanAccess permission={['branch_analytics.export', 'branch_analytics.read']}>
            <button type="button" className="btn btn-primary" disabled={exportMutation.isPending} onClick={() => exportMutation.mutate()}>
              {exportMutation.isPending ? 'Exporting...' : 'Export Report'}
            </button>
          </CanAccess>
        </div>
      </Card>
    </div>
  );
}
