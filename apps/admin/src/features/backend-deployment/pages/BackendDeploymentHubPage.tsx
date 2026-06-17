import { useQuery } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';

import { PaginatedListView } from '@/components/common/PaginatedListView';
import { Card, LoadingSpinner, PageHeader, StatCard, Tabs } from '@/components/ui';
import { StatusBadge } from '@/components/ui/Badge';
import { usePagination } from '@/hooks';
import { fieldStr, formatDateTime } from '@/lib/utils';
import { backendDeploymentService } from '@/services/backend-deployment.service';

import '../backend-deployment.css';

type TabId = 'dashboard' | 'services' | 'health' | 'releases' | 'versions' | 'reports';

const TABS: { id: TabId; label: string }[] = [
  { id: 'dashboard', label: 'Deployment Dashboard' },
  { id: 'services', label: 'Service Health' },
  { id: 'health', label: 'Health Checks' },
  { id: 'releases', label: 'Release Tracking' },
  { id: 'versions', label: 'Version Dashboard' },
  { id: 'reports', label: 'Reports' },
];

export function BackendDeploymentHubPage() {
  const [tab, setTab] = useState<TabId>('dashboard');
  const { page, limit, setPage, reset } = usePagination();

  useEffect(() => { reset(); }, [tab, reset]);

  const dashboard = useQuery({
    queryKey: ['backend-deployment', 'dashboard'],
    queryFn: () => backendDeploymentService.dashboard(),
    enabled: ['dashboard', 'services'].includes(tab),
    refetchInterval: tab === 'dashboard' ? 60_000 : false,
  });

  const health = useQuery({
    queryKey: ['backend-deployment', 'health'],
    queryFn: () => backendDeploymentService.health(),
    enabled: tab === 'health',
    refetchInterval: 30_000,
  });

  const releases = useQuery({
    queryKey: ['backend-deployment', 'releases', { page, limit }],
    queryFn: () => backendDeploymentService.deployments({ page, limit }),
    enabled: tab === 'releases',
  });

  const versions = useQuery({
    queryKey: ['backend-deployment', 'versions', { page, limit }],
    queryFn: () => backendDeploymentService.releases({ page, limit }),
    enabled: tab === 'versions',
  });

  const reports = useQuery({
    queryKey: ['backend-deployment', 'reports'],
    queryFn: () => backendDeploymentService.reports(),
    enabled: tab === 'reports',
  });

  const scores = useMemo(() => {
    const s = (dashboard.data?.scores ?? {}) as Record<string, number>;
    return {
      deployment: s.backendDeploymentReadiness ?? 0,
      security: s.securityScore ?? 0,
      availability: s.availabilityScore ?? 0,
      scalability: s.scalabilityScore ?? 0,
      launch: s.productionLaunchReadiness ?? 0,
    };
  }, [dashboard.data]);

  const deployColumns = [
    { key: 'version', header: 'Version', render: (r: Record<string, unknown>) => fieldStr(r, 'version') },
    { key: 'strategy', header: 'Strategy', render: (r: Record<string, unknown>) => <StatusBadge status={fieldStr(r, 'strategy')} /> },
    { key: 'status', header: 'Status', render: (r: Record<string, unknown>) => <StatusBadge status={fieldStr(r, 'status')} /> },
    { key: 'domain', header: 'Domain', render: (r: Record<string, unknown>) => fieldStr(r, 'domain') },
    { key: 'branch', header: 'Branch', render: (r: Record<string, unknown>) => fieldStr(r, 'branch') },
    { key: 'createdAt', header: 'Deployed', render: (r: Record<string, unknown>) => formatDateTime(fieldStr(r, 'createdAt')) },
  ];

  const versionColumns = [
    { key: 'version', header: 'Version', render: (r: Record<string, unknown>) => fieldStr(r, 'version') },
    { key: 'name', header: 'Name', render: (r: Record<string, unknown>) => fieldStr(r, 'name') },
    { key: 'status', header: 'Status', render: (r: Record<string, unknown>) => <StatusBadge status={fieldStr(r, 'status')} /> },
    { key: 'releasedAt', header: 'Released', render: (r: Record<string, unknown>) => formatDateTime(fieldStr(r, 'releasedAt')) },
    { key: 'createdAt', header: 'Created', render: (r: Record<string, unknown>) => formatDateTime(fieldStr(r, 'createdAt')) },
  ];

  const services = (dashboard.data?.health as Record<string, unknown>)?.services as {
    code: string; name: string; status: string;
  }[] | undefined;

  const endpoints = (health.data?.endpoints ?? []) as { path: string; status: string }[];
  const apiModules = (dashboard.data?.apiModules as string[]) ?? [];

  if (dashboard.isLoading && tab === 'dashboard') return <LoadingSpinner />;

  return (
    <div className="backend-deployment-hub">
      <PageHeader
        title="Backend Production Deployment"
        subtitle="api.kuberone.com — backend API, workers, queues, AI services, and platform health"
      />

      <Tabs tabs={TABS} active={tab} onChange={(id) => setTab(id as TabId)} />

      {tab === 'dashboard' && (
        <>
          <div className="backend-deployment-scores">
            <StatCard label="Deployment Readiness" value={`${scores.deployment}%`} />
            <StatCard label="Security Score" value={`${scores.security}%`} />
            <StatCard label="Availability" value={`${scores.availability}%`} />
            <StatCard label="Scalability" value={`${scores.scalability}%`} />
            <StatCard label="Production Launch" value={`${scores.launch}%`} />
            <StatCard
              label="Services Running"
              value={`${fieldStr(dashboard.data ?? {}, 'servicesRunning')}/${fieldStr(dashboard.data ?? {}, 'totalServices')}`}
            />
          </div>
          <div className="grid-2">
            <Card title="Production Domain">
              <p><strong>API:</strong> https://api.kuberone.com</p>
              <p className="text-muted">Rolling · Blue-Green · Canary strategies supported</p>
            </Card>
            <Card title="Build Validation">
              <ul className="app-store-checklist">
                {((dashboard.data?.buildValidation as string[]) ?? []).map((step) => (
                  <li key={step} className="passed">{step}</li>
                ))}
              </ul>
            </Card>
          </div>
          <Card title="API Modules (31)">
            <ul className="module-list">
              {apiModules.map((m) => <li key={m}>{m}</li>)}
            </ul>
          </Card>
        </>
      )}

      {tab === 'services' && (
        <Card title="Deploy Services">
          <div className="service-grid">
            {(services ?? []).map((svc) => (
              <div key={svc.code} className="service-item">
                <strong>{svc.name}</strong>
                <br />
                <StatusBadge status={svc.status} />
              </div>
            ))}
          </div>
        </Card>
      )}

      {tab === 'health' && (
        <div className="grid-2">
          <Card title="Health Endpoints">
            {endpoints.map((ep) => (
              <p key={ep.path}>
                <code>{ep.path}</code> — <StatusBadge status={ep.status} />
              </p>
            ))}
          </Card>
          <Card title="Observability">
            <p>Logs · Metrics · Traces · Correlation IDs · Error Tracking</p>
            <p className="text-muted">Prometheus · Grafana · OpenTelemetry</p>
          </Card>
        </div>
      )}

      {tab === 'releases' && (
        <PaginatedListView search="" onSearchChange={() => {}} columns={deployColumns}
          data={releases.data?.items ?? []} meta={releases.data?.meta} isLoading={releases.isLoading}
          onPageChange={setPage} emptyTitle="No deployments recorded" />
      )}

      {tab === 'versions' && (
        <PaginatedListView search="" onSearchChange={() => {}} columns={versionColumns}
          data={versions.data?.items ?? []} meta={versions.data?.meta} isLoading={versions.isLoading}
          onPageChange={setPage} emptyTitle="No release versions" />
      )}

      {tab === 'reports' && (
        <div className="grid-2">
          {(['deploymentReport', 'releaseReport', 'healthReport', 'securityReport', 'scalabilityReport'] as const).map((key) => {
            const r = (reports.data?.[key] ?? {}) as Record<string, unknown>;
            const titles: Record<string, string> = {
              deploymentReport: 'Deployment Report',
              releaseReport: 'Release Report',
              healthReport: 'Health Report',
              securityReport: 'Security Report',
              scalabilityReport: 'Scalability Report',
            };
            return (
              <Card key={key} title={titles[key]}>
                <p><strong>Score:</strong> {fieldStr(r, 'score')}%</p>
                <p>{fieldStr(r, 'summary')}</p>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
