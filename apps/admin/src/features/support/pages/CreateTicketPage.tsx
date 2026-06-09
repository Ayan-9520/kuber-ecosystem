import { useMutation, useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Button, Card, Input, PageHeader } from '@/components/ui';
import { TICKET_PRIORITIES } from '@/features/support/constants';
import { getApiErrorMessage } from '@/lib/utils';
import { supportService } from '@/services/support.service';

export function CreateTicketPage() {
  const navigate = useNavigate();
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [priority, setPriority] = useState('MEDIUM');
  const [customerId, setCustomerId] = useState('');

  const categories = useQuery({
    queryKey: ['ticket-categories'],
    queryFn: () => supportService.categories({ limit: 50, isActive: true }),
  });

  const create = useMutation({
    mutationFn: () =>
      supportService.createTicket({
        subject: subject.trim(),
        description: description.trim(),
        categoryId,
        priority,
        ...(customerId ? { customerId } : {}),
      }),
    onSuccess: (data) => navigate(`/support/tickets/${(data as { id: string }).id}`),
  });

  return (
    <div className="page-container">
      <PageHeader title="Create Ticket" subtitle="Open a new support ticket on behalf of a customer" />
      <Card>
        {create.error && <div className="alert alert-error">{getApiErrorMessage(create.error)}</div>}
        <Input label="Subject" value={subject} onChange={(e) => setSubject(e.target.value)} />
        <label className="form-label">Description</label>
        <textarea className="form-textarea" rows={5} value={description} onChange={(e) => setDescription(e.target.value)} />
        <label className="form-label">Category</label>
        <select className="form-select" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
          <option value="">Select category</option>
          {(categories.data?.items ?? []).map((c) => (
            <option key={String(c.id)} value={String(c.id)}>{String(c.name)}</option>
          ))}
        </select>
        <label className="form-label">Priority</label>
        <select className="form-select" value={priority} onChange={(e) => setPriority(e.target.value)}>
          {TICKET_PRIORITIES.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
        <Input label="Customer ID (optional)" value={customerId} onChange={(e) => setCustomerId(e.target.value)} />
        <Button loading={create.isPending} onClick={() => create.mutate()}>Create Ticket</Button>
      </Card>
    </div>
  );
}
