import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

import { DetailDrawer } from '@/components/common/DetailDrawer';
import { PaginatedListView } from '@/components/common/PaginatedListView';
import { Button, Card, Input, PageHeader, Select } from '@/components/ui';
import { StatusBadge } from '@/components/ui/Badge';
import { fieldStr, formatDateTime } from '@/lib/utils';
import { voiceAiService } from '@/services';

const LANGUAGE_OPTIONS = [
  { value: 'en', label: 'English' },
  { value: 'hi', label: 'Hindi' },
  { value: 'mr', label: 'Marathi' },
  { value: 'ta', label: 'Tamil' },
];

export function VoiceAiConsolePage() {
  const queryClient = useQueryClient();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ language: 'en', leadId: '', customerId: '', applicationId: '' });

  const sessions = useQuery({
    queryKey: ['voice-ai-sessions'],
    queryFn: () => voiceAiService.listSessions({ limit: 50 }),
  });

  const sessionDetail = useQuery({
    queryKey: ['voice-ai-session', selectedId],
    queryFn: () => voiceAiService.getSession(selectedId!),
    enabled: !!selectedId,
  });

  const createMutation = useMutation({
    mutationFn: () =>
      voiceAiService.createSession({
        language: form.language,
        leadId: form.leadId || undefined,
        customerId: form.customerId || undefined,
        applicationId: form.applicationId || undefined,
      }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['voice-ai-sessions'] });
      setShowCreate(false);
      setForm({ language: 'en', leadId: '', customerId: '', applicationId: '' });
      if (data?.id) setSelectedId(String(data.id));
    },
  });

  const endMutation = useMutation({
    mutationFn: (sessionId: string) => voiceAiService.endSession(sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['voice-ai-sessions'] });
      queryClient.invalidateQueries({ queryKey: ['voice-ai-session', selectedId] });
    },
  });

  const items = (sessions.data?.items ?? []).map((row) => ({
    ...row,
    id: String(row.entityId ?? row.id),
    status: (row.newValues as Record<string, unknown> | undefined)?.status ?? row.status ?? 'active',
    language: (row.newValues as Record<string, unknown> | undefined)?.language ?? row.language ?? 'en',
  }));

  const columns = [
    { key: 'id', header: 'Session ID', render: (r: Record<string, unknown>) => fieldStr(r, 'id').slice(0, 8) + '…' },
    { key: 'language', header: 'Language', render: (r: Record<string, unknown>) => fieldStr(r, 'language') },
    {
      key: 'status',
      header: 'Status',
      render: (r: Record<string, unknown>) => <StatusBadge status={fieldStr(r, 'status').toUpperCase()} />,
    },
    { key: 'messageCount', header: 'Messages', render: (r: Record<string, unknown>) => fieldStr(r, 'messageCount') || '0' },
    { key: 'createdAt', header: 'Started', render: (r: Record<string, unknown>) => formatDateTime(r.createdAt as string) },
  ];

  return (
    <div className="page-container">
      <PageHeader
        title="Voice AI Console"
        subtitle="Monitor and create voice assistant sessions"
        actions={
          <Button variant="primary" onClick={() => setShowCreate((v) => !v)}>
            New Session
          </Button>
        }
      />

      {showCreate && (
        <Card title="Create Voice Session" className="mb-4">
          <div className="form-grid" style={{ display: 'grid', gap: '1rem', maxWidth: 640 }}>
            <Select
              label="Language"
              options={LANGUAGE_OPTIONS}
              value={form.language}
              onChange={(e) => setForm({ ...form, language: e.target.value })}
            />
            <Input label="Lead ID (optional)" value={form.leadId} onChange={(e) => setForm({ ...form, leadId: e.target.value })} />
            <Input label="Customer ID (optional)" value={form.customerId} onChange={(e) => setForm({ ...form, customerId: e.target.value })} />
            <Input label="Application ID (optional)" value={form.applicationId} onChange={(e) => setForm({ ...form, applicationId: e.target.value })} />
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Button variant="primary" disabled={createMutation.isPending} onClick={() => createMutation.mutate()}>
                {createMutation.isPending ? 'Creating…' : 'Create Session'}
              </Button>
              <Button variant="secondary" onClick={() => setShowCreate(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </Card>
      )}

      <PaginatedListView
        search=""
        onSearchChange={() => undefined}
        isLoading={sessions.isLoading}
        data={items}
        meta={sessions.data?.meta}
        onPageChange={() => undefined}
        columns={columns}
        onRowClick={(row) => setSelectedId(String(row.id))}
        emptyTitle="No voice sessions"
        emptyDescription="Create a session to start a voice AI conversation."
      />

      <DetailDrawer
        open={!!selectedId}
        title="Voice Session"
        subtitle={selectedId ?? undefined}
        onClose={() => setSelectedId(null)}
        footer={
          sessionDetail.data?.status === 'active' ? (
            <Button
              variant="danger"
              disabled={endMutation.isPending}
              onClick={() => selectedId && endMutation.mutate(selectedId)}
            >
              End Session
            </Button>
          ) : undefined
        }
      >
        {sessionDetail.isLoading ? (
          <div className="loading-overlay">
            <div className="spinner" />
          </div>
        ) : sessionDetail.data ? (
          <div className="info-grid">
            <div>
              <div className="info-item-label">Status</div>
              <div className="info-item-value">
                <StatusBadge status={fieldStr(sessionDetail.data, 'status').toUpperCase()} />
              </div>
            </div>
            <div>
              <div className="info-item-label">Language</div>
              <div className="info-item-value">{fieldStr(sessionDetail.data, 'language')}</div>
            </div>
            <div>
              <div className="info-item-label">Messages</div>
              <div className="info-item-value">{fieldStr(sessionDetail.data, 'messageCount')}</div>
            </div>
            <div>
              <div className="info-item-label">Conversation</div>
              <div className="info-item-value">{fieldStr(sessionDetail.data, 'conversationId')}</div>
            </div>
            <div>
              <div className="info-item-label">Started</div>
              <div className="info-item-value">{formatDateTime(sessionDetail.data.createdAt as string)}</div>
            </div>
          </div>
        ) : null}
      </DetailDrawer>
    </div>
  );
}
