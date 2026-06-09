import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';

import { PaginatedListView } from '@/components/common/PaginatedListView';
import { CanAccess } from '@/components/guards/CanAccess';
import { Card, LoadingSpinner, PageHeader, StatCard, Tabs } from '@/components/ui';
import { StatusBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useDebounce, usePagination } from '@/hooks';
import { fieldStr, formatDateTime } from '@/lib/utils';
import { smsService } from '@/services/sms.service';

type TabId = 'dashboard' | 'templates' | 'providers' | 'logs' | 'analytics' | 'otp' | 'queue' | 'preferences';

const TABS: { id: TabId; label: string }[] = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'templates', label: 'Templates' },
  { id: 'providers', label: 'Providers' },
  { id: 'logs', label: 'Logs' },
  { id: 'analytics', label: 'Analytics' },
  { id: 'otp', label: 'OTP Analytics' },
  { id: 'queue', label: 'Queue' },
  { id: 'preferences', label: 'Preferences' },
];

export function SmsPage() {
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
    queryKey: ['sms', 'analytics'],
    queryFn: () => smsService.analytics(),
    enabled: ['dashboard', 'analytics', 'otp'].includes(tab),
  });

  const fetcher = useMemo(() => {
    switch (tab) {
      case 'templates': return smsService.templates;
      case 'providers': return smsService.providers;
      case 'logs': return smsService.logs;
      case 'queue': return smsService.queue;
      case 'preferences': return smsService.preferences;
      default: return smsService.logs;
    }
  }, [tab]);

  const listQuery = useQuery({
    queryKey: ['sms', tab, params],
    queryFn: () => fetcher(params),
    enabled: !['dashboard', 'analytics', 'otp'].includes(tab),
  });

  const processQueue = useMutation({
    mutationFn: () => smsService.processQueue(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['sms'] }),
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
          { key: 'toPhone', header: 'To', render: (r: Record<string, unknown>) => fieldStr(r, 'toPhone') || fieldStr(r.smsLog as Record<string, unknown>, 'toPhone') || '—' },
          { key: 'providerRef', header: 'Ref', render: (r: Record<string, unknown>) => fieldStr(r, 'providerRef') || '—' },
          { key: 'provider', header: 'Provider', render: (r: Record<string, unknown>) => fieldStr(r.provider as Record<string, unknown>, 'name') || '—' },
          { key: 'sentAt', header: 'Sent', render: (r: Record<string, unknown>) => formatDateTime((r.sentAt ?? r.createdAt) as string) },
          { key: 'deliveredAt', header: 'Delivered', render: (r: Record<string, unknown>) => (r.deliveredAt ? formatDateTime(r.deliveredAt as string) : '—') },
        ];
      case 'queue':
        return [
          { key: 'toPhone', header: 'To', render: (r: Record<string, unknown>) => fieldStr(r, 'toPhone') },
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

  if (['dashboard', 'analytics', 'otp'].includes(tab)) {
    if (analytics.isLoading) return <LoadingSpinner />;
    const stats = analytics.data;
    const templatePerf = (stats?.templatePerformance as Array<Record<string, unknown>>) ?? [];
    const providerPerf = (stats?.providerPerformance as Array<Record<string, unknown>>) ?? [];

    const title =
      tab === 'dashboard' ? 'SMS Dashboard' : tab === 'otp' ? 'OTP Analytics' : 'SMS Analytics';

    return (
      <div className="page-container">
        <PageHeader
          title={title}
          subtitle="Enterprise SMS delivery for KuberOne"
          actions={
            <CanAccess permission="sms.configure">
              <Button variant="secondary" size="sm" loading={processQueue.isPending} onClick={() => processQueue.mutate()}>
                Process queue
              </Button>
            </CanAccess>
          }
        />
        <Tabs tabs={TABS} active={tab} onChange={(id) => setTab(id as TabId)} />
        <div className="stat-grid">
          <StatCard label="SMS Sent" value={Number(stats?.smsSent ?? 0)} />
          <StatCard label="Delivered" value={Number(stats?.smsDelivered ?? 0)} />
          <StatCard label="Delivery Rate" value={`${Number(stats?.deliveryRate ?? 0)}%`} />
          <StatCard label="Failure Rate" value={`${Number(stats?.failureRate ?? 0)}%`} />
          {(tab === 'dashboard' || tab === 'otp') && (
            <>
              <StatCard label="OTP Sent" value={Number(stats?.otpSent ?? 0)} />
              <StatCard label="OTP Success Rate" value={`${Number(stats?.otpSuccessRate ?? 0)}%`} />
              <StatCard label="OTP Failure Rate" value={`${Number(stats?.otpFailureRate ?? 0)}%`} />
            </>
          )}
        </div>
        {tab !== 'otp' && (
          <>
            <Card title="Template Performance" className="mt-6">
              {templatePerf.length === 0 ? (
                <p className="text-muted">No template analytics yet</p>
              ) : (
                templatePerf.map((t) => (
                  <div key={String(t.templateId)} className="list-row">
                    <div>
                      <div className="info-item-value">{String(t.templateId)}</div>
                      <div className="info-item-label">
                        {String(t.sent)} sent · {String(t.deliveryRate)}% delivery rate
                      </div>
                    </div>
                  </div>
                ))
              )}
            </Card>
            <Card title="Provider Performance" className="mt-6">
              {providerPerf.length === 0 ? (
                <p className="text-muted">No provider analytics yet</p>
              ) : (
                providerPerf.map((p) => (
                  <div key={String(p.providerId)} className="list-row">
                    <div>
                      <div className="info-item-value">{String(p.providerId)}</div>
                      <div className="info-item-label">
                        {String(p.sent)} sent · {String(p.deliveryRate)}% delivery rate
                      </div>
                    </div>
                  </div>
                ))
              )}
            </Card>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="page-container">
      <PageHeader
        title="SMS Platform"
        subtitle="Templates, providers, delivery logs, and preferences"
        actions={
          tab === 'queue' ? (
            <CanAccess permission="sms.configure">
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
        emptyDescription="SMS activity will appear here as messages are sent."
      />
    </div>
  );
}
