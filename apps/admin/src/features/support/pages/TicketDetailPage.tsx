import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { CanAccess } from '@/components/guards/CanAccess';
import { Button, Card, EmptyState, LoadingSpinner, PageHeader, Tabs } from '@/components/ui';
import { StatusBadge } from '@/components/ui/Badge';
import { TicketActionsPanel } from '@/features/support/components/TicketActionsPanel';
import { TicketKnowledgePanel } from '@/features/support/components/TicketKnowledgePanel';
import { TicketMessageThread } from '@/features/support/components/TicketMessageThread';
import { TicketSlaPanel } from '@/features/support/components/TicketSlaPanel';
import { fieldStr, formatDateTime } from '@/lib/utils';
import { supportService } from '@/services/support.service';

type TabId = 'overview' | 'messages' | 'timeline' | 'attachments' | 'escalations' | 'audit';

const TABS: { id: TabId; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'messages', label: 'Messages' },
  { id: 'timeline', label: 'Timeline' },
  { id: 'attachments', label: 'Attachments' },
  { id: 'escalations', label: 'Escalations' },
  { id: 'audit', label: 'Audit' },
];

export function TicketDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<TabId>('overview');
  const [draftReply, setDraftReply] = useState('');
  const [fileName, setFileName] = useState('');

  const ticket = useQuery({
    queryKey: ['support-ticket', id],
    queryFn: () => supportService.getTicket(id!),
    enabled: !!id,
  });

  const timeline = useQuery({
    queryKey: ['support-timeline', id],
    queryFn: () => supportService.timeline(id!, { limit: 50 }),
    enabled: !!id && (tab === 'timeline' || tab === 'audit'),
  });

  const attachments = useQuery({
    queryKey: ['support-attachments', id],
    queryFn: () => supportService.attachments(id!),
    enabled: !!id && tab === 'attachments',
  });

  const escalations = useQuery({
    queryKey: ['support-ticket-escalations', id],
    queryFn: () => supportService.escalations({ ticketId: id, limit: 20 }),
    enabled: !!id && tab === 'escalations',
  });

  const addAttachment = useMutation({
    mutationFn: () =>
      supportService.addAttachment(id!, {
        fileName: fileName.trim(),
        s3Key: `support/${id}/${fileName.trim()}`,
        mimeType: 'application/octet-stream',
        fileSizeBytes: 1024,
      }),
    onSuccess: () => {
      setFileName('');
      void queryClient.invalidateQueries({ queryKey: ['support-attachments', id] });
    },
  });

  if (!id) return <EmptyState title="Invalid ticket" description="Ticket ID is missing." />;

  if (ticket.isLoading) {
    return (
      <div className="page-container">
        <LoadingSpinner />
      </div>
    );
  }

  if (ticket.isError || !ticket.data) {
    return (
      <div className="page-container">
        <EmptyState title="Ticket not found" description="This ticket may have been removed or you lack access." />
      </div>
    );
  }

  const t = ticket.data;
  const category = t.category as Record<string, unknown> | undefined;
  const customer = t.customer as Record<string, unknown> | undefined;
  const partner = t.partner as Record<string, unknown> | undefined;

  return (
    <div className="page-container support-ticket-detail">
      <PageHeader
        title={fieldStr(t, 'subject')}
        subtitle={fieldStr(t, 'ticketNumber')}
        actions={
          <Button variant="secondary" onClick={() => navigate('/support')}>
            <ArrowLeft size={16} /> Back
          </Button>
        }
      />

      <div className="support-ticket-header">
        <StatusBadge status={fieldStr(t, 'status')} />
        <StatusBadge status={fieldStr(t, 'priority')} />
        {t.slaBreached ? <span className="badge badge-danger">SLA Breached</span> : null}
      </div>

      <Tabs tabs={TABS} active={tab} onChange={(v) => setTab(v as TabId)} />

      <div className="support-ticket-layout">
        <div className="support-ticket-main">
          {tab === 'overview' && (
            <>
              <Card title="Ticket Details">
                <div className="info-grid">
                  <div><div className="info-item-label">Customer</div><div className="info-item-value">{fieldStr(customer ?? {}, 'fullName') || fieldStr(t, 'customerId')}</div></div>
                  <div><div className="info-item-label">Partner</div><div className="info-item-value">{fieldStr(partner ?? {}, 'name') || fieldStr(t, 'partnerId') || '—'}</div></div>
                  <div><div className="info-item-label">Application</div><div className="info-item-value">{fieldStr(t, 'applicationId') || '—'}</div></div>
                  <div><div className="info-item-label">Lead</div><div className="info-item-value">{fieldStr(t, 'leadId') || '—'}</div></div>
                  <div><div className="info-item-label">Category</div><div className="info-item-value">{fieldStr(category ?? {}, 'name')}</div></div>
                  <div><div className="info-item-label">Escalation</div><div className="info-item-value">{fieldStr(t, 'escalationLevel') || 'L1_SUPPORT'}</div></div>
                  <div><div className="info-item-label">Created</div><div className="info-item-value">{formatDateTime(t.createdAt as string)}</div></div>
                  <div><div className="info-item-label">Updated</div><div className="info-item-value">{formatDateTime(t.updatedAt as string)}</div></div>
                </div>
                <p className="page-subtitle mt-md">{fieldStr(t, 'description')}</p>
              </Card>
              <TicketSlaPanel ticket={t} />
            </>
          )}

          {tab === 'messages' && (
            <TicketMessageThread ticketId={id} ticketStatus={fieldStr(t, 'status')} />
          )}

          {tab === 'timeline' && (
            <Card title="Timeline">
              {(timeline.data?.items ?? []).length === 0 ? (
                <p className="page-subtitle">No timeline events.</p>
              ) : (
                <ul className="support-timeline-list">
                  {(timeline.data?.items ?? []).map((ev) => (
                    <li key={String(ev.id)}>
                      <strong>{fieldStr(ev, 'title')}</strong>
                      <p className="page-subtitle">{fieldStr(ev, 'description')}</p>
                      <span className="page-subtitle">{formatDateTime(ev.occurredAt as string)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          )}

          {tab === 'attachments' && (
            <Card title="Attachments">
              <ul className="simple-list">
                {(attachments.data ?? []).map((a) => (
                  <li key={String(a.id)}>{fieldStr(a, 'fileName')} ({fieldStr(a, 'mimeType')})</li>
                ))}
              </ul>
              <CanAccess permission="tickets.write">
                <div className="support-attach-form">
                  <input className="form-input" placeholder="File name" value={fileName} onChange={(e) => setFileName(e.target.value)} />
                  <Button size="sm" loading={addAttachment.isPending} disabled={!fileName.trim()} onClick={() => addAttachment.mutate()}>
                    Register Attachment
                  </Button>
                </div>
              </CanAccess>
            </Card>
          )}

          {tab === 'escalations' && (
            <Card title="Escalations">
              {(escalations.data?.items ?? []).map((e) => (
                <div key={String(e.id)} className="support-escalation-row">
                  {fieldStr(e, 'fromLevel')} → {fieldStr(e, 'toLevel')} — {formatDateTime(e.escalatedAt as string)}
                </div>
              ))}
            </Card>
          )}

          {tab === 'audit' && (
            <Card title="Audit Trail">
              <ul className="support-timeline-list">
                {(timeline.data?.items ?? []).map((ev) => (
                  <li key={String(ev.id)}>
                    [{fieldStr(ev, 'eventType')}] {fieldStr(ev, 'title')} — {formatDateTime(ev.occurredAt as string)}
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>

        <aside className="support-ticket-sidebar">
          <TicketActionsPanel
            ticketId={id}
            currentLevel={fieldStr(t, 'escalationLevel')}
            currentStatus={fieldStr(t, 'status')}
          />
          <TicketKnowledgePanel
            subject={fieldStr(t, 'subject')}
            description={fieldStr(t, 'description')}
            categoryName={fieldStr(category ?? {}, 'name')}
            onInsertResponse={setDraftReply}
          />
          {draftReply && (
            <Card title="Selected Response">
              <p className="page-subtitle">{draftReply}</p>
            </Card>
          )}
        </aside>
      </div>
    </div>
  );
}
