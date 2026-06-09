import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

import { CanAccess } from '@/components/guards/CanAccess';
import { Button, Card, LoadingSpinner } from '@/components/ui';
import { fieldStr, formatDateTime, getApiErrorMessage } from '@/lib/utils';
import { supportService } from '@/services/support.service';

type Props = {
  ticketId: string;
  ticketStatus?: string;
};

export function TicketMessageThread({ ticketId, ticketStatus }: Props) {
  const [body, setBody] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const queryClient = useQueryClient();
  const closed = ticketStatus === 'CLOSED' || ticketStatus === 'REJECTED';

  const messages = useQuery({
    queryKey: ['support-messages', ticketId],
    queryFn: () => supportService.messages({ ticketId, limit: 100, includeInternal: true }),
    refetchInterval: 15_000,
  });

  const send = useMutation({
    mutationFn: () =>
      supportService.sendMessage({
        ticketId,
        body: body.trim(),
        messageType: isInternal ? 'INTERNAL' : 'AGENT',
        isInternal,
      }),
    onSuccess: () => {
      setBody('');
      void queryClient.invalidateQueries({ queryKey: ['support-messages', ticketId] });
      void queryClient.invalidateQueries({ queryKey: ['support-timeline', ticketId] });
    },
  });

  if (messages.isLoading) return <LoadingSpinner />;

  return (
    <Card title="Conversation" className="support-thread">
      {messages.isError && <div className="alert alert-error">{getApiErrorMessage(messages.error)}</div>}
      <div className="support-messages">
        {(messages.data?.items ?? []).length === 0 ? (
          <p className="page-subtitle">No messages yet. Start the conversation below.</p>
        ) : (
          (messages.data?.items ?? []).map((msg) => {
            const type = fieldStr(msg, 'messageType');
            const internal = Boolean(msg.isInternal);
            return (
              <div
                key={String(msg.id)}
                className={`support-message support-message-${type.toLowerCase()}${internal ? ' internal' : ''}`}
              >
                <div className="support-message-meta">
                  <span className="support-message-type">{internal ? 'Internal Note' : type}</span>
                  <span>{formatDateTime(msg.createdAt as string)}</span>
                </div>
                <p>{fieldStr(msg, 'body')}</p>
              </div>
            );
          })
        )}
      </div>
      <CanAccess permission="tickets.write">
        {!closed && (
          <div className="support-composer">
            <textarea
              className="form-textarea"
              rows={3}
              placeholder={isInternal ? 'Add internal note (not visible to customer)...' : 'Reply to customer...'}
              value={body}
              onChange={(e) => setBody(e.target.value)}
            />
            <label className="support-internal-toggle">
              <input type="checkbox" checked={isInternal} onChange={(e) => setIsInternal(e.target.checked)} />
              Internal note
            </label>
            {send.error && <div className="alert alert-error">{getApiErrorMessage(send.error)}</div>}
            <Button size="sm" loading={send.isPending} disabled={body.trim().length < 1} onClick={() => send.mutate()}>
              Send
            </Button>
          </div>
        )}
      </CanAccess>
    </Card>
  );
}
