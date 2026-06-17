import { useQuery } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';

import { PaginatedListView } from '@/components/common/PaginatedListView';
import { Card, LoadingSpinner, PageHeader, StatCard, Tabs } from '@/components/ui';
import { StatusBadge } from '@/components/ui/Badge';
import { usePagination } from '@/hooks';
import { fieldStr, formatDateTime } from '@/lib/utils';
import { stagingService } from '@/services/staging.service';

import '../staging.css';

type TabId = 'environment' | 'health' | 'deployments' | 'releases' | 'reports';

const TABS: { id: TabId; label: string }[] = [
  { id: 'environment', label: 'Environment Dashboard' },
  { id: 'health', label: 'Staging Health' },
  { id: 'deployments', label: 'Deployment Dashboard' },
  { id: 'releases', label: 'Release Dashboard' },
  { id: 'reports', label: 'Reports' },
];

export function StagingHubPage() {
  const [tab, setTab] = useState<TabId>('environment');
  const { page, limit, setPage, reset } = usePagination();

  useEffect(() => { reset(); }, [tab, reset]);

  const dashboard = useQuery({
    queryKey: ['staging', 'dashboard'],
    queryFn: () => stagingService.dashboard(),
    enabled: ['environment', 'reports'].includes(tab),
  });

  const health = useQuery({
    queryKey: ['staging', 'health'],
    queryFn: () => stagingService.health(),
    enabled: tab === 'health',
    refetchInterval: 60_000,
  });

  const deployments = useQuery({
    queryKey: ['staging', 'deployments', { page, limit }],
    queryFn: () => stagingService.deployments({ page, limit }),
    enabled: tab === 'deployments',
  });

  const releases = useQuery({
    queryKey: ['staging', 'releases', { page, limit }],
    queryFn: () => stagingService.releases({ page, limit }),
    enabled: tab === 'releases',
  });

  const status = useMemo(() => {
    const s = (dashboard.data?.status ?? {}) as Record<string, unknown>;
    const env = (s.environment ?? {}) as Record<string, unknown>;
    const urls = (env.urls ?? {}) as Record<string, string>;
    return { env, urls, domains: s.domains as Record<string, string> | undefined };
  }, [dashboard.data]);

  const deployColumns = [
    { key: 'component', header: 'Component', render: (r: Record<string, unknown>) => fieldStr(r, 'component') },
    { key: 'version', header: 'Version', render: (r: Record<string, unknown>) => fieldStr(r, 'version') },
    { key: 'status', header: 'Status', render: (r: Record<string, unknown>) => <StatusBadge status={fieldStr(r, 'status')} /> },
    { key: 'buildStatus', header: 'Build', render: (r: Record<string, unknown>) => <StatusBadge status={fieldStr(r, 'buildStatus')} /> },
    { key: 'testStatus', header: 'Tests', render: (r: Record<string, unknown>) => <StatusBadge status={fieldStr(r, 'testStatus')} /> },
    { key: 'healthStatus', header: 'Health', render: (r: Record<string, unknown>) => <StatusBadge status={fieldStr(r, 'healthStatus')} /> },
    { key: 'createdAt', header: 'Deployed', render: (r: Record<string, unknown>) => formatDateTime(fieldStr(r, 'createdAt')) },
  ];

  const releaseColumns = [
    { key: 'releaseVersion', header: 'Version', render: (r: Record<string, unknown>) => fieldStr(r, 'releaseVersion') },
    { key: 'branch', header: 'Branch', render: (r: Record<string, unknown>) => fieldStr(r, 'branch') },
    { key: 'status', header: 'Status', render: (r: Record<string, unknown>) => <StatusBadge status={fieldStr(r, 'status')} /> },
    { key: 'preDeployCheck', header: 'Pre', render: (r: Record<string, unknown>) => fieldStr(r, 'preDeployCheck') === 'true' ? '✓' : '—' },
    { key: 'postDeployCheck', header: 'Post', render: (r: Record<string, unknown>) => fieldStr(r, 'postDeployCheck') === 'true' ? '✓' : '—' },
    { key: 'createdAt', header: 'Started', render: (r: Record<string, unknown>) => formatDateTime(fieldStr(r, 'createdAt')) },
  ];

  if (dashboard.isLoading && tab === 'environment') return <LoadingSpinner />;

  const healthData = health.data ?? {};
  const endpoints = (healthData.endpoints ?? []) as Record<string, unknown>[];

  return (
    <div className="staging-hub">
      <PageHeader
        title="Staging Environment"
        subtitle="Production-like staging for testing, UAT, release validation, and deployment verification"
      />

      <Tabs tabs={TABS} active={tab} onChange={(id) => setTab(id as TabId)} />

      {tab === 'environment' && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            <StatCard label="Status" value={fieldStr(status.env, 'status')} />
            <StatCard label="Branch" value={fieldStr(status.env, 'branch')} />
            <StatCard label="Version" value={fieldStr(status.env, 'version')} />
            <StatCard label="Masked Data" value={fieldStr(status.env, 'maskedData') === 'true' ? 'Yes' : 'No'} />
          </div>
          <Card title="Staging Domains" className="mt-4">
            <div className="domain-grid">
              {Object.entries(status.urls).map(([key, url]) => (
                <div key={key} className="domain-card">
                  <strong>{key}</strong>
                  <div>{url}</div>
                </div>
              ))}
            </div>
          </Card>
        </>
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
        <PaginatedListView
          search=""
          onSearchChange={() => {}}
          columns={deployColumns}
          data={deployments.data?.items ?? []}
          meta={deployments.data?.meta}
          isLoading={deployments.isLoading}
          onPageChange={setPage}
          emptyTitle="No staging deployments"
        />
      )}

      {tab === 'releases' && (
        <PaginatedListView
          search=""
          onSearchChange={() => {}}
          columns={releaseColumns}
          data={releases.data?.items ?? []}
          meta={releases.data?.meta}
          isLoading={releases.isLoading}
          onPageChange={setPage}
          emptyTitle="No release validations"
        />
      )}

      {tab === 'reports' && dashboard.data && (
        <div className="mt-4 grid gap-4">
          <Card title="Deployment Report">
            <StatCard label="Total" value={fieldStr((dashboard.data.reports as Record<string, unknown>)?.deploymentReport as Record<string, unknown> ?? {}, 'total')} />
          </Card>
          <Card title="UAT Demo Accounts">
            <ul className="checklist">
              {((dashboard.data.reports as Record<string, unknown>)?.uatReport as Record<string, unknown>)?.demoAccounts
                ? (((dashboard.data.reports as Record<string, unknown>).uatReport as Record<string, unknown>).demoAccounts as string[]).map((a) => (
                  <li key={a}>{a}</li>
                ))
                : null}
            </ul>
          </Card>
        </div>
      )}
    </div>
  );
}
