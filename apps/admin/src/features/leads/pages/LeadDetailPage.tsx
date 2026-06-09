import { useQuery } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import {
  Button,
  Card,
  DataTable,
  EmptyState,
  LoadingSpinner,
  PageHeader,
  StatusBadge,
  Tabs,
} from '@/components/ui';
import { CopilotLeadPanel } from '@/features/copilot';
import { LeadScoringPanel } from '@/features/leads/components/LeadScoringPanel';
import { RecommendationsPanel } from '@/features/recommendations';
import { formatDate, formatDateTime, formatCurrency } from '@/lib/utils';
import { leadsService } from '@/services/index';

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'recommendations', label: 'Recommendations' },
  { id: 'scoring', label: 'Lead Scoring' },
  { id: 'copilot', label: 'AI Copilot' },
  { id: 'notes', label: 'Notes' },
  { id: 'activities', label: 'Activities' },
  { id: 'followups', label: 'Follow-ups' },
  { id: 'timeline', label: 'Timeline' },
];

function str(v: unknown): string {
  if (v === null || v === undefined) return '—';
  return String(v);
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="info-item-label">{label}</div>
      <div className="info-item-value">{value}</div>
    </div>
  );
}

export function LeadDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [tab, setTab] = useState('overview');

  const lead = useQuery({
    queryKey: ['lead', id],
    queryFn: () => leadsService.getById(id!),
    enabled: !!id,
  });

  const notes = useQuery({
    queryKey: ['lead-notes', id],
    queryFn: () => leadsService.notes({ leadId: id!, page: 1, limit: 50 }),
    enabled: !!id && tab === 'notes',
  });

  const activities = useQuery({
    queryKey: ['lead-activities', id],
    queryFn: () => leadsService.activities({ leadId: id!, page: 1, limit: 50 }),
    enabled: !!id && tab === 'activities',
  });

  const followUps = useQuery({
    queryKey: ['lead-followups', id],
    queryFn: () => leadsService.followUps({ leadId: id!, page: 1, limit: 50 }),
    enabled: !!id && tab === 'followups',
  });

  const timeline = useQuery({
    queryKey: ['lead-timeline', id],
    queryFn: () => leadsService.timeline({ leadId: id!, page: 1, limit: 50 }),
    enabled: !!id && tab === 'timeline',
  });

  if (lead.isLoading) return <LoadingSpinner />;
  if (lead.isError || !lead.data) {
    return (
      <div className="page-container">
        <EmptyState title="Lead not found" description="This lead may have been removed." />
        <Button variant="secondary" onClick={() => navigate('/leads')} style={{ marginTop: '1rem' }}>
          Back to Leads
        </Button>
      </div>
    );
  }

  const data = lead.data;

  return (
    <div className="page-container">
      <PageHeader
        title={str(data.fullName ?? data.name ?? data.leadNumber)}
        subtitle={`Lead ${str(data.leadNumber ?? data.id)}`}
        actions={
          <Button variant="ghost" onClick={() => navigate('/leads')}>
            <ArrowLeft size={16} />
            Back
          </Button>
        }
      />

      <div style={{ marginBottom: '1rem' }}>
        <StatusBadge status={str(data.status)} />
      </div>

      <Tabs tabs={TABS} active={tab} onChange={setTab} />

      {tab === 'overview' && (
        <div className="detail-grid">
          <Card title="Lead Information">
            <div className="info-grid">
              <InfoItem label="Phone" value={str(data.phone)} />
              <InfoItem label="Email" value={str(data.email)} />
              <InfoItem label="Loan Amount" value={formatCurrency(data.loanAmount as number)} />
              <InfoItem label="Product" value={str(data.productName ?? data.productId)} />
              <InfoItem label="Source" value={str(data.sourceName ?? data.sourceId)} />
              <InfoItem label="Grade" value={str(data.grade)} />
              <InfoItem label="Score" value={str(data.score)} />
              <InfoItem label="Assigned To" value={str(data.assignedToName ?? data.assignedToId)} />
              <InfoItem label="Branch" value={str(data.branchName ?? data.branchId)} />
              <InfoItem label="Created" value={formatDateTime(data.createdAt as string)} />
              <InfoItem label="Updated" value={formatDateTime(data.updatedAt as string)} />
            </div>
          </Card>
          <Card title="Quick Stats">
            <div className="info-grid">
              <InfoItem label="Status" value={str(data.status)} />
              <InfoItem label="Priority" value={str(data.priority)} />
              <InfoItem label="Follow-up Date" value={formatDate(data.nextFollowUpAt as string)} />
              <InfoItem label="Conversion" value={str(data.convertedAt ? 'Yes' : 'No')} />
            </div>
          </Card>
        </div>
      )}

      {tab === 'recommendations' && id && <RecommendationsPanel entityType="LEAD" entityId={id} />}

      {tab === 'scoring' && id && <LeadScoringPanel leadId={id} />}

      {tab === 'copilot' && id && <CopilotLeadPanel leadId={id} />}

      {tab === 'notes' && (
        <Card title="Notes">
          {notes.isLoading ? (
            <LoadingSpinner />
          ) : (notes.data?.items.length ?? 0) === 0 ? (
            <EmptyState title="No notes" description="Notes added to this lead will appear here." />
          ) : (
            <DataTable
              columns={[
                { key: 'content', header: 'Note', render: (r) => str(r.content ?? r.note) },
                { key: 'createdBy', header: 'Author', render: (r) => str(r.createdByName ?? r.createdBy) },
                { key: 'createdAt', header: 'Date', render: (r) => formatDateTime(r.createdAt as string) },
              ]}
              data={notes.data?.items ?? []}
            />
          )}
        </Card>
      )}

      {tab === 'activities' && (
        <Card title="Activities">
          {activities.isLoading ? (
            <LoadingSpinner />
          ) : (activities.data?.items.length ?? 0) === 0 ? (
            <EmptyState title="No activities" description="Calls, meetings, and tasks will appear here." />
          ) : (
            <DataTable
              columns={[
                { key: 'activityType', header: 'Type', render: (r) => str(r.activityType ?? r.type) },
                { key: 'title', header: 'Title', render: (r) => str(r.title ?? r.subject) },
                { key: 'outcome', header: 'Outcome', render: (r) => str(r.outcome) },
                { key: 'createdAt', header: 'Date', render: (r) => formatDateTime(r.createdAt as string) },
              ]}
              data={activities.data?.items ?? []}
            />
          )}
        </Card>
      )}

      {tab === 'followups' && (
        <Card title="Follow-ups">
          {followUps.isLoading ? (
            <LoadingSpinner />
          ) : (followUps.data?.items.length ?? 0) === 0 ? (
            <EmptyState title="No follow-ups" description="Scheduled follow-ups will appear here." />
          ) : (
            <DataTable
              columns={[
                { key: 'scheduledAt', header: 'Scheduled', render: (r) => formatDateTime(r.scheduledAt as string) },
                { key: 'type', header: 'Type', render: (r) => str(r.type ?? r.followUpType) },
                { key: 'status', header: 'Status', render: (r) => <StatusBadge status={str(r.status)} /> },
                { key: 'notes', header: 'Notes', render: (r) => str(r.notes ?? r.description) },
              ]}
              data={followUps.data?.items ?? []}
            />
          )}
        </Card>
      )}

      {tab === 'timeline' && (
        <Card title="Timeline">
          {timeline.isLoading ? (
            <LoadingSpinner />
          ) : (timeline.data?.items.length ?? 0) === 0 ? (
            <EmptyState title="No timeline events" />
          ) : (
            <div className="timeline">
              {(timeline.data?.items ?? []).map((event) => (
                <div key={String(event.id)} className="timeline-item">
                  <div className="timeline-dot" />
                  <div className="timeline-content">
                    <div className="timeline-title">{str(event.title ?? event.eventType)}</div>
                    <div className="timeline-desc">{str(event.description)}</div>
                    <div className="timeline-time">{formatDateTime((event.occurredAt ?? event.createdAt) as string)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
