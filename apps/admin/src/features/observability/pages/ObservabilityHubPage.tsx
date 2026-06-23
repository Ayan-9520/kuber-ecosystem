import { useQuery } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';

import { PaginatedListView } from '@/components/common/PaginatedListView';
import { Card, LoadingSpinner, PageHeader, StatCard, Tabs } from '@/components/ui';
import { StatusBadge } from '@/components/ui/Badge';
import { useDebounce, usePagination } from '@/hooks';
import { fieldStr, formatDateTime } from '@/lib/utils';
import { observabilityService } from '@/services/observability.service';

import '../observability.css';

type TabId = 'dashboard' | 'logs' | 'traces' | 'errors' | 'events' | 'ai' | 'search';

const TABS: { id: TabId; label: string }[] = [
  { id: 'dashboard', label: 'Observability Dashboard' },
  { id: 'logs', label: 'Log Explorer' },
  { id: 'traces', label: 'Trace Explorer' },
  { id: 'errors', label: 'Error Explorer' },
  { id: 'events', label: 'Business Events' },
  { id: 'ai', label: 'AI Observability' },
  { id: 'search', label: 'Global Search' },
];

export function ObservabilityHubPage() {
  const [tab, setTab] = useState<TabId>('dashboard');
  const [search, setSearch] = useState('');
  const [globalQ, setGlobalQ] = useState('');
  const debouncedSearch = useDebounce(search);
  const debouncedGlobalQ = useDebounce(globalQ);
  const { page, limit, setPage, reset } = usePagination();

  useEffect(() => { reset(); }, [tab, debouncedSearch, reset]);

  const params = useMemo(() => ({ period: 'day' }), []);

  const overview = useQuery({
    queryKey: ['observability', 'overview', params],
    queryFn: () => observabilityService.overview(params),
    enabled: tab === 'dashboard',
  });

  const ai = useQuery({
    queryKey: ['observability', 'ai', params],
    queryFn: () => observabilityService.ai(params),
    enabled: tab === 'ai' || tab === 'dashboard',
  });

  const logs = useQuery({
    queryKey: ['observability', 'logs', { page, limit, search: debouncedSearch }],
    queryFn: () => observabilityService.logs({ page, limit, search: debouncedSearch || undefined, sortOrder: 'desc' }),
    enabled: tab === 'logs',
  });

  const traces = useQuery({
    queryKey: ['observability', 'traces', { page, limit, search: debouncedSearch }],
    queryFn: () => observabilityService.traces({ page, limit, search: debouncedSearch || undefined, sortOrder: 'desc' }),
    enabled: tab === 'traces',
  });

  const errors = useQuery({
    queryKey: ['observability', 'errors', { page, limit, search: debouncedSearch }],
    queryFn: () => observabilityService.errors({ page, limit, search: debouncedSearch || undefined, sortOrder: 'desc' }),
    enabled: tab === 'errors',
  });

  const events = useQuery({
    queryKey: ['observability', 'events', { page, limit, search: debouncedSearch }],
    queryFn: () => observabilityService.events({ page, limit, search: debouncedSearch || undefined, sortOrder: 'desc' }),
    enabled: tab === 'events',
  });

  const globalSearch = useQuery({
    queryKey: ['observability', 'search', debouncedGlobalQ],
    queryFn: () => observabilityService.search({ q: debouncedGlobalQ, type: 'all', page: 1, limit: 20 }),
    enabled: tab === 'search' && debouncedGlobalQ.length >= 2,
  });

  const summary = (overview.data?.summary ?? {}) as Record<string, unknown>;
  const pillars = (summary.pillars ?? {}) as Record<string, boolean>;
  const aiData = (ai.data ?? {}) as Record<string, unknown>;

  const logColumns = [
    { key: 'level', header: 'Level', render: (r: Record<string, unknown>) => <span className={`log-level ${fieldStr(r, 'level').toLowerCase()}`}>{fieldStr(r, 'level')}</span> },
    { key: 'category', header: 'Category', render: (r: Record<string, unknown>) => fieldStr(r, 'category') },
    { key: 'module', header: 'Module', render: (r: Record<string, unknown>) => fieldStr(r, 'module') },
    { key: 'action', header: 'Action', render: (r: Record<string, unknown>) => fieldStr(r, 'action') },
    { key: 'message', header: 'Message', render: (r: Record<string, unknown>) => <span className="mono">{fieldStr(r, 'message').slice(0, 80)}</span> },
    { key: 'requestId', header: 'Request', render: (r: Record<string, unknown>) => <span className="mono">{fieldStr(r, 'requestId').slice(0, 8)}</span> },
    { key: 'traceId', header: 'Trace', render: (r: Record<string, unknown>) => <span className="mono">{fieldStr(r, 'traceId').slice(0, 8)}</span> },
    { key: 'createdAt', header: 'Time', render: (r: Record<string, unknown>) => formatDateTime(fieldStr(r, 'createdAt')) },
  ];

  const traceColumns = [
    { key: 'traceId', header: 'Trace ID', render: (r: Record<string, unknown>) => <span className="mono">{fieldStr(r, 'traceId').slice(0, 12)}</span> },
    { key: 'operation', header: 'Operation', render: (r: Record<string, unknown>) => fieldStr(r, 'operation') },
    { key: 'status', header: 'Status', render: (r: Record<string, unknown>) => <StatusBadge status={fieldStr(r, 'status')} /> },
    { key: 'durationMs', header: 'Duration', render: (r: Record<string, unknown>) => `${fieldStr(r, 'durationMs')}ms` },
    { key: 'correlationId', header: 'Correlation', render: (r: Record<string, unknown>) => <span className="mono">{fieldStr(r, 'correlationId').slice(0, 8)}</span> },
    { key: 'startedAt', header: 'Started', render: (r: Record<string, unknown>) => formatDateTime(fieldStr(r, 'startedAt')) },
  ];

  const errorColumns = [
    { key: 'source', header: 'Source', render: (r: Record<string, unknown>) => fieldStr(r, 'source') },
    { key: 'errorType', header: 'Type', render: (r: Record<string, unknown>) => fieldStr(r, 'errorType') },
    { key: 'message', header: 'Message', render: (r: Record<string, unknown>) => fieldStr(r, 'message').slice(0, 100) },
    { key: 'path', header: 'Path', render: (r: Record<string, unknown>) => fieldStr(r, 'path') },
    { key: 'statusCode', header: 'Status', render: (r: Record<string, unknown>) => fieldStr(r, 'statusCode') },
    { key: 'resolved', header: 'Resolved', render: (r: Record<string, unknown>) => <StatusBadge status={fieldStr(r, 'resolved') === 'true' ? 'RESOLVED' : 'OPEN'} /> },
    { key: 'createdAt', header: 'Time', render: (r: Record<string, unknown>) => formatDateTime(fieldStr(r, 'createdAt')) },
  ];

  const eventColumns = [
    { key: 'eventType', header: 'Type', render: (r: Record<string, unknown>) => fieldStr(r, 'eventType') },
    { key: 'eventName', header: 'Event', render: (r: Record<string, unknown>) => fieldStr(r, 'eventName') },
    { key: 'category', header: 'Category', render: (r: Record<string, unknown>) => fieldStr(r, 'category') },
    { key: 'entityType', header: 'Entity', render: (r: Record<string, unknown>) => `${fieldStr(r, 'entityType')}/${fieldStr(r, 'entityId').slice(0, 8)}` },
    { key: 'workflowId', header: 'Workflow', render: (r: Record<string, unknown>) => <span className="mono">{fieldStr(r, 'workflowId').slice(0, 8)}</span> },
    { key: 'createdAt', header: 'Time', render: (r: Record<string, unknown>) => formatDateTime(fieldStr(r, 'createdAt')) },
  ];

  if (overview.isLoading && tab === 'dashboard') return <LoadingSpinner />;

  const searchResults = (globalSearch.data?.results ?? {}) as Record<string, { items?: Record<string, unknown>[] }>;

  return (
    <div className="observability-hub">
      <PageHeader
        title="Logging & Observability"
        subtitle="Logs, metrics, traces & events across KuberOne backend, CRM, AI, notifications & infrastructure"
      />

      <Tabs tabs={TABS} active={tab} onChange={(id) => setTab(id as TabId)} />

      {tab === 'dashboard' && (
        <>
          <div className="pillar-grid">
            {Object.entries(pillars).map(([key, active]) => (
              <div key={key} className={`pillar-pill ${active ? 'active' : ''}`}>{key}: {active ? '✓' : '—'}</div>
            ))}
          </div>
          <div className="coverage-bar">
            <StatCard label="Logging Coverage" value={`${fieldStr(summary, 'loggingCoveragePercent')}%`} />
            <StatCard label="Tracing Coverage" value={`${fieldStr(summary, 'tracingCoveragePercent')}%`} />
            <StatCard label="Observability Coverage" value={`${fieldStr(summary, 'observabilityCoveragePercent')}%`} />
            <StatCard label="Visibility Score" value={fieldStr(summary, 'operationalVisibilityScore')} />
          </div>
          <div className="stat-grid mt-4">
            <StatCard label="Logs (24h)" value={fieldStr(summary, 'logs')} />
            <StatCard label="Traces (24h)" value={fieldStr(summary, 'traces')} />
            <StatCard label="Errors (24h)" value={fieldStr(summary, 'errors')} />
            <StatCard label="Business Events" value={fieldStr(summary, 'events')} />
            <StatCard label="Audit Events" value={fieldStr(summary, 'auditEvents')} />
            <StatCard label="Security Events" value={fieldStr(summary, 'securityEvents')} />
            <StatCard label="AI Requests" value={fieldStr(summary, 'aiRequests')} />
            <StatCard label="AI Failures" value={fieldStr(summary, 'aiFailures')} />
          </div>
        </>
      )}

      {tab === 'logs' && (
        <PaginatedListView
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search logs by message, action, module..."
          columns={logColumns}
          data={logs.data?.items ?? []}
          meta={logs.data?.meta}
          isLoading={logs.isLoading}
          onPageChange={setPage}
          emptyTitle="No logs found"
        />
      )}

      {tab === 'traces' && (
        <PaginatedListView
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search traces by operation or trace ID..."
          columns={traceColumns}
          data={traces.data?.items ?? []}
          meta={traces.data?.meta}
          isLoading={traces.isLoading}
          onPageChange={setPage}
          emptyTitle="No traces found"
        />
      )}

      {tab === 'errors' && (
        <PaginatedListView
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search errors..."
          columns={errorColumns}
          data={errors.data?.items ?? []}
          meta={errors.data?.meta}
          isLoading={errors.isLoading}
          onPageChange={setPage}
          emptyTitle="No errors found"
        />
      )}

      {tab === 'events' && (
        <PaginatedListView
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search business events..."
          columns={eventColumns}
          data={events.data?.items ?? []}
          meta={events.data?.meta}
          isLoading={events.isLoading}
          onPageChange={setPage}
          emptyTitle="No events found"
        />
      )}

      {tab === 'ai' && (
        <div className="stat-grid">
          <StatCard label="AI Requests" value={fieldStr(aiData, 'requests')} />
          <StatCard label="Failures" value={fieldStr(aiData, 'failures')} />
          <StatCard label="Fallback Usage" value={fieldStr(aiData, 'fallbackUsage')} />
          <StatCard label="Token Usage" value={fieldStr(aiData, 'tokenUsage')} />
          <StatCard label="Avg Latency" value={`${fieldStr(aiData, 'avgLatencyMs')}ms`} />
          <StatCard label="Cost (USD)" value={fieldStr(aiData, 'costUsd')} />
          <StatCard label="RAG Retrieval Events" value={fieldStr(aiData, 'ragRetrievalEvents')} />
        </div>
      )}

      {tab === 'search' && (
        <Card>
          <input className="input mb-4" placeholder="Global search: user, request, trace, workflow..." value={globalQ} onChange={(e) => setGlobalQ(e.target.value)} />
          {globalSearch.isLoading && <LoadingSpinner />}
          {debouncedGlobalQ.length >= 2 && !globalSearch.isLoading && (
            <div className="space-y-4">
              {(['logs', 'traces', 'errors', 'events'] as const).map((type) => {
                const items = searchResults[type]?.items ?? [];
                if (items.length === 0) return null;
                return (
                  <div key={type}>
                    <h3 className="font-semibold capitalize mb-2">{type} ({items.length})</h3>
                    <pre className="mono text-sm bg-gray-50 p-2 rounded overflow-auto max-h-48">{JSON.stringify(items.slice(0, 5), null, 2)}</pre>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
