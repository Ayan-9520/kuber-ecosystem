import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';

import { PaginatedListView } from '@/components/common/PaginatedListView';
import { CanAccess } from '@/components/guards/CanAccess';
import { Card, LoadingSpinner, PageHeader, StatCard, Tabs } from '@/components/ui';
import { StatusBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useDebounce, usePagination } from '@/hooks';
import { useAuth } from '@/hooks/usePermissions';
import { fieldStr, formatDateTime } from '@/lib/utils';
import { notificationsService } from '@/services';

type TabId =
  | 'center'
  | 'analytics'
  | 'templates'
  | 'providers'
  | 'delivery'
  | 'queue'
  | 'dead-letter'
  | 'preferences'
  | 'logs';

const TABS: { id: TabId; label: string }[] = [
  { id: 'center', label: 'Center' },
  { id: 'analytics', label: 'Analytics' },
  { id: 'templates', label: 'Templates' },
  { id: 'providers', label: 'Providers' },
  { id: 'delivery', label: 'Delivery' },
  { id: 'queue', label: 'Queue' },
  { id: 'dead-letter', label: 'Dead Letter' },
  { id: 'preferences', label: 'Preferences' },
  { id: 'logs', label: 'Logs' },
];

const DELIVERY_CHANNELS = [
  { id: 'emails', label: 'Email' },
  { id: 'sms', label: 'SMS' },
  { id: 'whatsapp', label: 'WhatsApp' },
  { id: 'push', label: 'Push' },
] as const;

type DeliveryChannel = (typeof DELIVERY_CHANNELS)[number]['id'];

