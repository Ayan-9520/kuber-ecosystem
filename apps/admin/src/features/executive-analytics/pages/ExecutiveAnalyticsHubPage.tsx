import { useMutation, useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';

import { CanAccess } from '@/components/guards/CanAccess';
import { Card, PageHeader, Tabs } from '@/components/ui';
import { AnalyticsQueryState } from '@/features/analytics/components/AnalyticsQueryState';
import { KpiGrid } from '@/features/analytics/components/KpiGrid';
import { ExecutiveFilterBar } from '@/features/executive-analytics/components/ExecutiveFilterBar';
import { formatPercent } from '@/lib/utils';
import type { AnalyticsTimePreset } from '@/services/analytics.service';
import {
  executiveAnalyticsService,
  type ExecutivePeriodType,
  type ExecutiveRoleType,
} from '@/services/executive-analytics.service';

function str(v: unknown): string {
  if (v == null) return '—';
  if (typeof v === 'object') return JSON.stringify(v);
  return String(v);
}

type TabId = 'executive' | 'performance' | 'targets' | 'leaderboard' | 'forecast' | 'ai';

const TABS: { id: TabId; label: string }[] = [
  { id: 'executive', label: 'Executive' },
  { id: 'performance', label: 'Performance' },
  { id: 'targets', label: 'Targets' },
  { id: 'leaderboard', label: 'Leaderboard' },
  { id: 'forecast', label: 'Forecast' },
  { id: 'ai', label: 'AI Insights' },
];

export function ExecutiveAnalyticsHubPage() {
  const [tab, setTab] = useState<TabId>('executive');
  const [timePreset, setTimePreset] = useState<AnalyticsTimePreset>('THIS_MONTH');
  const [periodType, setPeriodType] = useState<ExecutivePeriodType>('MONTHLY');
  const [executiveRole, setExecutiveRole] = useState<ExecutiveRoleType | undefined>();
  const [fromDate, setFromDate] = useState<string>();
  const [toDate, setToDate] = useState<string>();
  const [exportFormat, setExportFormat] = useState<'CSV' | 'EXCEL' | 'PDF'>('CSV');

  const queryParams = useMemo(
    () => ({
      timePreset,
      periodType,
      ...(executiveRole ? { executiveRole } : {}),
      ...(fromDate ? { fromDate } : {}),
      ...(toDate ? { toDate } : {}),
    }),
    [timePreset, periodType, executiveRole, fromDate, toDate],
  );

  const dashboard = useQuery({
    queryKey: ['executive-analytics', 'dashboard', queryParams],
    queryFn: () => executiveAnalyticsService.dashboard(queryParams),
    enabled: tab === 'executive' || tab === 'ai',
  });

  const performance = useQuery({
    queryKey: ['executive-analytics', 'performance', queryParams],
    queryFn: () => executiveAnalyticsService.performance(queryParams),
    enabled: tab === 'performance' || tab === 'executive',
  });

  const targets = useQuery({
    queryKey: ['executive-analytics', 'targets', queryParams],
    queryFn: () => executiveAnalyticsService.targets({ ...queryParams, limit: 50 }),
    enabled: tab === 'targets',
  });

  const leaderboard = useQuery({
    queryKey: ['executive-analytics', 'leaderboard', queryParams],
    queryFn: () => executiveAnalyticsService.leaderboard({ ...queryParams, limit: 20 }),
    enabled: tab === 'leaderboard',
  });

  const forecast = useQuery({
    queryKey: ['executive-analytics', 'forecast', queryParams],
    queryFn: () => executiveAnalyticsService.forecast(queryParams),
    enabled: tab === 'forecast',
  });

  const exportMutation = useMutation({
    mutationFn: () =>
      executiveAnalyticsService.export({
        ...queryParams,
        format: exportFormat,
        reportType: tab === 'ai' ? 'dashboard' : tab,
      }),
  });

  const dashData = dashboard.data as Record<string, unknown> | undefined;
  const kpis = (dashData?.kpis as Array<{ code: string; name: string; value: number; unit?: string }>) ?? [];
  const productivity = (dashData?.productivity as Record<string, number>) ?? {};
  const ai = (dashData?.ai as Record<string, unknown>) ?? {};
  const perfScores = (performance.data as Record<string, unknown> | undefined)?.scores as Record<string, number> | undefined;
  const lbEntries = (leaderboard.data as Record<string, unknown> | undefined)?.entries as Array<Record<string, unknown>> | undefined;
  const targetItems = targets.data?.items ?? [];
  const forecastItems = (forecast.data as Record<string, unknown> | undefined)?.forecasts as Array<Record<string, unknown>> | undefined;

  return (
    <div>
      <PageHeader
        title="Executive Analytics"
        subtitle="Role-based performance dashboards for sales, RM, credit, and operations executives"
      />

      <ExecutiveFilterBar
        timePreset={timePreset}
        periodType={periodType}
        executiveRole={executiveRole}
        onTimePresetChange={(preset, from, to) => {
          setTimePreset(preset);
          setFromDate(from);
          setToDate(to);
        }}
        onPeriodTypeChange={setPeriodType}
        onRoleChange={setExecutiveRole}
        fromDate={fromDate}
        toDate={toDate}
      />

      <Tabs tabs={TABS} active={tab} onChange={(id) => setTab(id as TabId)} />

      {tab === 'executive' && (
        <>
          <Card title="Executive KPIs">
            <KpiGrid kpis={kpis} loading={dashboard.isLoading} />
          </Card>
          <Card title="Productivity">
            <div className="stat-grid">
              {Object.entries(productivity).map(([key, value]) => (
                <div key={key} className="stat-card">
                  <span className="stat-label">{key.replace(/_/g, ' ')}</span>
                  <span className="stat-value">{typeof value === 'number' && key.includes('rate') ? formatPercent(value) : str(value)}</span>
                </div>
              ))}
            </div>
          </Card>
        </>
      )}

      {tab === 'performance' && (
        <Card title="Performance Scoring">
          <AnalyticsQueryState
            isLoading={performance.isLoading}
            isError={performance.isError}
            error={performance.error}
            onRetry={() => void performance.refetch()}
            isEmpty={!perfScores}
            emptyTitle="No performance data"
            emptyDescription="Performance scores are not available for the selected filters."
          >
            <div className="stat-grid">
              {Object.entries(perfScores ?? {})
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

      {tab === 'targets' && (
        <Card title="Target Management">
          <table className="data-table">
            <thead>
              <tr>
                <th>Executive</th>
                <th>Metric</th>
                <th>Target</th>
                <th>Actual</th>
                <th>Achievement</th>
              </tr>
            </thead>
            <tbody>
              {(targetItems as Array<Record<string, unknown>>).map((row) => {
                const emp = row.employee as Record<string, string> | undefined;
                return (
                  <tr key={str(row.id)}>
                    <td>{emp ? `${emp.firstName} ${emp.lastName}` : '—'}</td>
                    <td>{str(row.metricName)}</td>
                    <td>{str(row.targetValue)}</td>
                    <td>{str(row.actualValue)}</td>
                    <td>{formatPercent(Number(row.achievementPct ?? 0))}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      )}

      {tab === 'leaderboard' && (
        <Card title="Leaderboard">
          <table className="data-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Executive</th>
                <th>Score</th>
              </tr>
            </thead>
            <tbody>
              {(lbEntries ?? []).map((entry) => {
                const emp = entry.employee as Record<string, string> | undefined;
                return (
                  <tr key={str(entry.employeeId ?? entry.rank)}>
                    <td>{str(entry.rank)}</td>
                    <td>{emp ? `${emp.firstName} ${emp.lastName}` : str(entry.employeeId)}</td>
                    <td>{formatPercent(Number(entry.score ?? 0))}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      )}

      {tab === 'forecast' && (
        <Card title="Target Forecasting">
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
              {(forecastItems ?? []).map((f, i) => (
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

      {tab === 'ai' && (
        <Card title="AI Insights">
          <div className="stat-grid">
            <div className="stat-card">
              <span className="stat-label">AI Usage</span>
              <span className="stat-value">{str(ai.aiUsage)}</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Voice AI</span>
              <span className="stat-value">{str(ai.voiceAiUsage)}</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Copilot</span>
              <span className="stat-value">{str(ai.copilotUsage)}</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Recommendation Adoption</span>
              <span className="stat-value">{str(ai.recommendationAdoption)}</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">AI Effectiveness</span>
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
          <CanAccess permission={['executive_analytics.export', 'executive_analytics.read']}>
            <button type="button" className="btn btn-primary" disabled={exportMutation.isPending} onClick={() => exportMutation.mutate()}>
              {exportMutation.isPending ? 'Exporting...' : 'Export Report'}
            </button>
          </CanAccess>
        </div>
      </Card>
    </div>
  );
}
