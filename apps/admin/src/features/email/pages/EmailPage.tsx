import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';

import { PaginatedListView } from '@/components/common/PaginatedListView';
import { CanAccess } from '@/components/guards/CanAccess';
import { Card, LoadingSpinner, PageHeader, StatCard, Tabs } from '@/components/ui';
import { StatusBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useDebounce, usePagination } from '@/hooks';
import { fieldStr, formatDateTime } from '@/lib/utils';
import { emailService } from '@/services/email.service';

type TabId = 'dashboard' | 'templates' | 'providers' | 'logs' | 'analytics' | 'queue' | 'preferences';

const TABS: { id: TabId; label: string }[] = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'templates', label: 'Templates' },
  { id: 'providers', label: 'Providers' },
  { id: 'logs', label: 'Logs' },
  { id: 'analytics', label: 'Analytics' },
  { id: 'queue', label: 'Queue' },
  { id: 'preferences', label: 'Preferences' },
];

export function EmailPage() {
  const [tab, setTab] = useState<TabId>('dashboard');
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search);
  const { page, limit, setPage, reset } = usePagination();
  const queryClient = useQueryClient();

  useEffect(() => {
    reset();
  }, [tab, debouncedSearch, reset]);

  const params = useMemo(
    () => ({ page, limit, search: debouncedSearch || undefined, sortBy: 'createdAt', sortOrder: 'desc' }),
    [page, limit, debouncedSearch],
  );

  const analytics = useQuery({
    queryKey: ['email', 'analytics'],
    queryFn: () => emailService.analytics(),
    enabled: tab === 'dashboard' || tab === 'analytics',
  });

  const fetcher = useMemo(() => {
    switch (tab) {
      case 'templates': return emailService.templates;
      case 'providers': return emailService.providers;
      case 'logs': return emailService.logs;
      case 'queue': return emailService.queue;
      case 'preferences': return emailService.preferences;
      default: return emailService.logs;
    }
  }, [tab]);

  const listQuery = useQuery({
    queryKey: ['email', tab, params],
    queryFn: () => fetcher(params),
    enabled: !['dashboard', 'analytics'].includes(tab),
  });

  const processQueue = useMutation({
    mutationFn: () => emailService.processQueue(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['email'] }),
  });

  const columns = useMemo(() => {
    switch (tab) {
      case 'templates':
        return [
          { key: 'code', header: 'Code', render: (r: Record<string, unknown>) => fieldStr(r, 'code') },
          { key: 'name', header: 'Name', render: (r: Record<string, unknown>) => fieldStr(r, 'name') },
          { key: 'category', header: 'Category', render: (r: Record<string, unknown>) => fieldStr(r, 'category') },
          { key: 'eventType', header: 'Event', render: (r: Record<string, unknown>) => fieldStr(r, 'eventType') || '—' },
          { key: 'locale', header: 'Locale', render: (r: Record<string, unknown>) => fieldStr(r, 'locale') },
          { key: 'version', header: 'Ver', render: (r: Record<string, unknown>) => String(r.currentVersion ?? 1) },
          { key: 'isActive', header: 'Active', render: (r: Record<string, unknown>) => <StatusBadge status={r.isActive ? 'APPROVED' : 'CLOSED'} /> },
        ];
      case 'providers':
        return [
          { key: 'code', header: 'Code', render: (r: Record<string, unknown>) => fieldStr(r, 'code') },
          { key: 'name', header: 'Name', render: (r: Record<string, unknown>) => fieldStr(r, 'name') },
          { key: 'providerType', header: 'Type', render: (r: Record<string, unknown>) => fieldStr(r, 'providerType') },
          { key: 'rateLimit', header: 'Rate/min', render: (r: Record<string, unknown>) => String(r.rateLimit ?? '—') },
          { key: 'isDefault', header: 'Default', render: (r: Record<string, unknown>) => (r.isDefault ? 'Yes' : 'No') },
          { key: 'isActive', header: 'Active', render: (r: Record<string, unknown>) => <StatusBadge status={r.isActive ? 'APPROVED' : 'CLOSED'} /> },
        ];
      case 'logs':
        return [
          { key: 'status', header: 'Status', render: (r: Record<string, unknown>) => <StatusBadge status={fieldStr(r, 'status')} /> },
          { key: 'providerRef', header: 'Ref', render: (r: Record<string, unknown>) => fieldStr(r, 'providerRef') || '—' },
          { key: 'provider', header: 'Provider', render: (r: Record<string, unknown>) => fieldStr(r.provider as Record<string, unknown>, 'name') || '—' },
          { key: 'sentAt', header: 'Sent', render: (r: Record<string, unknown>) => formatDateTime((r.sentAt ?? r.createdAt) as string) },
          { key: 'deliveredAt', header: 'Delivered', render: (r: Record<string, unknown>) => (r.deliveredAt ? formatDateTime(r.deliveredAt as string) : '—') },
          { key: 'openedAt', header: 'Opened', render: (r: Record<string, unknown>) => (r.openedAt ? formatDateTime(r.openedAt as string) : '—') },
        ];
      case 'queue':
        return [
          { key: 'toEmail', header: 'To', render: (r: Record<string, unknown>) => fieldStr(r, 'toEmail') },
          { key: 'queueType', header: 'Type', render: (r: Record<string, unknown>) => fieldStr(r, 'queueType') },
          { key: 'priority', header: 'Priority', render: (r: Record<string, unknown>) => fieldStr(r, 'priority') },
          { key: 'status', header: 'Status', render: (r: Record<string, unknown>) => <StatusBadge status={fieldStr(r, 'status')} /> },
          { key: 'retryCount', header: 'Retries', render: (r: Record<string, unknown>) => String(r.retryCount ?? 0) },
          { key: 'lastError', header: 'Error', render: (r: Record<string, unknown>) => fieldStr(r, 'lastError') || '—' },
        ];
      case 'preferences':
        return [
          { key: 'userId', header: 'User', render: (r: Record<string, unknown>) => fieldStr(r, 'userId') },
          { key: 'category', header: 'Category', render: (r: Record<string, unknown>) => fieldStr(r, 'category') || 'All' },
          { key: 'eventType', header: 'Event', render: (r: Record<string, unknown>) => fieldStr(r, 'eventType') || 'All' },
          { key: 'enabled', header: 'Enabled', render: (r: Record<string, unknown>) => (r.enabled ? 'Yes' : 'No') },
          { key: 'marketingOptIn', header: 'Marketing', render: (r: Record<string, unknown>) => (r.marketingOptIn ? 'Yes' : 'No') },
        ];
      default:
        return [];
    }
  }, [tab]);

  if (tab === 'dashboard' || tab === 'analytics') {
    if (analytics.isLoading) return <LoadingSpinner />;
    const stats = analytics.data;
    const templatePerf = (stats?.templatePerformance as Array<Record<string, unknown>>) ?? [];

    return (
      <div className="page-container">
        <PageHeader
          title={tab === 'dashboard' ? 'Email Dashboard' : 'Email Analytics'}
          subtitle="Enterprise email delivery for KuberOne"
          actions={
            <CanAccess permission="emails.configure">
              <Button variant="secondary" size="sm" loading={processQueue.isPending} onClick={() => processQueue.mutate()}>
                Process queue
              </Button>
            </CanAccess>
          }
        />
        <Tabs tabs={TABS} active={tab} onChange={(id) => setTab(id as TabId)} />
        <div className="stat-grid">
          <StatCard label="Emails Sent" value={Number(stats?.emailsSent ?? 0)} />
          <StatCard label="Delivery Rate" value={`${Number(stats?.deliveryRate ?? 0)}%`} />
          <StatCard label="Open Rate" value={`${Number(stats?.openRate ?? 0)}%`} />
          <StatCard label="Click Rate" value={`${Number(stats?.clickRate ?? 0)}%`} />
          <StatCard label="Bounce Rate" value={`${Number(stats?.bounceRate ?? 0)}%`} />
          <StatCard label="Failure Rate" value={`${Number(stats?.failureRate ?? 0)}%`} />
        </div>
        <Card title="Template Performance" className="mt-6">
          {templatePerf.length === 0 ? (
            <p className="text-muted">No template analytics yet</p>
          ) : (
            templatePerf.map((t) => (
              <div key={String(t.templateId)} className="list-row">
                <div>
                  <div className="info-item-value">{String(t.templateId)}</div>
                  <div className="info-item-label">
                    {String(t.sent)} sent · {String(t.openRate)}% open rate
                  </div>
                </div>
              </div>
            ))
          )}
        </Card>
      </div>
    );
  }

  return (
    <div className="page-container">
      <PageHeader
        title="Email Platform"
        subtitle="Templates, providers, delivery logs, and preferences"
        actions={
          tab === 'queue' ? (
            <CanAccess permission="emails.configure">
              <Button variant="secondary" size="sm" loading={processQueue.isPending} onClick={() => processQueue.mutate()}>
                Process queue
              </Button>
            </CanAccess>
          ) : undefined
        }
      />
      <Tabs tabs={TABS} active={tab} onChange={(id) => setTab(id as TabId)} />
      <PaginatedListView
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder={`Search ${tab}...`}
        isLoading={listQuery.isLoading}
        data={(listQuery.data?.items ?? []) as Record<string, unknown>[]}
        meta={listQuery.data?.meta}
        onPageChange={setPage}
        columns={columns}
        emptyTitle={`No ${tab} records`}
        emptyDescription="Email activity will appear here as messages are sent."
      />
    </div>
  );
}
