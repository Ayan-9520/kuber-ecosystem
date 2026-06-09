import { useMutation, useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';

import { CanAccess } from '@/components/guards/CanAccess';
import { Card, PageHeader, Tabs } from '@/components/ui';
import { AnalyticsQueryState } from '@/features/analytics/components/AnalyticsQueryState';
import { KpiGrid } from '@/features/analytics/components/KpiGrid';
import { TimeFilterBar } from '@/features/analytics/components/TimeFilterBar';
import { formatCurrency, formatPercent } from '@/lib/utils';
import { analyticsService, type AnalyticsTimePreset } from '@/services/analytics.service';

function str(v: unknown): string {
  if (v == null) return '—';
  if (typeof v === 'object') return JSON.stringify(v);
  return String(v);
}

type TabId = 'home' | 'kpis' | 'revenue' | 'leads' | 'applications' | 'commissions' | 'ai' | 'export';

const TABS: { id: TabId; label: string }[] = [
  { id: 'home', label: 'Overview' },
  { id: 'kpis', label: 'KPIs' },
  { id: 'revenue', label: 'Revenue' },
  { id: 'leads', label: 'Leads' },
  { id: 'applications', label: 'Applications' },
  { id: 'commissions', label: 'Commissions' },
  { id: 'ai', label: 'AI' },
  { id: 'export', label: 'Export' },
];

export function AnalyticsHubPage() {
  const [tab, setTab] = useState<TabId>('home');
  const [timePreset, setTimePreset] = useState<AnalyticsTimePreset>('THIS_MONTH');
  const [fromDate, setFromDate] = useState<string>();
  const [toDate, setToDate] = useState<string>();
  const [exportFormat, setExportFormat] = useState<'CSV' | 'EXCEL' | 'PDF'>('CSV');

  const queryParams = useMemo(
    () => ({
      timePreset,
      ...(fromDate ? { fromDate } : {}),
      ...(toDate ? { toDate } : {}),
    }),
    [timePreset, fromDate, toDate],
  );

  const overview = useQuery({
    queryKey: ['analytics', 'overview', queryParams],
    queryFn: () => analyticsService.overview(queryParams),
    enabled: tab === 'home',
  });

  const kpis = useQuery({
    queryKey: ['analytics', 'kpis', queryParams],
    queryFn: () => analyticsService.kpis(queryParams),
    enabled: tab === 'kpis' || tab === 'home',
  });

  const revenue = useQuery({
    queryKey: ['analytics', 'revenue', queryParams],
    queryFn: () => analyticsService.revenue(queryParams),
    enabled: tab === 'revenue',
  });

  const leads = useQuery({
    queryKey: ['analytics', 'leads', queryParams],
    queryFn: () => analyticsService.leads(queryParams),
    enabled: tab === 'leads',
  });

  const applications = useQuery({
    queryKey: ['analytics', 'applications', queryParams],
    queryFn: () => analyticsService.applications(queryParams),
    enabled: tab === 'applications',
  });

  const commissions = useQuery({
    queryKey: ['analytics', 'commissions', queryParams],
    queryFn: () => analyticsService.commissions(queryParams),
    enabled: tab === 'commissions',
  });

  const ai = useQuery({
    queryKey: ['analytics', 'ai', queryParams],
    queryFn: () => analyticsService.ai(queryParams),
    enabled: tab === 'ai',
  });

  const reports = useQuery({
    queryKey: ['analytics', 'reports'],
    queryFn: () => analyticsService.reports({ limit: 50 }),
    enabled: tab === 'export',
  });

  const exportMutation = useMutation({
    mutationFn: () =>
      analyticsService.export({
        ...queryParams,
        format: exportFormat,
        reportType: tab === 'export' ? 'overview' : tab,
      }),
  });

  const kpiList = (kpis.data?.kpis as Array<{ code: string; name: string; value: number; unit?: string }>) ?? [];
  const overviewData = overview.data;
  const revenueSeries = (revenue.data?.series as Array<{ label: string; data: Array<{ x: string; y: number }> }>) ?? [];

  return (
    <div className="page-container">
      <PageHeader
        title="Analytics"
        subtitle="Enterprise dashboards for CRM, operations, credit, management, and AI"
      />

      <TimeFilterBar
        timePreset={timePreset}
        fromDate={fromDate}
        toDate={toDate}
        onChange={(preset, from, to) => {
          setTimePreset(preset);
          setFromDate(from);
          setToDate(to);
        }}
      />

      <Tabs tabs={TABS} active={tab} onChange={(id) => setTab(id as TabId)} />

      {tab === 'home' && (
        <>
          <KpiGrid kpis={kpiList} loading={kpis.isLoading} />
          <div className="grid-2">
            <Card title="Applications Snapshot">
              <p>Total: {str((overviewData?.applications as Record<string, unknown>)?.totalApplications)}</p>
              <p>Sanctioned: {str((overviewData?.applications as Record<string, unknown>)?.sanctioned)}</p>
              <p>Disbursed: {str((overviewData?.applications as Record<string, unknown>)?.disbursed)}</p>
              <p>Approval Rate: {formatPercent((overviewData?.applications as Record<string, unknown>)?.approvalRate as number)}</p>
            </Card>
            <Card title="Support & Notifications">
              <p>Open Tickets: {str((overviewData?.support as Record<string, unknown>)?.openTickets)}</p>
              <p>Notifications: {str((overviewData?.notifications as Record<string, unknown>)?.total)}</p>
              <p>AI Requests: {str((overviewData?.ai as Record<string, unknown>)?.totalRequests)}</p>
            </Card>
          </div>
        </>
      )}

      {tab === 'kpis' && <KpiGrid kpis={kpiList} loading={kpis.isLoading} />}

      {tab === 'revenue' && (
        <Card title="Revenue Trend">
          <AnalyticsQueryState
            isLoading={revenue.isLoading}
            isError={revenue.isError}
            error={revenue.error}
            onRetry={() => void revenue.refetch()}
            isEmpty={revenueSeries.length === 0}
            emptyTitle="No revenue data"
            emptyDescription="No revenue data for the selected period."
          >
            <div className="data-table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Period</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {revenueSeries[0]?.data.map((row) => (
                    <tr key={row.x}>
                      <td>{row.x}</td>
                      <td>{formatCurrency(row.y)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </AnalyticsQueryState>
        </Card>
      )}

      {tab === 'leads' && (
        <Card title="Lead Analytics">
          <AnalyticsQueryState
            isLoading={leads.isLoading}
            isError={leads.isError}
            error={leads.error}
            onRetry={() => void leads.refetch()}
          >
            <p>Today&apos;s Leads: {str((leads.data?.summary as Record<string, unknown>)?.todayLeads)}</p>
            <p>Hot Leads: {str((leads.data?.summary as Record<string, unknown>)?.hotLeads)}</p>
            <p>Converted: {str((leads.data?.summary as Record<string, unknown>)?.convertedLeads)}</p>
          </AnalyticsQueryState>
        </Card>
      )}

      {tab === 'applications' && (
        <Card title="Application Pipeline">
          <AnalyticsQueryState
            isLoading={applications.isLoading}
            isError={applications.isError}
            error={applications.error}
            onRetry={() => void applications.refetch()}
          >
            <p>Total: {str((applications.data?.summary as Record<string, unknown>)?.totalApplications)}</p>
            <p>Sanctioned: {str((applications.data?.summary as Record<string, unknown>)?.sanctioned)}</p>
            <p>Disbursed: {str((applications.data?.summary as Record<string, unknown>)?.disbursed)}</p>
            <p>Avg TAT (days): {str((applications.data?.summary as Record<string, unknown>)?.avgTatDays)}</p>
          </AnalyticsQueryState>
        </Card>
      )}

      {tab === 'commissions' && (
        <Card title="Commission Analytics">
          <AnalyticsQueryState
            isLoading={commissions.isLoading}
            isError={commissions.isError}
            error={commissions.error}
            onRetry={() => void commissions.refetch()}
          >
            <p>
              Total Commission:{' '}
              {formatCurrency(
                ((commissions.data?.summary as Record<string, unknown>)?.totals as { totalCommission?: number } | undefined)
                  ?.totalCommission,
              )}
            </p>
            <p>Outstanding: {formatCurrency((commissions.data?.summary as Record<string, unknown>)?.commissionOutstanding as number)}</p>
            <p>Paid: {formatCurrency((commissions.data?.summary as Record<string, unknown>)?.paidCommissions as number)}</p>
          </AnalyticsQueryState>
        </Card>
      )}

      {tab === 'ai' && (
        <Card title="AI & Voice Analytics">
          <AnalyticsQueryState
            isLoading={ai.isLoading}
            isError={ai.isError}
            error={ai.error}
            onRetry={() => void ai.refetch()}
          >
            <p>Total AI Requests: {str((ai.data?.summary as Record<string, unknown>)?.totalRequests)}</p>
            <p>Voice AI: {str((ai.data?.summary as Record<string, unknown>)?.voiceAiRequests)}</p>
            <p>Copilot: {str((ai.data?.summary as Record<string, unknown>)?.copilotRequests)}</p>
            <p>RAG: {str((ai.data?.summary as Record<string, unknown>)?.ragRequests)}</p>
            <p>Failures: {str((ai.data?.summary as Record<string, unknown>)?.failureCount)}</p>
          </AnalyticsQueryState>
        </Card>
      )}

      {tab === 'export' && (
        <Card title="Export Center">
          <CanAccess permission={['analytics.export', 'analytics.read']}>
            <div className="form-row">
              <label>
                Format
                <select value={exportFormat} onChange={(e) => setExportFormat(e.target.value as typeof exportFormat)}>
                  <option value="CSV">CSV</option>
                  <option value="EXCEL">Excel</option>
                  <option value="PDF">PDF</option>
                </select>
              </label>
              <button
                type="button"
                className="btn btn-primary"
                disabled={exportMutation.isPending}
                onClick={() => exportMutation.mutate()}
              >
                {exportMutation.isPending ? 'Exporting...' : 'Download Report'}
              </button>
            </div>
          </CanAccess>
          <h4 className="mt-md">Scheduled Reports</h4>
          <AnalyticsQueryState
            isLoading={reports.isLoading}
            isError={reports.isError}
            error={reports.error}
            onRetry={() => void reports.refetch()}
            isEmpty={((reports.data?.items as Array<Record<string, unknown>>) ?? []).length === 0}
            emptyTitle="No scheduled reports"
            emptyDescription="Create a scheduled report to see it here."
          >
            <ul className="simple-list">
              {((reports.data?.items as Array<Record<string, unknown>>) ?? []).map((r) => (
                <li key={String(r.id)}>{str(r.name)} ({str(r.reportType)})</li>
              ))}
            </ul>
          </AnalyticsQueryState>
        </Card>
      )}
    </div>
  );
}
