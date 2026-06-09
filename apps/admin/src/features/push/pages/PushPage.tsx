import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';

import { PaginatedListView } from '@/components/common/PaginatedListView';
import { CanAccess } from '@/components/guards/CanAccess';
import { Card, LoadingSpinner, PageHeader, StatCard, Tabs } from '@/components/ui';
import { StatusBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useDebounce, usePagination } from '@/hooks';
import { fieldStr, formatDateTime } from '@/lib/utils';
import { pushService } from '@/services/push.service';

type TabId = 'dashboard' | 'templates' | 'providers' | 'topics' | 'logs' | 'analytics' | 'queue' | 'preferences';

const TABS: { id: TabId; label: string }[] = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'templates', label: 'Templates' },
  { id: 'providers', label: 'Providers' },
  { id: 'topics', label: 'Topics' },
  { id: 'logs', label: 'Logs' },
  { id: 'analytics', label: 'Analytics' },
  { id: 'queue', label: 'Queue' },
  { id: 'preferences', label: 'Preferences' },
];

export function PushPage() {
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
    queryKey: ['push', 'analytics'],
    queryFn: () => pushService.analytics(),
    enabled: tab === 'dashboard' || tab === 'analytics',
  });

  const fetcher = useMemo(() => {
    switch (tab) {
      case 'templates': return pushService.templates;
      case 'providers': return pushService.providers;
      case 'topics': return pushService.topics;
      case 'logs': return pushService.logs;
      case 'queue': return pushService.queue;
      case 'preferences': return pushService.preferences;
      default: return pushService.logs;
    }
  }, [tab]);

  const listQuery = useQuery({
    queryKey: ['push', tab, params],
    queryFn: () => fetcher(params),
    enabled: !['dashboard', 'analytics'].includes(tab),
  });

  const processQueue = useMutation({
    mutationFn: () => pushService.processQueue(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['push'] }),
  });

  const columns = useMemo(() => {
    switch (tab) {
      case 'templates':
        return [
          { key: 'code', header: 'Code', render: (r: Record<string, unknown>) => fieldStr(r, 'code') },
          { key: 'name', header: 'Name', render: (r: Record<string, unknown>) => fieldStr(r, 'name') },
          { key: 'category', header: 'Category', render: (r: Record<string, unknown>) => fieldStr(r, 'category') },
          { key: 'eventType', header: 'Event', render: (r: Record<string, unknown>) => fieldStr(r, 'eventType') || '—' },
          { key: 'isActive', header: 'Active', render: (r: Record<string, unknown>) => <StatusBadge status={r.isActive ? 'APPROVED' : 'CLOSED'} /> },
        ];
      case 'providers':
        return [
          { key: 'code', header: 'Code', render: (r: Record<string, unknown>) => fieldStr(r, 'code') },
          { key: 'name', header: 'Name', render: (r: Record<string, unknown>) => fieldStr(r, 'name') },
          { key: 'providerType', header: 'Type', render: (r: Record<string, unknown>) => fieldStr(r, 'providerType') },
          { key: 'isDefault', header: 'Default', render: (r: Record<string, unknown>) => (r.isDefault ? 'Yes' : 'No') },
        ];
      case 'topics':
        return [
          { key: 'code', header: 'Code', render: (r: Record<string, unknown>) => fieldStr(r, 'code') },
          { key: 'name', header: 'Name', render: (r: Record<string, unknown>) => fieldStr(r, 'name') },
          { key: 'topicType', header: 'Type', render: (r: Record<string, unknown>) => fieldStr(r, 'topicType') },
          { key: 'appTarget', header: 'App', render: (r: Record<string, unknown>) => fieldStr(r, 'appTarget') },
        ];
      case 'logs':
        return [
          { key: 'status', header: 'Status', render: (r: Record<string, unknown>) => <StatusBadge status={fieldStr(r, 'status')} /> },
          { key: 'title', header: 'Title', render: (r: Record<string, unknown>) => fieldStr(r, 'title') || fieldStr(r.pushNotification as Record<string, unknown>, 'title') || '—' },
          { key: 'toUserId', header: 'User', render: (r: Record<string, unknown>) => fieldStr(r, 'toUserId') || '—' },
          { key: 'providerRef', header: 'Ref', render: (r: Record<string, unknown>) => fieldStr(r, 'providerRef') || '—' },
          { key: 'sentAt', header: 'Sent', render: (r: Record<string, unknown>) => (r.sentAt ? formatDateTime(r.sentAt as string) : '—') },
          { key: 'openedAt', header: 'Opened', render: (r: Record<string, unknown>) => (r.openedAt ? formatDateTime(r.openedAt as string) : '—') },
        ];
      case 'queue':
        return [
          { key: 'queueType', header: 'Type', render: (r: Record<string, unknown>) => fieldStr(r, 'queueType') },
          { key: 'priority', header: 'Priority', render: (r: Record<string, unknown>) => fieldStr(r, 'priority') },
          { key: 'status', header: 'Status', render: (r: Record<string, unknown>) => <StatusBadge status={fieldStr(r, 'status')} /> },
          { key: 'retryCount', header: 'Retries', render: (r: Record<string, unknown>) => String(r.retryCount ?? 0) },
        ];
      case 'preferences':
        return [
          { key: 'userId', header: 'User', render: (r: Record<string, unknown>) => fieldStr(r, 'userId') },
          { key: 'category', header: 'Category', render: (r: Record<string, unknown>) => fieldStr(r, 'category') || 'All' },
          { key: 'enabled', header: 'Enabled', render: (r: Record<string, unknown>) => (r.enabled ? 'Yes' : 'No') },
          { key: 'doNotDisturb', header: 'DND', render: (r: Record<string, unknown>) => (r.doNotDisturb ? 'Yes' : 'No') },
        ];
      default:
        return [];
    }
  }, [tab]);

  if (tab === 'dashboard' || tab === 'analytics') {
    if (analytics.isLoading) return <LoadingSpinner />;
    const stats = analytics.data;
    const templatePerf = (stats?.templatePerformance as Array<Record<string, unknown>>) ?? [];
    const topicPerf = (stats?.topicPerformance as Array<Record<string, unknown>>) ?? [];

    return (
      <div className="page-container">
        <PageHeader
          title={tab === 'dashboard' ? 'Push Dashboard' : 'Push Analytics'}
          subtitle="FCM push delivery for KuberOne"
          actions={
            <CanAccess permission="push.configure">
              <Button variant="secondary" size="sm" loading={processQueue.isPending} onClick={() => processQueue.mutate()}>
                Process queue
              </Button>
            </CanAccess>
          }
        />
        <Tabs tabs={TABS} active={tab} onChange={(id) => setTab(id as TabId)} />
        <div className="stat-grid">
          <StatCard label="Sent" value={Number(stats?.notificationsSent ?? 0)} />
          <StatCard label="Delivered" value={Number(stats?.notificationsDelivered ?? 0)} />
          <StatCard label="Delivery Rate" value={`${Number(stats?.deliveryRate ?? 0)}%`} />
          <StatCard label="Open Rate" value={`${Number(stats?.openRate ?? 0)}%`} />
          <StatCard label="Click Rate" value={`${Number(stats?.clickRate ?? 0)}%`} />
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
                  <div className="info-item-label">{String(t.sent)} sent · {String(t.openRate)}% open</div>
                </div>
              </div>
            ))
          )}
        </Card>
        <Card title="Topic Performance" className="mt-6">
          {topicPerf.length === 0 ? (
            <p className="text-muted">No topic analytics yet</p>
          ) : (
            topicPerf.map((t) => (
              <div key={String(t.topicCode)} className="list-row">
                <div>
                  <div className="info-item-value">{String(t.topicCode)}</div>
                  <div className="info-item-label">{String(t.sent)} sent</div>
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
      <PageHeader title="Push Platform" subtitle="FCM templates, topics, delivery logs, and preferences" />
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
        emptyDescription="Push activity will appear here as notifications are sent."
      />
    </div>
  );
}
