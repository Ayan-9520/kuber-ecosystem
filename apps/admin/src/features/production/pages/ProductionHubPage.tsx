import { useQuery } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';

import { PaginatedListView } from '@/components/common/PaginatedListView';
import { Card, LoadingSpinner, PageHeader, StatCard, Tabs } from '@/components/ui';
import { StatusBadge } from '@/components/ui/Badge';
import { usePagination } from '@/hooks';
import { fieldStr, formatDateTime } from '@/lib/utils';
import { productionService } from '@/services/production.service';

import '../production.css';

type TabId = 'dashboard' | 'environment' | 'health' | 'deployments' | 'releases' | 'incidents' | 'reports';

const TABS: { id: TabId; label: string }[] = [
  { id: 'dashboard', label: 'Production Dashboard' },
  { id: 'environment', label: 'Environment' },
  { id: 'health', label: 'Health Dashboard' },
  { id: 'deployments', label: 'Deployment Dashboard' },
  { id: 'releases', label: 'Release Dashboard' },
  { id: 'incidents', label: 'Incidents' },
  { id: 'reports', label: 'Reports' },
];

export function ProductionHubPage() {
  const [tab, setTab] = useState<TabId>('dashboard');
  const { page, limit, setPage, reset } = usePagination();

  useEffect(() => { reset(); }, [tab, reset]);

  const dashboard = useQuery({
    queryKey: ['production', 'dashboard'],
    queryFn: () => productionService.dashboard(),
    enabled: ['dashboard', 'reports', 'environment'].includes(tab),
    refetchInterval: tab === 'dashboard' ? 60_000 : false,
  });

  const health = useQuery({
    queryKey: ['production', 'health'],
    queryFn: () => productionService.health(),
    enabled: tab === 'health',
    refetchInterval: 30_000,
  });

  const deployments = useQuery({
    queryKey: ['production', 'deployments', { page, limit }],
    queryFn: () => productionService.deployments({ page, limit }),
    enabled: tab === 'deployments',
  });

  const releases = useQuery({
    queryKey: ['production', 'releases', { page, limit }],
    queryFn: () => productionService.releases({ page, limit }),
    enabled: tab === 'releases',
  });

  const incidents = useQuery({
    queryKey: ['production', 'incidents', { page, limit }],
    queryFn: () => productionService.incidents({ page, limit }),
    enabled: tab === 'incidents',
  });

  const status = useMemo(() => {
    const s = (dashboard.data?.status ?? {}) as Record<string, unknown>;
    const env = (s.environment ?? {}) as Record<string, unknown>;
    const urls = (env.urls ?? {}) as Record<string, string>;
    return { env, urls };
  }, [dashboard.data]);

  const goLiveGates = useMemo(() => {
    const r = (dashboard.data?.reports ?? {}) as Record<string, unknown>;
    return (r.goLiveGates ?? {}) as { ready?: boolean; gates?: Record<string, unknown>[] };
  }, [dashboard.data]);

  const deployColumns = [
    { key: 'component', header: 'Component', render: (r: Record<string, unknown>) => fieldStr(r, 'component') },
    { key: 'version', header: 'Version', render: (r: Record<string, unknown>) => fieldStr(r, 'version') },
    { key: 'strategy', header: 'Strategy', render: (r: Record<string, unknown>) => fieldStr(r, 'strategy') },
    { key: 'status', header: 'Status', render: (r: Record<string, unknown>) => <StatusBadge status={fieldStr(r, 'status')} /> },
    { key: 'createdAt', header: 'Deployed', render: (r: Record<string, unknown>) => formatDateTime(fieldStr(r, 'createdAt')) },
  ];

  const releaseColumns = [
    { key: 'version', header: 'Version', render: (r: Record<string, unknown>) => fieldStr(r, 'version') },
    { key: 'name', header: 'Name', render: (r: Record<string, unknown>) => fieldStr(r, 'name') },
    { key: 'status', header: 'Status', render: (r: Record<string, unknown>) => <StatusBadge status={fieldStr(r, 'status')} /> },
    { key: 'uatSignedOff', header: 'UAT', render: (r: Record<string, unknown>) => fieldStr(r, 'uatSignedOff') === 'true' ? '✓' : '—' },
    { key: 'goLiveApproved', header: 'Go-Live', render: (r: Record<string, unknown>) => fieldStr(r, 'goLiveApproved') === 'true' ? '✓' : '—' },
    { key: 'releasedAt', header: 'Released', render: (r: Record<string, unknown>) => formatDateTime(fieldStr(r, 'releasedAt')) },
  ];

  const incidentColumns = [
    { key: 'title', header: 'Title', render: (r: Record<string, unknown>) => fieldStr(r, 'title') },
    { key: 'severity', header: 'Severity', render: (r: Record<string, unknown>) => <StatusBadge status={fieldStr(r, 'severity')} /> },
    { key: 'status', header: 'Status', render: (r: Record<string, unknown>) => <StatusBadge status={fieldStr(r, 'status')} /> },
    { key: 'startedAt', header: 'Started', render: (r: Record<string, unknown>) => formatDateTime(fieldStr(r, 'startedAt')) },
  ];

  if (dashboard.isLoading && tab === 'dashboard') return <LoadingSpinner />;

  const healthData = health.data ?? {};
  const endpoints = (healthData.endpoints ?? []) as Record<string, unknown>[];

  return (
    <div className="production-hub">
      <PageHeader
        title="Production Environment"
        subtitle="Live production operations — health, deployments, releases, incidents, and compliance"
      />

      <Tabs tabs={TABS} active={tab} onChange={(id) => setTab(id as TabId)} />

      {tab === 'dashboard' && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            <StatCard label="Status" value={fieldStr(status.env, 'status')} />
            <StatCard label="Version" value={fieldStr(status.env, 'version')} />
            <StatCard label="Availability" value={`${fieldStr(status.env, 'availability')}%`} />
            <StatCard label="Go-Live Ready" value={goLiveGates.ready ? 'Yes' : 'No'} />
          </div>
          <Card title="Go-Live Gates" className="mt-4">
            <ul className="gate-list">
              {(goLiveGates.gates ?? []).map((g) => (
                <li key={fieldStr(g, 'id')} className={fieldStr(g, 'passed') === 'true' ? 'gate-pass' : 'gate-fail'}>
                  {fieldStr(g, 'passed') === 'true' ? '✓' : '✗'} {fieldStr(g, 'label')} — {fieldStr(g, 'detail')}
                </li>
              ))}
            </ul>
          </Card>
        </>
      )}

      {tab === 'environment' && (
        <Card title="Production Domains" className="mt-4">
          <div className="domain-grid">
            {Object.entries(status.urls).map(([key, url]) => (
              <div key={key} className="domain-card">
                <strong>{key}</strong>
                <div>{url}</div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {tab === 'health' && (
        <Card title="Health Checks" className="mt-4">
          <StatCard label="Overall" value={fieldStr(healthData, 'overall')} />
          <PaginatedListView
            search=""
            onSearchChange={() => {}}
            columns={[
              { key: 'path', header: 'Endpoint', render: (r) => fieldStr(r, 'path') },
              { key: 'status', header: 'Status', render: (r) => <StatusBadge status={fieldStr(r, 'status')} /> },
            ]}
            data={endpoints}
            isLoading={health.isLoading}
            onPageChange={() => {}}
            emptyTitle="No health data"
          />
        </Card>
      )}

      {tab === 'deployments' && (
        <PaginatedListView search="" onSearchChange={() => {}} columns={deployColumns} data={deployments.data?.items ?? []} meta={deployments.data?.meta} isLoading={deployments.isLoading} onPageChange={setPage} emptyTitle="No deployments" />
      )}

      {tab === 'releases' && (
        <PaginatedListView search="" onSearchChange={() => {}} columns={releaseColumns} data={releases.data?.items ?? []} meta={releases.data?.meta} isLoading={releases.isLoading} onPageChange={setPage} emptyTitle="No releases" />
      )}

      {tab === 'incidents' && (
        <PaginatedListView search="" onSearchChange={() => {}} columns={incidentColumns} data={incidents.data?.items ?? []} meta={incidents.data?.meta} isLoading={incidents.isLoading} onPageChange={setPage} emptyTitle="No incidents" />
      )}

      {tab === 'reports' && dashboard.data && (
        <div className="mt-4 grid gap-4">
          <Card title="Availability Report">
            <StatCard label="Target" value={`${fieldStr((dashboard.data.reports as Record<string, unknown>)?.availabilityReport as Record<string, unknown> ?? {}, 'target')}%`} />
            <StatCard label="Current" value={`${fieldStr((dashboard.data.reports as Record<string, unknown>)?.availabilityReport as Record<string, unknown> ?? {}, 'current')}%`} />
          </Card>
          <Card title="Compliance Report">
            <StatCard label="Audit Logging" value="Enabled" />
            <StatCard label="Encryption" value="At Rest + In Transit" />
          </Card>
        </div>
      )}
    </div>
  );
}
