import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Mail, Megaphone, MessageCircle, Smartphone, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  Button,
  Card,
  DataTable,
  EmptyState,
  Input,
  LoadingSpinner,
  PageHeader,
  Select,
  StatCard,
  StatusBadge,
} from '@/components/ui';
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

const CHANNEL_OPTIONS = [
  { value: 'EMAIL', label: 'Email' },
  { value: 'SMS', label: 'SMS' },
  { value: 'WHATSAPP', label: 'WhatsApp' },
  { value: 'PUSH', label: 'Push' },
];

const AUDIENCE_OPTIONS = [
  { value: 'ALL_CUSTOMERS', label: 'All Customers' },
  { value: 'LEADS', label: 'Leads' },
  { value: 'DSA_PARTNERS', label: 'DSA Partners' },
  { value: 'BRANCH_CUSTOMERS', label: 'Branch Customers' },
  { value: 'CUSTOM_SEGMENT', label: 'Custom Segment' },
];

const STATUS_OPTIONS = [
  { value: 'DRAFT', label: 'Draft' },
  { value: 'SCHEDULED', label: 'Scheduled' },
  { value: 'ACTIVE', label: 'Active' },
];

export function CampaignsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({
    name: '',
    channel: 'EMAIL',
    audience: 'LEADS',
    status: 'DRAFT',
    subject: '',
    body: '',
  });

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['campaigns'],
    queryFn: () => campaignsService.list({ page: 1, limit: 50 }),
  });

  const createMutation = useMutation({
    mutationFn: () =>
      campaignsService.create({
        name: form.name,
        channel: form.channel,
        audience: form.audience,
        status: form.status,
        subject: form.subject || undefined,
        body: form.body || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      setShowCreate(false);
      setForm({ name: '', channel: 'EMAIL', audience: 'LEADS', status: 'DRAFT', subject: '', body: '' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => campaignsService.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['campaigns'] }),
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
        <EmptyState
          title="Failed to load campaigns"
          description="Check API connection or retry."
          action={
            <Button variant="secondary" onClick={() => refetch()}>
              Retry
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="page-container">
      <PageHeader
        title="Campaigns"
        subtitle="Marketing campaigns across email, SMS, and WhatsApp"
        actions={
          <Button variant="primary" onClick={() => setShowCreate((v) => !v)}>
            New Campaign
          </Button>
        }
      />

      {showCreate && (
        <Card title="Create Campaign" className="mb-4">
          <div className="form-grid" style={{ display: 'grid', gap: '1rem', maxWidth: 640 }}>
            <Input label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <Select
              label="Channel"
              options={CHANNEL_OPTIONS}
              value={form.channel}
              onChange={(e) => setForm({ ...form, channel: e.target.value })}
            />
            <Select
              label="Audience"
              options={AUDIENCE_OPTIONS}
              value={form.audience}
              onChange={(e) => setForm({ ...form, audience: e.target.value })}
            />
            <Select
              label="Status"
              options={STATUS_OPTIONS}
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
            />
            <Input label="Subject" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
            <Input label="Body" value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} />
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Button
                variant="primary"
                disabled={!form.name.trim() || createMutation.isPending}
                onClick={() => createMutation.mutate()}
              >
                {createMutation.isPending ? 'Creating…' : 'Create'}
              </Button>
              <Button variant="secondary" onClick={() => setShowCreate(false)}>
                Cancel
              </Button>
            </div>
            {createMutation.isError && (
              <p className="text-error" style={{ color: 'var(--color-danger)' }}>
                Failed to create campaign. Check permissions and try again.
              </p>
            )}
          </div>
        </Card>
      )}

      <div className="stat-grid">
        <StatCard label="Active Campaigns" value={active} icon={<Megaphone size={20} />} />
        <StatCard label="Total Sent" value={totalSent.toLocaleString('en-IN')} icon={<Mail size={20} />} />
        <StatCard label="Conversions" value={totalConverted} icon={<MessageCircle size={20} />} />
        <StatCard label="Avg Open Rate" value={formatPercent(avgOpenRate * 100)} icon={<Smartphone size={20} />} />
      </div>

      <Card title="All Campaigns">
        {items.length === 0 ? (
          <EmptyState title="No campaigns" description="Create your first campaign to get started." />
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
              {
                key: 'actions',
                header: '',
                render: (r) => (
                  <Button
                    variant="ghost"
                    size="sm"
                    aria-label="Delete campaign"
                    disabled={deleteMutation.isPending}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (window.confirm('Delete this campaign?')) deleteMutation.mutate(String(r.id));
                    }}
                  >
                    <Trash2 size={14} />
                  </Button>
                ),
              },
            ]}
            data={items}
            keyField="id"
            onRowClick={(row) => navigate(`/campaigns/${row.id}`)}
          />
        )}
      </Card>
    </div>
  );
}
