import { useQuery } from '@tanstack/react-query';
import { Mail, Megaphone, MessageCircle, Smartphone } from 'lucide-react';

import { Button, Card, DataTable, EmptyState, LoadingSpinner, PageHeader, StatCard, StatusBadge } from '@/components/ui';
import { formatDate, formatPercent } from '@/lib/utils';
import { campaignsService } from '@/services';

function str(v: unknown): string {
  if (v === null || v === undefined || v === '') return '—';
  return String(v);
}

const TYPE_ICONS: Record<string, typeof Mail> = {
  EMAIL: Mail,
  SMS: Smartphone,
  WHATSAPP: MessageCircle,
};

export function CampaignsPage() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['campaigns'],
    queryFn: () => campaignsService.list({ page: 1, limit: 50 }),
  });

  const items = data?.items ?? [];
  const active = items.filter((c) => c.status === 'ACTIVE').length;
  const totalSent = items.reduce((s, c) => s + Number(c.sent ?? 0), 0);
  const totalConverted = items.reduce((s, c) => s + Number(c.converted ?? 0), 0);
  const avgOpenRate =
    totalSent > 0 && items.length > 0
      ? items.reduce((s, c) => s + (Number(c.sent) ? Number(c.opened) / Number(c.sent) : 0), 0) / items.length
      : 0;

  if (isLoading) return <LoadingSpinner />;

  if (isError) {
    return (
      <div className="page-container">
        <PageHeader title="Campaigns" subtitle="Marketing campaigns across channels" />
        <EmptyState title="Failed to load campaigns" description="Check API connection or retry." action={
          <Button variant="secondary" onClick={() => refetch()}>Retry</Button>
        } />
      </div>
    );
  }

  return (
    <div className="page-container">
      <PageHeader
        title="Campaigns"
        subtitle="Marketing campaigns across email, SMS, and WhatsApp"
        actions={<Button variant="secondary" disabled title="Campaign creation via admin API coming soon">New Campaign</Button>}
      />

      <div className="stat-grid">
        <StatCard label="Active Campaigns" value={active} icon={<Megaphone size={20} />} />
        <StatCard label="Total Sent" value={totalSent.toLocaleString('en-IN')} icon={<Mail size={20} />} />
        <StatCard label="Conversions" value={totalConverted} icon={<MessageCircle size={20} />} />
        <StatCard label="Avg Open Rate" value={formatPercent(avgOpenRate * 100)} icon={<Smartphone size={20} />} />
      </div>

      <Card title="All Campaigns">
        {items.length === 0 ? (
          <EmptyState title="No campaigns" description="Campaigns will appear here once created." />
        ) : (
          <DataTable
            columns={[
              { key: 'name', header: 'Campaign' },
              {
                key: 'type',
                header: 'Channel',
                render: (r) => {
                  const Icon = TYPE_ICONS[str(r.type)] ?? Mail;
                  return (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Icon size={14} />
                      {str(r.type)}
                    </span>
                  );
                },
              },
              { key: 'audience', header: 'Audience' },
              { key: 'status', header: 'Status', render: (r) => <StatusBadge status={str(r.status)} /> },
              { key: 'sent', header: 'Sent', render: (r) => Number(r.sent).toLocaleString('en-IN') },
              { key: 'converted', header: 'Converted', render: (r) => str(r.converted) },
              { key: 'startDate', header: 'Start', render: (r) => formatDate(r.startDate as string) },
            ]}
            data={items}
            keyField="id"
          />
        )}
      </Card>
    </div>
  );
}
