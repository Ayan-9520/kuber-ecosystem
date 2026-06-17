import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';

import { PaginatedListView } from '@/components/common/PaginatedListView';
import { CanAccess } from '@/components/guards/CanAccess';
import { Button, Card, LoadingSpinner, PageHeader, StatCard, Tabs } from '@/components/ui';
import { StatusBadge } from '@/components/ui/Badge';
import { useDebounce, usePagination } from '@/hooks';
import { fieldStr, formatDateTime } from '@/lib/utils';
import { monitoringService } from '@/services/monitoring.service';

import '../monitoring.css';

type TabId = 'overview' | 'system' | 'database' | 'ai' | 'alerts' | 'business';

const TABS: { id: TabId; label: string }[] = [
  { id: 'overview', label: 'Monitoring Dashboard' },
  { id: 'system', label: 'System Health' },
  { id: 'database', label: 'Database' },
  { id: 'ai', label: 'AI Systems' },
  { id: 'alerts', label: 'Alerts' },
  { id: 'business', label: 'Business Health' },
];

export function MonitoringHubPage() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<TabId>('overview');
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search);
  const { page, limit, setPage, reset } = usePagination();

  useEffect(() => { reset(); }, [tab, debouncedSearch, reset]);

  const params = useMemo(() => ({ period: 'day' }), []);

  const overview = useQuery({
    queryKey: ['monitoring', 'overview', params],
    queryFn: () => monitoringService.overview(params),
    enabled: ['overview', 'system', 'business'].includes(tab),
  });

  const system = useQuery({
    queryKey: ['monitoring', 'system', params],
    queryFn: () => monitoringService.system(params),
    enabled: tab === 'system',
  });

  const database = useQuery({
    queryKey: ['monitoring', 'database', params],
    queryFn: () => monitoringService.database(params),
    enabled: tab === 'database',
  });

  const ai = useQuery({
    queryKey: ['monitoring', 'ai', params],
    queryFn: () => monitoringService.ai(params),
    enabled: tab === 'ai',
  });

  const business = useQuery({
    queryKey: ['monitoring', 'business', params],
    queryFn: () => monitoringService.business(params),
    enabled: tab === 'business',
  });

  const alerts = useQuery({
    queryKey: ['monitoring', 'alerts', { page, limit, search: debouncedSearch }],
    queryFn: () => monitoringService.alerts({ page, limit, search: debouncedSearch || undefined }),
    enabled: tab === 'alerts',
  });

  const alertSummary = useQuery({
    queryKey: ['monitoring', 'alerts-summary'],
    queryFn: () => monitoringService.alertsSummary(),
    enabled: ['overview', 'alerts'].includes(tab),
  });

  const ackMut = useMutation({
    mutationFn: (id: string) => monitoringService.updateAlert(id, { status: 'ACKNOWLEDGED' }),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['monitoring'] }),
  });

  const resolveMut = useMutation({
    mutationFn: (id: string) => monitoringService.updateAlert(id, { status: 'RESOLVED' }),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['monitoring'] }),
  });

  const summary = (overview.data?.summary ?? {}) as Record<string, unknown>;
  const components = (overview.data?.components ?? {}) as Record<string, string>;
  const sla = (overview.data?.sla ?? {}) as Record<string, Record<string, unknown>>;

  const alertColumns = [
    { key: 'code', header: 'Code', render: (r: Record<string, unknown>) => fieldStr(r, 'code') },
    { key: 'title', header: 'Alert', render: (r: Record<string, unknown>) => fieldStr(r, 'title') },
    { key: 'severity', header: 'Severity', render: (r: Record<string, unknown>) => <StatusBadge status={fieldStr(r, 'severity')} /> },
    { key: 'status', header: 'Status', render: (r: Record<string, unknown>) => <StatusBadge status={fieldStr(r, 'status')} /> },
    { key: 'component', header: 'Component', render: (r: Record<string, unknown>) => fieldStr(r, 'component') },
    { key: 'createdAt', header: 'Time', render: (r: Record<string, unknown>) => formatDateTime(fieldStr(r, 'createdAt')) },
    {
      key: 'actions', header: '', render: (r: Record<string, unknown>) => (
        <CanAccess permission={['monitoring.alerts']}>
          {fieldStr(r, 'status') === 'OPEN' && (
            <div className="flex gap-1">
              <Button size="sm" variant="secondary" onClick={() => ackMut.mutate(fieldStr(r, 'id'))}>Ack</Button>
              <Button size="sm" onClick={() => resolveMut.mutate(fieldStr(r, 'id'))}>Resolve</Button>
            </div>
          )}
        </CanAccess>
      ),
    },
  ];

  if (overview.isLoading && tab === 'overview') return <LoadingSpinner />;

  return (
    <div className="monitoring-hub">
      <PageHeader
        title="Production Monitoring"
        subtitle="Real-time visibility into KuberOne backend, CRM, database, AI, notifications & infrastructure"
      />

      <Tabs tabs={TABS} active={tab} onChange={(id) => setTab(id as TabId)} />

      {tab === 'overview' && (
        <>
          <div className="flex gap-2 flex-wrap mb-4">
            <span className="health-pill ok">Coverage: {fieldStr(summary, 'monitoringCoveragePercent')}%</span>
            <span className="health-pill">Metrics: {fieldStr(summary, 'metricsCovered')}/{fieldStr(summary, 'totalMetrics')}</span>
            <span className="health-pill">Visibility: {fieldStr(summary, 'productionVisibilityScore')}%</span>
            <span className="health-pill">Ops Readiness: {fieldStr(summary, 'operationalReadinessScore')}%</span>
            <span className={`health-pill ${Number(alertSummary.data?.criticalAlerts ?? 0) > 0 ? 'down' : 'ok'}`}>
              Open Alerts: {fieldStr(summary, 'openAlerts') ?? fieldStr(alertSummary.data ?? {}, 'openAlerts')}
            </span>
          </div>

          <div className="stat-grid">
            <StatCard label="Status" value={fieldStr(summary, 'status') || 'unknown'} />
            <StatCard label="API Success Rate" value={`${fieldStr((overview.data?.application as Record<string, unknown> | undefined) ?? {}, 'apiSuccessRate')}%`} />
            <StatCard label="DB Status" value={fieldStr((overview.data?.database as Record<string, unknown> | undefined) ?? {}, 'status')} />
            <StatCard label="Queue Depth" value={fieldStr((overview.data?.queues as Record<string, unknown> | undefined) ?? {}, 'totalPending') || fieldStr((overview.data?.queues as Record<string, unknown> | undefined) ?? {}, 'notificationQueue')} />
          </div>

          <Card className="mt-4" title="Platform Components">
            <div className="component-grid">
              {Object.entries(components).map(([name, status]) => (
                <div key={name} className="component-card">
                  <strong>{name}</strong>
                  <div><StatusBadge status={status} /></div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="mt-4" title="SLA Monitoring">
            <div className="stat-grid">
              <StatCard label="Availability" value={`${fieldStr(sla.availability ?? {}, 'actual')}% / ${fieldStr(sla.availability ?? {}, 'target')}%`} />
              <StatCard label="Uptime" value={`${fieldStr(sla.uptime ?? {}, 'actual')}%`} />
              <StatCard label="Response Time" value={`${fieldStr(sla.responseTime ?? {}, 'actual')}ms`} />
              <StatCard label="Notification SLA" value={`${fieldStr(sla.notification ?? {}, 'actual')}%`} />
            </div>
          </Card>
        </>
      )}

      {tab === 'system' && (
        <>
          <div className="stat-grid">
            <StatCard label="CPU %" value={fieldStr(system.data ?? {}, 'cpuUsagePercent')} />
            <StatCard label="Memory %" value={fieldStr(system.data ?? {}, 'memoryUsagePercent')} />
            <StatCard label="Server Health" value={fieldStr(system.data ?? {}, 'serverHealth')} />
            <StatCard label="Containers" value={fieldStr(system.data ?? {}, 'containerCount')} />
          </div>
          {system.isLoading && <LoadingSpinner />}
        </>
      )}

      {tab === 'database' && (
        <div className="stat-grid">
          <StatCard label="Status" value={fieldStr(database.data ?? {}, 'status')} />
          <StatCard label="Query P95" value={`${fieldStr(database.data ?? {}, 'queryTimeP95Ms')}ms`} />
          <StatCard label="Connections" value={fieldStr(database.data ?? {}, 'connectionPoolActive')} />
          <StatCard label="DB Size (MB)" value={fieldStr(database.data ?? {}, 'databaseSizeMb')} />
        </div>
      )}

      {tab === 'ai' && (
        <div className="stat-grid">
          <StatCard label="OpenAI Requests" value={fieldStr(ai.data ?? {}, 'openaiRequests')} />
          <StatCard label="Token Usage" value={fieldStr(ai.data ?? {}, 'tokenUsage')} />
          <StatCard label="Cost USD" value={fieldStr(ai.data ?? {}, 'costUsd')} />
          <StatCard label="Failures" value={fieldStr(ai.data ?? {}, 'failures')} />
          <StatCard label="Fallback" value={fieldStr(ai.data ?? {}, 'fallbackUsage')} />
          <StatCard label="RAG Latency" value={`${fieldStr(ai.data ?? {}, 'ragRetrievalTimeP95Ms')}ms`} />
          <StatCard label="Voice Sessions" value={fieldStr(ai.data ?? {}, 'voiceAiSessions')} />
        </div>
      )}

      {tab === 'business' && (
        <div className="stat-grid">
          <StatCard label="Leads" value={fieldStr(business.data ?? {}, 'leadsCreated')} />
          <StatCard label="Applications" value={fieldStr(business.data ?? {}, 'applicationsCreated')} />
          <StatCard label="Approved" value={fieldStr(business.data ?? {}, 'applicationsApproved')} />
          <StatCard label="Disbursed" value={fieldStr(business.data ?? {}, 'applicationsDisbursed')} />
          <StatCard label="Referrals" value={fieldStr(business.data ?? {}, 'referralConversions')} />
          <StatCard label="Commissions" value={fieldStr(business.data ?? {}, 'commissionPayments')} />
          <StatCard label="Tickets" value={fieldStr(business.data ?? {}, 'supportTickets')} />
        </div>
      )}

      {tab === 'alerts' && (
        <PaginatedListView
          search={search}
          onSearchChange={setSearch}
          columns={alertColumns}
          data={alerts.data?.items ?? []}
          meta={alerts.data?.meta}
          isLoading={alerts.isLoading}
          onPageChange={setPage}
          emptyTitle="No alerts"
        />
      )}
    </div>
  );
}