export function NotificationsPage() {
  const [tab, setTab] = useState<TabId>('center');
  const [deliveryChannel, setDeliveryChannel] = useState<DeliveryChannel>('emails');
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search);
  const { page, limit, setPage, reset } = usePagination();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    reset();
  }, [tab, deliveryChannel, debouncedSearch, reset]);

  const params = useMemo(
    () => ({
      page,
      limit,
      search: debouncedSearch || undefined,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    }),
    [page, limit, debouncedSearch],
  );

  const fetcher = useMemo(() => {
    switch (tab) {
      case 'center':
        return notificationsService.list;
      case 'templates':
        return notificationsService.templates;
      case 'providers':
        return notificationsService.providers;
      case 'delivery':
        return notificationsService[deliveryChannel];
      case 'queue':
        return notificationsService.queue;
      case 'dead-letter':
        return notificationsService.deadLetters;
      case 'preferences':
        return notificationsService.preferences;
      case 'logs':
        return notificationsService.communicationLogs;
      default:
        return notificationsService.list;
    }
  }, [tab, deliveryChannel]);

  const listEnabled = tab !== 'analytics';

  const { data, isLoading } = useQuery({
    queryKey: ['notifications', tab, deliveryChannel, params],
    queryFn: () => fetcher(params),
    enabled: listEnabled,
  });

  const analytics = useQuery({
    queryKey: ['notifications', 'analytics'],
    queryFn: () => notificationsService.analytics(),
    enabled: tab === 'analytics',
  });

  const markRead = useMutation({
    mutationFn: (id: string) => notificationsService.markRead(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const markAllRead = useMutation({
    mutationFn: () => notificationsService.markAllRead(user?.id ?? ''),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const processQueue = useMutation({
    mutationFn: () => notificationsService.processQueue(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const resolveDeadLetter = useMutation({
    mutationFn: (id: string) => notificationsService.resolveDeadLetter(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const columns = useMemo(() => {
    switch (tab) {
      case 'center':
        return [
          { key: 'title', header: 'Title', render: (r: Record<string, unknown>) => fieldStr(r, 'title') },
          { key: 'eventType', header: 'Event', render: (r: Record<string, unknown>) => fieldStr(r, 'eventType') },
          { key: 'channel', header: 'Channel', render: (r: Record<string, unknown>) => fieldStr(r, 'channel') },
          { key: 'status', header: 'Status', render: (r: Record<string, unknown>) => <StatusBadge status={fieldStr(r, 'status')} /> },
          { key: 'createdAt', header: 'Sent', render: (r: Record<string, unknown>) => formatDateTime(r.createdAt as string) },
          {
            key: 'actions',
            header: '',
            render: (r: Record<string, unknown>) =>
              !r.readAt ? (
                <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); markRead.mutate(String(r.id)); }}>
                  Mark read
                </Button>
              ) : null,
          },
        ];
      case 'templates':
        return [
          { key: 'code', header: 'Code', render: (r: Record<string, unknown>) => fieldStr(r, 'code') },
          { key: 'name', header: 'Name', render: (r: Record<string, unknown>) => fieldStr(r, 'name') },
          { key: 'channel', header: 'Channel', render: (r: Record<string, unknown>) => fieldStr(r, 'channel') },
          { key: 'eventType', header: 'Event', render: (r: Record<string, unknown>) => fieldStr(r, 'eventType') },
          { key: 'version', header: 'Ver', render: (r: Record<string, unknown>) => String(r.version ?? 1) },
          { key: 'isActive', header: 'Status', render: (r: Record<string, unknown>) => <StatusBadge status={r.isActive ? 'APPROVED' : 'CLOSED'} /> },
        ];
      case 'providers':
        return [
          { key: 'code', header: 'Code', render: (r: Record<string, unknown>) => fieldStr(r, 'code') },
          { key: 'name', header: 'Name', render: (r: Record<string, unknown>) => fieldStr(r, 'name') },
          { key: 'channel', header: 'Channel', render: (r: Record<string, unknown>) => fieldStr(r, 'channel') },
          { key: 'providerType', header: 'Provider', render: (r: Record<string, unknown>) => fieldStr(r, 'providerType') },
          { key: 'rateLimit', header: 'Rate/min', render: (r: Record<string, unknown>) => String(r.rateLimit ?? '—') },
          { key: 'isDefault', header: 'Default', render: (r: Record<string, unknown>) => (r.isDefault ? 'Yes' : 'No') },
          { key: 'isActive', header: 'Active', render: (r: Record<string, unknown>) => <StatusBadge status={r.isActive ? 'APPROVED' : 'CLOSED'} /> },
        ];
      case 'delivery':
        return [
          { key: 'recipient', header: 'Recipient', render: (r: Record<string, unknown>) => fieldStr(r, 'toEmail') || fieldStr(r, 'toPhone') || fieldStr(r, 'userId') },
          { key: 'subject', header: 'Subject/Title', render: (r: Record<string, unknown>) => fieldStr(r, 'subject') || fieldStr(r, 'title') || fieldStr(r, 'templateName') },
          { key: 'status', header: 'Status', render: (r: Record<string, unknown>) => <StatusBadge status={fieldStr(r, 'status')} /> },
          { key: 'providerRef', header: 'Provider Ref', render: (r: Record<string, unknown>) => fieldStr(r, 'providerRef') || '—' },
          { key: 'sentAt', header: 'Sent', render: (r: Record<string, unknown>) => formatDateTime((r.sentAt ?? r.createdAt) as string) },
        ];
      case 'queue':
        return [
          { key: 'channel', header: 'Channel', render: (r: Record<string, unknown>) => fieldStr(r, 'channel') },
          { key: 'eventType', header: 'Event', render: (r: Record<string, unknown>) => fieldStr(r, 'eventType') },
          { key: 'queueType', header: 'Type', render: (r: Record<string, unknown>) => fieldStr(r, 'queueType') },
          { key: 'status', header: 'Status', render: (r: Record<string, unknown>) => <StatusBadge status={fieldStr(r, 'status')} /> },
          { key: 'retryCount', header: 'Retries', render: (r: Record<string, unknown>) => String(r.retryCount ?? 0) },
          { key: 'lastError', header: 'Error', render: (r: Record<string, unknown>) => fieldStr(r, 'lastError') || '—' },
        ];
      case 'dead-letter':
        return [
          { key: 'channel', header: 'Channel', render: (r: Record<string, unknown>) => fieldStr(r, 'channel') },
          { key: 'eventType', header: 'Event', render: (r: Record<string, unknown>) => fieldStr(r, 'eventType') },
          { key: 'errorMessage', header: 'Error', render: (r: Record<string, unknown>) => fieldStr(r, 'errorMessage') },
          { key: 'retryCount', header: 'Retries', render: (r: Record<string, unknown>) => String(r.retryCount ?? 0) },
          { key: 'createdAt', header: 'Failed At', render: (r: Record<string, unknown>) => formatDateTime(r.createdAt as string) },
          {
            key: 'actions',
            header: '',
            render: (r: Record<string, unknown>) =>
              !r.resolvedAt ? (
                <CanAccess permission="notifications.configure">
                  <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); resolveDeadLetter.mutate(String(r.id)); }}>
                    Resolve
                  </Button>
                </CanAccess>
              ) : (
                'Resolved'
              ),
          },
        ];
      case 'preferences':
        return [
          { key: 'userId', header: 'User', render: (r: Record<string, unknown>) => fieldStr(r, 'userId') },
          { key: 'eventType', header: 'Event', render: (r: Record<string, unknown>) => fieldStr(r, 'eventType') },
          { key: 'channel', header: 'Channel', render: (r: Record<string, unknown>) => fieldStr(r, 'channel') },
          { key: 'enabled', header: 'Enabled', render: (r: Record<string, unknown>) => (r.enabled ? 'Yes' : 'No') },
        ];
      case 'logs':
        return [
          { key: 'channel', header: 'Channel', render: (r: Record<string, unknown>) => fieldStr(r, 'channel') },
          { key: 'recipientAddress', header: 'Recipient', render: (r: Record<string, unknown>) => fieldStr(r, 'recipientAddress') },
          { key: 'status', header: 'Status', render: (r: Record<string, unknown>) => <StatusBadge status={fieldStr(r, 'status')} /> },
          { key: 'providerRef', header: 'Ref', render: (r: Record<string, unknown>) => fieldStr(r, 'providerRef') || '—' },
          { key: 'createdAt', header: 'Timestamp', render: (r: Record<string, unknown>) => formatDateTime(r.createdAt as string) },
        ];
      default:
        return [];
    }
  }, [tab, markRead, resolveDeadLetter]);

  const emptyTitles: Record<TabId, string> = {
    center: 'No notifications',
    analytics: 'No analytics data',
    templates: 'No templates found',
    providers: 'No providers configured',
    delivery: 'No delivery records',
    queue: 'Queue is empty',
    'dead-letter': 'No dead letter items',
    preferences: 'No preferences configured',
    logs: 'No communication logs',
  };

  if (tab === 'analytics') {
    if (analytics.isLoading) return <LoadingSpinner />;
    const stats = analytics.data;
    const channelPerf = (stats?.channelPerformance as Array<Record<string, unknown>>) ?? [];

    return (
      <div className="page-container">
        <PageHeader title="Notification Analytics" subtitle="Delivery, open, and failure rates across all channels" />
        <Tabs tabs={TABS} active={tab} onChange={(id) => setTab(id as TabId)} />
        <div className="stat-grid">
          <StatCard label="Messages Sent" value={Number(stats?.messagesSent ?? 0)} />
          <StatCard label="Delivery Rate" value={`${Number(stats?.deliveryRate ?? 0)}%`} />
          <StatCard label="Open Rate" value={`${Number(stats?.openRate ?? 0)}%`} />
          <StatCard label="Click Rate" value={`${Number(stats?.clickRate ?? 0)}%`} />
          <StatCard label="Failure Rate" value={`${Number(stats?.failureRate ?? 0)}%`} />
          <StatCard label="Failed Count" value={Number(stats?.failedCount ?? 0)} />
        </div>
        <Card title="Channel Performance" className="mt-6">
          {channelPerf.length === 0 ? (
            <p className="text-muted">No channel data yet</p>
          ) : (
            <div className="info-grid">
              {channelPerf.map((c) => (
                <div key={String(c.channel)} className="list-row">
                  <div>
                    <div className="info-item-value">{String(c.channel)}</div>
                    <div className="info-item-label">
                      {String(c.sent)}/{String(c.total)} sent · {String(c.deliveryRate)}% delivery · {String(c.failureRate)}% failed
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    );
  }

  return (
    <div className="page-container">
      <PageHeader
        title="Notifications"
        subtitle="Multi-channel delivery: WhatsApp, Email, SMS, Push"
        actions={
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {tab === 'center' && (
              <CanAccess permission="notifications.write">
                <Button variant="secondary" size="sm" loading={markAllRead.isPending} onClick={() => markAllRead.mutate()}>
                  Mark all read
                </Button>
              </CanAccess>
            )}
            {tab === 'queue' && (
              <CanAccess permission="notifications.configure">
                <Button variant="secondary" size="sm" loading={processQueue.isPending} onClick={() => processQueue.mutate()}>
                  Process queue
                </Button>
              </CanAccess>
            )}
          </div>
        }
      />

      <Tabs tabs={TABS} active={tab} onChange={(id) => setTab(id as TabId)} />

      {tab === 'delivery' && (
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
          {DELIVERY_CHANNELS.map((ch) => (
            <Button
              key={ch.id}
              variant={deliveryChannel === ch.id ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setDeliveryChannel(ch.id)}
            >
              {ch.label}
            </Button>
          ))}
        </div>
      )}

      <PaginatedListView
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder={`Search ${tab}...`}
        isLoading={isLoading}
        data={(data?.items ?? []) as Record<string, unknown>[]}
        meta={data?.meta}
        onPageChange={setPage}
        columns={columns}
        emptyTitle={emptyTitles[tab]}
        emptyDescription="Notification activity will appear here as events are triggered."
      />
    </div>
  );
}
