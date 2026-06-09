import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

import { CanAccess } from '@/components/guards/CanAccess';
import { Button, Card, Input } from '@/components/ui';
import { ESCALATION_LEVELS, TICKET_STATUSES } from '@/features/support/constants';
import { getApiErrorMessage } from '@/lib/utils';
import { supportService } from '@/services/support.service';

type Props = {
  ticketId: string;
  currentLevel?: string;
  currentStatus?: string;
};

export function TicketActionsPanel({ ticketId, currentLevel, currentStatus }: Props) {
  const queryClient = useQueryClient();
  const [assignUserId, setAssignUserId] = useState('');
  const [resolveNotes, setResolveNotes] = useState('');
  const [escalateLevel, setEscalateLevel] = useState('L2_SUPPORT');
  const [escalateReason, setEscalateReason] = useState('');
  const [newStatus, setNewStatus] = useState('');
  const [rejectReason, setRejectReason] = useState('');

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ['support'] });
    void queryClient.invalidateQueries({ queryKey: ['support-ticket', ticketId] });
    void queryClient.invalidateQueries({ queryKey: ['support-messages', ticketId] });
    void queryClient.invalidateQueries({ queryKey: ['support-timeline', ticketId] });
    void queryClient.invalidateQueries({ queryKey: ['ticket-analytics'] });
  };

  const assign = useMutation({
    mutationFn: () => supportService.assignTicket(ticketId, { assignedUserId: assignUserId }),
    onSuccess: invalidate,
  });

  const escalate = useMutation({
    mutationFn: () => supportService.escalateTicket(ticketId, { toLevel: escalateLevel, reason: escalateReason }),
    onSuccess: invalidate,
  });

  const resolve = useMutation({
    mutationFn: () => supportService.resolveTicket(ticketId, { resolutionNotes: resolveNotes }),
    onSuccess: invalidate,
  });

  const close = useMutation({
    mutationFn: () => supportService.closeTicket(ticketId, {}),
    onSuccess: invalidate,
  });

  const reject = useMutation({
    mutationFn: () => supportService.rejectTicket(ticketId, { reason: rejectReason }),
    onSuccess: invalidate,
  });

  const updateStatus = useMutation({
    mutationFn: () => supportService.updateTicket(ticketId, { status: newStatus }),
    onSuccess: invalidate,
  });

  const error =
    assign.error || escalate.error || resolve.error || close.error || reject.error || updateStatus.error;

  const closed = currentStatus === 'CLOSED' || currentStatus === 'REJECTED';

  return (
    <CanAccess permission="tickets.write">
      <Card title="Ticket Actions" className="support-actions">
        {error && <div className="alert alert-error">{getApiErrorMessage(error)}</div>}

        {!closed && (
          <>
            <Input label="Assign to User ID" value={assignUserId} onChange={(e) => setAssignUserId(e.target.value)} />
            <Button size="sm" loading={assign.isPending} disabled={!assignUserId} onClick={() => assign.mutate()}>
              Assign
            </Button>

            <label className="form-label">Update Status</label>
            <select className="form-select" value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>
              <option value="">Select status</option>
              {TICKET_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s.replace(/_/g, ' ')}
                </option>
              ))}
            </select>
            <Button size="sm" variant="secondary" loading={updateStatus.isPending} disabled={!newStatus} onClick={() => updateStatus.mutate()}>
              Update Status
            </Button>

            <label className="form-label">Escalate To</label>
            <select className="form-select" value={escalateLevel} onChange={(e) => setEscalateLevel(e.target.value)}>
              {ESCALATION_LEVELS.filter((l) => l !== currentLevel).map((l) => (
                <option key={l} value={l}>
                  {l.replace(/_/g, ' ')}
                </option>
              ))}
            </select>
            <Input label="Escalation reason" value={escalateReason} onChange={(e) => setEscalateReason(e.target.value)} />
            <Button size="sm" variant="secondary" loading={escalate.isPending} onClick={() => escalate.mutate()}>
              Escalate
            </Button>

            <Input label="Resolution notes" value={resolveNotes} onChange={(e) => setResolveNotes(e.target.value)} />
            <div className="support-actions-row">
              <Button size="sm" variant="secondary" loading={resolve.isPending} disabled={resolveNotes.length < 10} onClick={() => resolve.mutate()}>
                Resolve
              </Button>
              <Button size="sm" variant="danger" loading={close.isPending} onClick={() => close.mutate()}>
                Close
              </Button>
            </div>

            <Input label="Reject reason" value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} />
            <Button size="sm" variant="danger" loading={reject.isPending} disabled={rejectReason.length < 5} onClick={() => reject.mutate()}>
              Reject
            </Button>
          </>
        )}
      </Card>
    </CanAccess>
  );
}
