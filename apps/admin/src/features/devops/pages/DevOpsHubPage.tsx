import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';

import { PaginatedListView } from '@/components/common/PaginatedListView';
import { CanAccess } from '@/components/guards/CanAccess';
import { Button, Card, LoadingSpinner, PageHeader, StatCard, Tabs } from '@/components/ui';
import { StatusBadge } from '@/components/ui/Badge';
import { usePagination } from '@/hooks';
import { fieldStr, formatDateTime } from '@/lib/utils';
import { devopsService } from '@/services/devops.service';

import '../devops.css';

type TabId = 'dashboard' | 'pipelines' | 'deployments' | 'releases' | 'rollbacks' | 'history';

const TABS: { id: TabId; label: string }[] = [
  { id: 'dashboard', label: 'DevOps Dashboard' },
  { id: 'pipelines', label: 'Pipeline Dashboard' },
  { id: 'deployments', label: 'Deployment Dashboard' },
  { id: 'releases', label: 'Release Dashboard' },
  { id: 'rollbacks', label: 'Rollback Dashboard' },
  { id: 'history', label: 'Audit History' },
];

export function DevOpsHubPage() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<TabId>('dashboard');
  const { page, limit, setPage, reset } = usePagination();

  useEffect(() => { reset(); }, [tab, reset]);

  const dashboard = useQuery({
    queryKey: ['devops', 'dashboard'],
    queryFn: () => devopsService.dashboard(),
    enabled: tab === 'dashboard',
  });

  const pipelines = useQuery({
    queryKey: ['devops', 'pipelines', { page, limit }],
    queryFn: () => devopsService.pipelines({ page, limit }),
    enabled: tab === 'pipelines',
  });

  const deployments = useQuery({
    queryKey: ['devops', 'deployments', { page, limit }],
    queryFn: () => devopsService.deployments({ page, limit }),
    enabled: tab === 'deployments',
  });

  const releases = useQuery({
    queryKey: ['devops', 'releases', { page, limit }],
    queryFn: () => devopsService.releases({ page, limit }),
    enabled: tab === 'releases',
  });

  const rollbacks = useQuery({
    queryKey: ['devops', 'rollbacks', { page, limit }],
    queryFn: () => devopsService.rollbacks({ page, limit }),
    enabled: tab === 'rollbacks',
  });

  const history = useQuery({
    queryKey: ['devops', 'history', { page, limit }],
    queryFn: () => devopsService.history({ page, limit, type: 'all' }),
    enabled: tab === 'history',
  });

  const publishMut = useMutation({
    mutationFn: (id: string) => devopsService.publishRelease(id),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['devops'] }),
  });

  const stats = useMemo(() => {
    const d = dashboard.data ?? {};
    const p = (d.pipelines ?? {}) as Record<string, number>;
    const dep = (d.deployments ?? {}) as Record<string, number>;
    return {
      pipelineTotal: p.total ?? 0,
      pipelineSuccess: p.success ?? 0,
      deployTotal: dep.total ?? 0,
      deploySuccess: dep.success ?? 0,
      releases: (d.releases as number) ?? 0,
      rollbacks: (d.rollbacks as number) ?? 0,
    };
  }, [dashboard.data]);

  const pipelineColumns = [
    { key: 'name', header: 'Pipeline', render: (r: Record<string, unknown>) => fieldStr(r, 'name') },
    { key: 'pipelineType', header: 'Type', render: (r: Record<string, unknown>) => <span className="pipeline-type">{fieldStr(r, 'pipelineType')}</span> },
    { key: 'branch', header: 'Branch', render: (r: Record<string, unknown>) => fieldStr(r, 'branch') },
    { key: 'status', header: 'Status', render: (r: Record<string, unknown>) => <StatusBadge status={fieldStr(r, 'status')} /> },
    { key: 'durationMs', header: 'Duration', render: (r: Record<string, unknown>) => `${Math.round(Number(r.durationMs ?? 0) / 1000)}s` },
    { key: 'createdAt', header: 'Run At', render: (r: Record<string, unknown>) => formatDateTime(fieldStr(r, 'createdAt')) },
  ];

  const deploymentColumns = [
    { key: 'component', header: 'Component', render: (r: Record<string, unknown>) => fieldStr(r, 'component') },
    { key: 'environment', header: 'Env', render: (r: Record<string, unknown>) => fieldStr(r, 'environment') },
    { key: 'strategy', header: 'Strategy', render: (r: Record<string, unknown>) => fieldStr(r, 'strategy') },
    { key: 'version', header: 'Version', render: (r: Record<string, unknown>) => fieldStr(r, 'version') },
    { key: 'status', header: 'Status', render: (r: Record<string, unknown>) => <StatusBadge status={fieldStr(r, 'status')} /> },
    { key: 'createdAt', header: 'Deployed', render: (r: Record<string, unknown>) => formatDateTime(fieldStr(r, 'createdAt')) },
  ];

  const releaseColumns = [
    { key: 'version', header: 'Version', render: (r: Record<string, unknown>) => fieldStr(r, 'version') },
    { key: 'name', header: 'Name', render: (r: Record<string, unknown>) => fieldStr(r, 'name') },
    { key: 'branch', header: 'Branch', render: (r: Record<string, unknown>) => fieldStr(r, 'branch') },
    { key: 'isPublished', header: 'Published', render: (r: Record<string, unknown>) => fieldStr(r, 'isPublished') === 'true' ? 'Yes' : 'No' },
    { key: 'publishedAt', header: 'Published At', render: (r: Record<string, unknown>) => formatDateTime(fieldStr(r, 'publishedAt')) },
    {
      key: 'actions', header: '', render: (r: Record<string, unknown>) => (
        <CanAccess permission={['devops.manage']}>
          {fieldStr(r, 'isPublished') !== 'true' && (
            <Button size="sm" onClick={() => publishMut.mutate(fieldStr(r, 'id'))}>Publish</Button>
          )}
        </CanAccess>
      ),
    },
  ];

  const rollbackColumns = [
    { key: 'fromVersion', header: 'From', render: (r: Record<string, unknown>) => fieldStr(r, 'fromVersion') },
    { key: 'toVersion', header: 'To', render: (r: Record<string, unknown>) => fieldStr(r, 'toVersion') },
    { key: 'status', header: 'Status', render: (r: Record<string, unknown>) => <StatusBadge status={fieldStr(r, 'status')} /> },
    { key: 'reason', header: 'Reason', render: (r: Record<string, unknown>) => fieldStr(r, 'reason') },
    { key: 'createdAt', header: 'Executed', render: (r: Record<string, unknown>) => formatDateTime(fieldStr(r, 'createdAt')) },
  ];

  const historyColumns = [
    { key: 'action', header: 'Action', render: (r: Record<string, unknown>) => fieldStr(r, 'action') },
    { key: 'entityType', header: 'Entity', render: (r: Record<string, unknown>) => fieldStr(r, 'entityType') },
    { key: 'environment', header: 'Env', render: (r: Record<string, unknown>) => fieldStr(r, 'environment') },
    { key: 'createdAt', header: 'Time', render: (r: Record<string, unknown>) => formatDateTime(fieldStr(r, 'createdAt')) },
  ];

  if (dashboard.isLoading && tab === 'dashboard') return <LoadingSpinner />;

  return (
    <div className="devops-hub">
      <PageHeader
        title="DevOps & CI/CD"
        subtitle="Build history, deployments, releases, and rollback tracking for KuberOne"
      />

      <Tabs tabs={TABS} active={tab} onChange={(id) => setTab(id as TabId)} />

      {tab === 'dashboard' && (
        <>
          <div className="stat-grid mt-4">
            <StatCard label="Pipeline Runs" value={String(stats.pipelineTotal)} />
            <StatCard label="Successful Pipelines" value={String(stats.pipelineSuccess)} />
            <StatCard label="Deployments" value={String(stats.deployTotal)} />
            <StatCard label="Successful Deploys" value={String(stats.deploySuccess)} />
            <StatCard label="Releases" value={String(stats.releases)} />
            <StatCard label="Rollbacks" value={String(stats.rollbacks)} />
          </div>
          <Card title="Recent Pipelines" className="mt-4">
            <PaginatedListView
              search=""
              onSearchChange={() => {}}
              columns={pipelineColumns}
              data={(dashboard.data?.recentPipelines as Record<string, unknown>[]) ?? []}
              isLoading={false}
              onPageChange={() => {}}
              emptyTitle="No pipeline runs"
            />
          </Card>
        </>
      )}

      {tab === 'pipelines' && (
        <PaginatedListView
          search=""
          onSearchChange={() => {}}
          columns={pipelineColumns}
          data={pipelines.data?.items ?? []}
          meta={pipelines.data?.meta}
          isLoading={pipelines.isLoading}
          onPageChange={setPage}
          emptyTitle="No pipeline runs"
        />
      )}

      {tab === 'deployments' && (
        <PaginatedListView
          search=""
          onSearchChange={() => {}}
          columns={deploymentColumns}
          data={deployments.data?.items ?? []}
          meta={deployments.data?.meta}
          isLoading={deployments.isLoading}
          onPageChange={setPage}
          emptyTitle="No deployments"
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
          emptyTitle="No releases"
        />
      )}

      {tab === 'rollbacks' && (
        <PaginatedListView
          search=""
          onSearchChange={() => {}}
          columns={rollbackColumns}
          data={rollbacks.data?.items ?? []}
          meta={rollbacks.data?.meta}
          isLoading={rollbacks.isLoading}
          onPageChange={setPage}
          emptyTitle="No rollbacks"
        />
      )}

      {tab === 'history' && (
        <PaginatedListView
          search=""
          onSearchChange={() => {}}
          columns={historyColumns}
          data={history.data?.items ?? []}
          meta={history.data?.meta}
          isLoading={history.isLoading}
          onPageChange={setPage}
          emptyTitle="No audit history"
        />
      )}
    </div>
  );
}
