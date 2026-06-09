import { Card } from '@/components/ui';
import { fieldStr, formatDateTime } from '@/lib/utils';

type Props = {
  ticket: Record<string, unknown>;
};

function SlaRow({ label, dueAt, metAt, breached }: { label: string; dueAt?: unknown; metAt?: unknown; breached?: boolean }) {
  const due = dueAt ? formatDateTime(dueAt as string) : '—';
  const met = metAt ? formatDateTime(metAt as string) : 'Pending';
  return (
    <div className={`support-sla-row${breached ? ' breached' : ''}`}>
      <div className="support-sla-label">{label}</div>
      <div className="support-sla-due">Due: {due}</div>
      <div className="support-sla-met">Met: {met}</div>
    </div>
  );
}

export function TicketSlaPanel({ ticket }: Props) {
  const breached = Boolean(ticket.slaBreached);

  return (
    <Card title="SLA Tracking" className="support-sla-panel">
      {breached && <div className="alert alert-error">SLA breach detected on this ticket</div>}
      <SlaRow
        label="First Response"
        dueAt={ticket.responseSlaDueAt}
        metAt={ticket.firstResponseAt}
        breached={breached && !ticket.firstResponseAt}
      />
      <SlaRow
        label="Resolution"
        dueAt={ticket.resolutionSlaDueAt}
        metAt={ticket.resolvedAt}
        breached={breached}
      />
      <SlaRow label="Escalation" dueAt={ticket.escalationSlaDueAt} metAt={ticket.escalatedAt} />
      <div className="support-sla-meta">
        <span>Priority: {fieldStr(ticket, 'priority')}</span>
        <span>Level: {fieldStr(ticket, 'escalationLevel') || 'L1_SUPPORT'}</span>
      </div>
    </Card>
  );
}
