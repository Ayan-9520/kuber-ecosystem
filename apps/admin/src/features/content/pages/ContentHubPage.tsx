import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import { PaginatedListView } from '@/components/common/PaginatedListView';
import { CanAccess } from '@/components/guards/CanAccess';
import { Button, Card, LoadingSpinner, PageHeader, StatCard, Tabs } from '@/components/ui';
import { StatusBadge } from '@/components/ui/Badge';
import { useDebounce, usePagination } from '@/hooks';
import { fieldStr, formatDateTime } from '@/lib/utils';
import { contentService } from '@/services/content.service';

type TabId = 'dashboard' | 'templates' | 'history' | 'approvals' | 'analytics';

const TABS: { id: TabId; label: string }[] = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'templates', label: 'Templates' },
  { id: 'history', label: 'History' },
  { id: 'approvals', label: 'Approvals' },
  { id: 'analytics', label: 'Analytics' },
];

export function ContentHubPage() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<TabId>('dashboard');
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search);
  const { page, limit, setPage, reset } = usePagination();

  useEffect(() => {
    reset();
  }, [tab, debouncedSearch, reset]);

  const params = useMemo(
    () => ({ page, limit, search: debouncedSearch || undefined, sortBy: 'createdAt', sortOrder: 'desc' }),
    [page, limit, debouncedSearch],
  );

  const dashboard = useQuery({
    queryKey: ['content', 'dashboard'],
    queryFn: () => contentService.analyticsDashboard({ period: 'month' }),
    enabled: ['dashboard', 'analytics'].includes(tab),
  });

  const templates = useQuery({
    queryKey: ['content', 'templates', params],
    queryFn: () => contentService.templates(params),
    enabled: tab === 'templates',
  });

  const history = useQuery({
    queryKey: ['content', 'history', params],
    queryFn: () => contentService.history(params),
    enabled: tab === 'history',
  });

  const approvals = useQuery({
    queryKey: ['content', 'approvals', params],
    queryFn: () => contentService.approvals(params),
    enabled: tab === 'approvals',
  });

  const approveMut = useMutation({
    mutationFn: (id: string) => contentService.approve({ requestId: id, status: 'APPROVED' }),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['content'] }),
  });

  const publishMut = useMutation({
    mutationFn: (id: string) => contentService.publish({ requestId: id }),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['content'] }),
  });

  const summary = (dashboard.data?.summary ?? {}) as Record<string, unknown>;

  const templateColumns = [
    { key: 'code', header: 'Code', render: (r: Record<string, unknown>) => fieldStr(r, 'code') },
    { key: 'name', header: 'Name', render: (r: Record<string, unknown>) => fieldStr(r, 'name') },
    { key: 'contentType', header: 'Type', render: (r: Record<string, unknown>) => fieldStr(r, 'contentType') },
    { key: 'usageCount', header: 'Uses', render: (r: Record<string, unknown>) => String(r.usageCount ?? 0) },
  ];

  const historyColumns = [
    { key: 'contentType', header: 'Type', render: (r: Record<string, unknown>) => fieldStr(r, 'contentType') },
    { key: 'mode', header: 'Mode', render: (r: Record<string, unknown>) => fieldStr(r, 'mode') },
    { key: 'status', header: 'Status', render: (r: Record<string, unknown>) => <StatusBadge status={fieldStr(r, 'status')} /> },
    { key: 'createdAt', header: 'Created', render: (r: Record<string, unknown>) => formatDateTime(r.createdAt as string) },
  ];

  const approvalColumns = [
    { key: 'contentType', header: 'Type', render: (r: Record<string, unknown>) => fieldStr(r, 'contentType') },
    { key: 'status', header: 'Status', render: (r: Record<string, unknown>) => <StatusBadge status={fieldStr(r, 'status')} /> },
    {
      key: 'actions',
      header: '',
      render: (r: Record<string, unknown>) => (
        <CanAccess permission={['content.approve']}>
          <Button size="sm" variant="secondary" onClick={() => approveMut.mutate(fieldStr(r, 'id'))}>Approve</Button>
          <Button size="sm" onClick={() => publishMut.mutate(fieldStr(r, 'id'))}>Publish</Button>
        </CanAccess>
      ),
    },
  ];

  const listConfig = useMemo(() => {
    switch (tab) {
      case 'templates':
        return { query: templates, columns: templateColumns };
      case 'approvals':
        return { query: approvals, columns: approvalColumns };
      default:
        return { query: history, columns: historyColumns };
    }
  }, [tab, templates, history, approvals]);

  return (
    <div>
      <PageHeader
        title="Content Generation"
        subtitle="AI-powered content for marketing, sales, support, and knowledge"
        actions={
          <CanAccess permission={['content.write']}>
            <Link to="/content/studio">
              <Button>Open AI Studio</Button>
            </Link>
          </CanAccess>
        }
      />

      <Tabs tabs={TABS} active={tab} onChange={(id) => setTab(id as TabId)} />

      {tab === 'dashboard' && (
        <div style={{ marginTop: 16 }}>
          {dashboard.isLoading ? (
            <LoadingSpinner />
          ) : (
            <div className="stat-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12 }}>
              <StatCard label="Generated" value={String(summary.totalGenerated ?? 0)} />
              <StatCard label="Approval Rate" value={`${summary.approvalRate ?? 0}%`} />
              <StatCard label="Rejection Rate" value={`${summary.rejectionRate ?? 0}%`} />
              <StatCard label="Published" value={String(summary.totalPublished ?? 0)} />
              <StatCard label="Total Tokens" value={String(summary.totalTokens ?? 0)} />
              <StatCard label="Avg Gen Time" value={`${summary.avgGenerationMs ?? 0}ms`} />
            </div>
          )}
        </div>
      )}

      {['templates', 'history', 'approvals'].includes(tab) && (
        <div style={{ marginTop: 16 }}>
          <PaginatedListView
            search={search}
            onSearchChange={setSearch}
            searchPlaceholder="Search…"
            columns={listConfig.columns}
            data={listConfig.query.data?.items ?? []}
            meta={listConfig.query.data?.meta}
            onPageChange={setPage}
            isLoading={listConfig.query.isLoading}
            emptyTitle="No content records"
            emptyDescription="Generate content in AI Studio to get started."
          />
        </div>
      )}

      {tab === 'analytics' && (
        <div style={{ marginTop: 16 }}>
          {dashboard.isLoading ? (
            <LoadingSpinner />
          ) : (
            <Card title="Template Performance">
              <pre style={{ fontSize: '0.75rem', overflow: 'auto' }}>
                {JSON.stringify(dashboard.data?.templatePerformance ?? [], null, 2)}
              </pre>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
