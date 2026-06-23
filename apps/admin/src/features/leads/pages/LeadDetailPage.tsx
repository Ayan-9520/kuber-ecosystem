import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Trash2 } from 'lucide-react';
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
  Select,
  Tabs,
} from '@/components/ui';
import { CopilotLeadPanel } from '@/features/copilot';
import { LeadScoringPanel } from '@/features/leads/components/LeadScoringPanel';
import { invalidateLeadQueries } from '@/features/leads/lead-query-utils';
import { RecommendationsPanel } from '@/features/recommendations';
import { formatDate, formatDateTime, formatCurrency, getApiErrorMessage } from '@/lib/utils';
import { applicationsService, leadsService } from '@/services/index';

const LEAD_STATUS_OPTIONS = [
  { value: 'NEW', label: 'New' },
  { value: 'CONTACTED', label: 'Contacted' },
  { value: 'QUALIFIED', label: 'Qualified' },
  { value: 'DOCUMENT_PENDING', label: 'Document Pending' },
  { value: 'IN_PROCESS', label: 'In Process' },
  { value: 'APPLICATION_CREATED', label: 'Application Created' },
  { value: 'SANCTIONED', label: 'Sanctioned' },
  { value: 'DISBURSED', label: 'Disbursed' },
  { value: 'REJECTED', label: 'Rejected' },
  { value: 'LOST', label: 'Lost' },
];

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
  const queryClient = useQueryClient();
  const [tab, setTab] = useState('overview');
  const [actionError, setActionError] = useState('');
  const [statusDraft, setStatusDraft] = useState('');

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

  const linkedApplications = useQuery({
    queryKey: ['lead-applications', id],
    queryFn: () => applicationsService.list({ leadId: id!, limit: 10, sortBy: 'createdAt', sortOrder: 'desc' }),
    enabled: !!id,
  });

  const updateStatus = useMutation({
    mutationFn: (status: string) => leadsService.update(id!, { status }),
    onSuccess: () => {
      setActionError('');
      invalidateLeadQueries(queryClient, id);
    },
    onError: (err) => setActionError(getApiErrorMessage(err)),
  });

  const removeLead = useMutation({
    mutationFn: () => leadsService.remove(id!),
    onSuccess: () => {
      invalidateLeadQueries(queryClient, id);
      navigate('/leads', { replace: true });
    },
    onError: (err) => setActionError(getApiErrorMessage(err)),
  });

  const handleDelete = () => {
    const name = str(lead.data?.fullName ?? lead.data?.prospectName ?? lead.data?.leadNumber);
    if (!window.confirm(`Delete lead "${name}"? It will be removed from lists and recent activity.`)) {
      return;
    }
    setActionError('');
    removeLead.mutate();
  };

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
  const currentStatus = str(data.status);
  const effectiveStatusDraft = statusDraft || currentStatus;

  return (
    <div className="page-container">
      <PageHeader
        title={str(data.fullName ?? data.prospectName ?? data.name ?? data.leadNumber)}
        subtitle={`Lead ${str(data.leadNumber ?? data.id)}`}
        actions={
          <>
            <Button
              variant="danger"
              onClick={handleDelete}
              loading={removeLead.isPending}
              disabled={removeLead.isPending}
            >
              <Trash2 size={16} />
              Delete
            </Button>
            <Button variant="ghost" onClick={() => navigate('/leads')}>
              <ArrowLeft size={16} />
              Back
            </Button>
          </>
        }
      />

      {actionError ? <p className="form-error" style={{ marginBottom: '1rem' }}>{actionError}</p> : null}

      <div style={{ marginBottom: '1rem' }}>
        <StatusBadge status={str(data.status)} />
      </div>

      <Tabs tabs={TABS} active={tab} onChange={setTab} />

      {tab === 'overview' && (
        <div className="detail-grid">
          <Card title="Lead Information">
            <div className="info-grid">
              <InfoItem label="Phone" value={str(data.phone ?? data.prospectPhone)} />
              <InfoItem label="Email" value={str(data.email ?? data.prospectEmail)} />
              <InfoItem label="Loan Amount" value={formatCurrency((data.loanAmount ?? data.requestedAmount) as number)} />
              <InfoItem label="Product" value={str(data.productName ?? data.productId)} />
              <InfoItem label="Source" value={str(data.sourceName ?? data.sourceId)} />
              <InfoItem label="Partner" value={str(data.partnerName ?? data.partnerCode)} />
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
              <InfoItem label="Status" value={currentStatus} />
              <InfoItem label="Priority" value={str(data.priority)} />
              <InfoItem label="Follow-up Date" value={formatDate(data.nextFollowUpAt as string)} />
              <InfoItem label="Conversion" value={data.isConverted || data.convertedAt ? 'Yes' : 'No'} />
            </div>
            <div style={{ marginTop: '1rem', maxWidth: 320 }}>
              <label className="info-item-label" htmlFor="lead-status">
                Update status
              </label>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <Select
                  id="lead-status"
                  options={LEAD_STATUS_OPTIONS}
                  value={effectiveStatusDraft}
                  onChange={(e) => setStatusDraft(e.target.value)}
                />
                <Button
                  size="sm"
                  variant="secondary"
                  loading={updateStatus.isPending}
                  disabled={effectiveStatusDraft === currentStatus || updateStatus.isPending}
                  onClick={() => updateStatus.mutate(effectiveStatusDraft)}
                >
                  Save
                </Button>
              </div>
            </div>
          </Card>
          <Card title="Linked Applications">
            {(linkedApplications.data?.items.length ?? 0) === 0 ? (
              <EmptyState
                title="No application yet"
                description="When the customer applies or admin creates an application, it will appear here."
              />
            ) : (
              <DataTable
                columns={[
                  { key: 'applicationNumber', header: 'Application #', render: (r) => str(r.applicationNumber ?? r.id) },
                  { key: 'status', header: 'Status', render: (r) => <StatusBadge status={str(r.status)} /> },
                  {
                    key: 'amount',
                    header: 'Amount',
                    render: (r) => formatCurrency((r.loanAmount ?? r.requestedAmount) as number),
                  },
                ]}
                data={linkedApplications.data?.items ?? []}
                onRowClick={(row) => navigate(`/applications/${row.id}`)}
              />
            )}
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
                { key: 'createdBy', header: 'Author', render: (r) => str(r.createdByName ?? r.authorName ?? (r.author as Record<string, unknown> | undefined)?.email) },
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
                { key: 'title', header: 'Title', render: (r) => str(r.title ?? r.subject ?? r.description ?? r.activityType) },
                { key: 'outcome', header: 'Outcome', render: (r) => str(r.outcome ?? r.disposition) },
                { key: 'createdBy', header: 'By', render: (r) => str(r.performedByName ?? r.createdByName ?? (r.performedBy as Record<string, unknown> | undefined)?.email) },
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
