import { useQuery } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';

import { PaginatedListView } from '@/components/common/PaginatedListView';
import { Card, LoadingSpinner, PageHeader, StatCard, Tabs } from '@/components/ui';
import { StatusBadge } from '@/components/ui/Badge';
import { useDebounce, usePagination } from '@/hooks';
import { fieldStr, formatDateTime } from '@/lib/utils';
import { whatsappService } from '@/services/whatsapp.service';

type TabId = 'dashboard' | 'logs' | 'templates' | 'providers' | 'analytics';

const TABS: { id: TabId; label: string }[] = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'logs', label: 'Logs' },
  { id: 'templates', label: 'Templates' },
  { id: 'providers', label: 'Providers' },
  { id: 'analytics', label: 'Analytics' },
];

export function WhatsAppPage() {
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

  const analytics = useQuery({
    queryKey: ['whatsapp', 'analytics'],
    queryFn: () => whatsappService.analytics(),
    enabled: ['dashboard', 'analytics'].includes(tab),
  });

  const fetcher = useMemo(() => {
    switch (tab) {
      case 'templates':
        return whatsappService.templates;
      case 'providers':
        return whatsappService.providers;
      default:
        return whatsappService.logs;
    }
  }, [tab]);

  const listQuery = useQuery({
    queryKey: ['whatsapp', tab, params],
    queryFn: () => fetcher(params),
    enabled: ['logs', 'templates', 'providers'].includes(tab),
  });

  const columns = useMemo(() => {
    switch (tab) {
      case 'templates':
        return [
          { key: 'code', header: 'Code', render: (r: Record<string, unknown>) => fieldStr(r, 'code') },
          { key: 'name', header: 'Name', render: (r: Record<string, unknown>) => fieldStr(r, 'name') },
          { key: 'eventType', header: 'Event', render: (r: Record<string, unknown>) => fieldStr(r, 'eventType') || '—' },
          { key: 'isActive', header: 'Active', render: (r: Record<string, unknown>) => <StatusBadge status={r.isActive ? 'APPROVED' : 'CLOSED'} /> },
        ];
      case 'providers':
        return [
          { key: 'code', header: 'Code', render: (r: Record<string, unknown>) => fieldStr(r, 'code') },
          { key: 'name', header: 'Name', render: (r: Record<string, unknown>) => fieldStr(r, 'name') },
          { key: 'providerType', header: 'Type', render: (r: Record<string, unknown>) => fieldStr(r, 'providerType') },
          { key: 'isDefault', header: 'Default', render: (r: Record<string, unknown>) => (r.isDefault ? 'Yes' : 'No') },
          { key: 'isActive', header: 'Active', render: (r: Record<string, unknown>) => <StatusBadge status={r.isActive ? 'APPROVED' : 'CLOSED'} /> },
        ];
      default:
        return [
          { key: 'status', header: 'Status', render: (r: Record<string, unknown>) => <StatusBadge status={fieldStr(r, 'status')} /> },
          { key: 'toPhone', header: 'To', render: (r: Record<string, unknown>) => fieldStr(r, 'toPhone') || fieldStr(r, 'recipient') },
          { key: 'templateName', header: 'Template', render: (r: Record<string, unknown>) => fieldStr(r, 'templateName') || '—' },
          { key: 'sentAt', header: 'Sent', render: (r: Record<string, unknown>) => formatDateTime((r.sentAt ?? r.createdAt) as string) },
          { key: 'deliveredAt', header: 'Delivered', render: (r: Record<string, unknown>) => (r.deliveredAt ? formatDateTime(r.deliveredAt as string) : '—') },
        ];
    }
  }, [tab]);

  if (['dashboard', 'analytics'].includes(tab)) {
    if (analytics.isLoading) {
      return (
        <div className="page-container">
          <LoadingSpinner />
        </div>
      );
    }

    const channels = (analytics.data?.byChannel as Array<Record<string, unknown>>) ?? [];
    const wa = channels.find((c) => String(c.channel) === 'WHATSAPP') ?? {};

    return (
      <div className="page-container">
        <PageHeader title="WhatsApp Platform" subtitle="Meta Business API messaging for KuberOne" />
        <Tabs tabs={TABS} active={tab} onChange={(id) => setTab(id as TabId)} />
        <div className="stat-grid">
          <StatCard label="Messages Sent" value={Number(wa.sent ?? wa.total ?? 0)} />
          <StatCard label="Delivered" value={Number(wa.delivered ?? 0)} />
          <StatCard label="Delivery Rate" value={`${Number(wa.deliveryRate ?? 0)}%`} />
          <StatCard label="Failed" value={Number(wa.failed ?? 0)} />
        </div>
        {tab === 'analytics' && (
          <Card title="Channel Summary" className="mt-md">
            <pre className="page-subtitle" style={{ whiteSpace: 'pre-wrap' }}>
              {JSON.stringify(analytics.data ?? {}, null, 2)}
            </pre>
          </Card>
        )}
      </div>
    );
  }

  return (
    <div className="page-container">
      <PageHeader title="WhatsApp Platform" subtitle="Delivery logs, templates, and providers" />
      <Tabs tabs={TABS} active={tab} onChange={(id) => setTab(id as TabId)} />
      <PaginatedListView
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder={`Search ${tab}...`}
        isLoading={listQuery.isLoading}
        isError={listQuery.isError}
        onRetry={() => void listQuery.refetch()}
        data={(listQuery.data?.items ?? []) as Record<string, unknown>[]}
        meta={listQuery.data?.meta}
        onPageChange={setPage}
        columns={columns}
        emptyTitle={`No ${tab} records`}
        emptyDescription="WhatsApp activity will appear here as messages are sent."
      />
    </div>
  );
}
