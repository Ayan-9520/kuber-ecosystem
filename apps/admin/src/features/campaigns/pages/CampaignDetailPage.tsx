import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { Button, Card, EmptyState, Input, LoadingSpinner, PageHeader, Select, StatCard, Tabs } from '@/components/ui';
import { fieldStr, formatDate, formatPercent } from '@/lib/utils';
import { campaignsService, notificationsService } from '@/services';

type TabId = 'overview' | 'edit' | 'analytics';

const TABS: { id: TabId; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'edit', label: 'Edit' },
  { id: 'analytics', label: 'Analytics' },
];

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
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

export function CampaignDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<TabId>('overview');
  const [form, setForm] = useState({
    name: '',
    channel: 'EMAIL',
    audience: 'LEADS',
    status: 'DRAFT',
    subject: '',
    body: '',
  });

  const campaign = useQuery({
    queryKey: ['campaigns', id],
    queryFn: () => campaignsService.getById(id!),
    enabled: !!id,
  });

  const commStats = useQuery({
    queryKey: ['communication-analytics', id],
    queryFn: () => notificationsService.analytics(),
    enabled: !!id && tab === 'analytics',
  });

  const updateMutation = useMutation({
    mutationFn: () => campaignsService.update(id!, form),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      setTab('overview');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => campaignsService.remove(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      navigate('/campaigns');
    },
  });

  if (!id) return <EmptyState title="Invalid campaign" description="Campaign ID is missing." />;

  if (campaign.isLoading) {
    return (
      <div className="page-container">
        <LoadingSpinner />
      </div>
    );
  }

  if (campaign.isError || !campaign.data) {
    return (
      <div className="page-container">
        <EmptyState title="Campaign not found" description="This campaign may have been removed." />
      </div>
    );
  }

  const c = campaign.data;
  const sent = Number(c.sent ?? 0);
  const opened = Number(c.opened ?? 0);
  const clicked = Number(c.clicked ?? 0);
  const converted = Number(c.converted ?? 0);
  const openRate = sent > 0 ? opened / sent : 0;
  const clickRate = sent > 0 ? clicked / sent : 0;
  const conversionRate = sent > 0 ? converted / sent : 0;

  const startEdit = () => {
    setForm({
      name: fieldStr(c, 'name'),
      channel: fieldStr(c, 'channel') || fieldStr(c, 'type') || 'EMAIL',
      audience: fieldStr(c, 'audience') || 'LEADS',
      status: fieldStr(c, 'status') || 'DRAFT',
      subject: fieldStr(c, 'subject'),
      body: fieldStr(c, 'body'),
    });
    setTab('edit');
  };

  return (
    <div className="page-container">
      <PageHeader
        title={fieldStr(c, 'name')}
        subtitle={fieldStr(c, 'channel') || fieldStr(c, 'type')}
        actions={
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Button variant="ghost" size="sm" onClick={() => navigate('/campaigns')}>
              <ArrowLeft size={16} /> Back
            </Button>
            <Button variant="secondary" size="sm" onClick={startEdit}>
              Edit
            </Button>
            <Button
              variant="danger"
              size="sm"
              disabled={deleteMutation.isPending}
              onClick={() => {
                if (confirm('Delete this campaign?')) deleteMutation.mutate();
              }}
            >
              Delete
            </Button>
          </div>
        }
      />

      <Tabs tabs={TABS} active={tab} onChange={(tid) => setTab(tid as TabId)} />

      {tab === 'overview' && (
        <>
          <div className="stat-grid">
            <StatCard label="Status" value={fieldStr(c, 'status')} />
            <StatCard label="Sent" value={sent.toLocaleString('en-IN')} />
            <StatCard label="Opened" value={opened.toLocaleString('en-IN')} />
            <StatCard label="Converted" value={converted.toLocaleString('en-IN')} />
          </div>
          <Card title="Campaign Details">
            <div className="info-grid">
              <div>
                <div className="info-item-label">Audience</div>
                <div className="info-item-value">{fieldStr(c, 'audience')}</div>
              </div>
              <div>
                <div className="info-item-label">Subject</div>
                <div className="info-item-value">{fieldStr(c, 'subject')}</div>
              </div>
              <div>
                <div className="info-item-label">Start Date</div>
                <div className="info-item-value">{formatDate(c.startDate as string)}</div>
              </div>
              <div>
                <div className="info-item-label">End Date</div>
                <div className="info-item-value">{formatDate(c.endDate as string)}</div>
              </div>
            </div>
            <p className="page-subtitle" style={{ marginTop: '1rem' }}>
              {fieldStr(c, 'body')}
            </p>
          </Card>
        </>
      )}

      {tab === 'edit' && (
        <Card title="Edit Campaign">
          <div className="form-grid" style={{ display: 'grid', gap: '1rem', maxWidth: 640 }}>
            <Input label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <Select label="Channel" options={CHANNEL_OPTIONS} value={form.channel} onChange={(e) => setForm({ ...form, channel: e.target.value })} />
            <Select label="Audience" options={AUDIENCE_OPTIONS} value={form.audience} onChange={(e) => setForm({ ...form, audience: e.target.value })} />
            <Select label="Status" options={STATUS_OPTIONS} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} />
            <Input label="Subject" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
            <Input label="Body" value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} />
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Button variant="primary" disabled={!form.name.trim() || updateMutation.isPending} onClick={() => updateMutation.mutate()}>
                {updateMutation.isPending ? 'Saving…' : 'Save Changes'}
              </Button>
              <Button variant="secondary" onClick={() => setTab('overview')}>
                Cancel
              </Button>
            </div>
          </div>
        </Card>
      )}

      {tab === 'analytics' && (
        <>
          <div className="stat-grid">
            <StatCard label="Open Rate" value={formatPercent(openRate * 100)} />
            <StatCard label="Click Rate" value={formatPercent(clickRate * 100)} />
            <StatCard label="Conversion Rate" value={formatPercent(conversionRate * 100)} />
            <StatCard label="Clicked" value={clicked.toLocaleString('en-IN')} />
          </div>
          <div className="grid-2">
            <Card title="Campaign Metrics">
              <div className="info-grid">
                <div>
                  <div className="info-item-label">Sent</div>
                  <div className="info-item-value">{sent.toLocaleString('en-IN')}</div>
                </div>
                <div>
                  <div className="info-item-label">Opened</div>
                  <div className="info-item-value">{opened.toLocaleString('en-IN')}</div>
                </div>
                <div>
                  <div className="info-item-label">Clicked</div>
                  <div className="info-item-value">{clicked.toLocaleString('en-IN')}</div>
                </div>
                <div>
                  <div className="info-item-label">Converted</div>
                  <div className="info-item-value">{converted.toLocaleString('en-IN')}</div>
                </div>
              </div>
            </Card>
            <Card title="Communication Stats">
              {commStats.isLoading ? (
                <p className="page-subtitle">Loading communication analytics…</p>
              ) : (
                <div className="info-grid">
                  <div>
                    <div className="info-item-label">Platform Sent</div>
                    <div className="info-item-value">{Number(commStats.data?.totalSent ?? 0).toLocaleString('en-IN')}</div>
                  </div>
                  <div>
                    <div className="info-item-label">Delivered</div>
                    <div className="info-item-value">{Number(commStats.data?.delivered ?? 0).toLocaleString('en-IN')}</div>
                  </div>
                  <div>
                    <div className="info-item-label">Platform Open Rate</div>
                    <div className="info-item-value">{formatPercent(Number(commStats.data?.openRate ?? 0) * 100)}</div>
                  </div>
                  <div>
                    <div className="info-item-label">Platform Click Rate</div>
                    <div className="info-item-value">{formatPercent(Number(commStats.data?.clickRate ?? 0) * 100)}</div>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
