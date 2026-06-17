import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

import { PaginatedListView } from '@/components/common/PaginatedListView';
import { CanAccess } from '@/components/guards/CanAccess';
import { Button, Card, LoadingSpinner, PageHeader, StatCard, Tabs } from '@/components/ui';
import { StatusBadge } from '@/components/ui/Badge';
import { useDebounce, usePagination } from '@/hooks';
import { fieldStr, formatDateTime } from '@/lib/utils';
import { automationService } from '@/services/automation.service';

import '../automation.css';

type TabId = 'dashboard' | 'workflows' | 'builder' | 'triggers' | 'executions' | 'templates' | 'analytics' | 'logs';

const TABS: { id: TabId; label: string }[] = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'workflows', label: 'Workflows' },
  { id: 'builder', label: 'Journey Builder' },
  { id: 'triggers', label: 'Triggers' },
  { id: 'executions', label: 'Executions' },
  { id: 'templates', label: 'Templates' },
  { id: 'analytics', label: 'Analytics' },
  { id: 'logs', label: 'Logs' },
];

const JOURNEY_TYPES = [
  'LEAD_NURTURING',
  'APPLICATION_FOLLOWUP',
  'CUSTOMER_ONBOARDING',
  'REFERRAL_AUTOMATION',
  'FEEDBACK_CAMPAIGN',
  'CROSS_SELL',
  'BIRTHDAY_CAMPAIGN',
];

export function AutomationHubPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<TabId>('dashboard');
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search);
  const { page, limit, setPage, reset } = usePagination();

  useEffect(() => {
    reset();
  }, [tab, debouncedSearch, reset]);

  const params = useMemo(
    () => ({ page, limit, search: debouncedSearch || undefined, sortBy: 'createdAt', sortOrder: 'desc' }),
    [page, limit, debouncedSearch],
  );

  const dashboard = useQuery({
    queryKey: ['automation', 'dashboard'],
    queryFn: () => automationService.analyticsDashboard({ period: 'month' }),
    enabled: ['dashboard', 'analytics'].includes(tab),
  });

  const workflows = useQuery({
    queryKey: ['automation', 'workflows', params],
    queryFn: () => automationService.workflows(params),
    enabled: ['workflows', 'builder'].includes(tab),
  });

  const executions = useQuery({
    queryKey: ['automation', 'executions', params],
    queryFn: () => automationService.executions(params),
    enabled: tab === 'executions',
  });

  const triggers = useQuery({
    queryKey: ['automation', 'triggers', params],
    queryFn: () => automationService.triggers(params),
    enabled: tab === 'triggers',
  });

  const templates = useQuery({
    queryKey: ['automation', 'templates', params],
    queryFn: () => automationService.templates(params),
    enabled: tab === 'templates',
  });

  const logs = useQuery({
    queryKey: ['automation', 'logs', params],
    queryFn: () => automationService.logs(params),
    enabled: tab === 'logs',
  });

  const createWorkflow = useMutation({
    mutationFn: (journeyType: string) =>
      automationService.createWorkflow({
        name: `New ${journeyType.replace(/_/g, ' ')} Journey`,
        journeyType,
        nodes: [
          { nodeKey: 'trigger_1', type: 'TRIGGER', label: 'Entry Trigger', positionX: 80, positionY: 200, nextNodeKeys: [] },
        ],
        triggers: [{ triggerType: 'LEAD_CREATED', isActive: true }],
      }),
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: ['automation'] });
      const id = fieldStr(data as Record<string, unknown>, 'id');
      if (id) navigate(`/automation/journeys/${id}`);
    },
  });

  const useTemplate = useMutation({
    mutationFn: (id: string) => automationService.useTemplate(id),
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: ['automation'] });
      const id = fieldStr(data as Record<string, unknown>, 'id');
      if (id) navigate(`/automation/journeys/${id}`);
    },
  });

  const aiSuggest = useMutation({
    mutationFn: () => automationService.aiSuggest({ type: 'journey', journeyType: 'LEAD_NURTURING' }),
  });

  const summary = (dashboard.data?.summary ?? {}) as Record<string, unknown>;
  const channelPerf = (dashboard.data?.channelPerformance ?? {}) as Record<string, number>;
  const channelChart = Object.entries(channelPerf).map(([channel, count]) => ({ channel, count }));

  const workflowColumns = [
    { key: 'name', header: 'Workflow', render: (r: Record<string, unknown>) => fieldStr(r, 'name') },
    { key: 'journeyType', header: 'Journey', render: (r: Record<string, unknown>) => fieldStr(r, 'journeyType') },
    { key: 'status', header: 'Status', render: (r: Record<string, unknown>) => <StatusBadge status={fieldStr(r, 'status')} /> },
    { key: 'version', header: 'Ver', render: (r: Record<string, unknown>) => String(r.version ?? 1) },
    {
      key: 'actions',
      header: '',
      render: (r: Record<string, unknown>) => (
        <Button size="sm" variant="secondary" onClick={() => navigate(`/automation/journeys/${fieldStr(r, 'id')}`)}>
          Design
        </Button>
      ),
    },
  ];

  const executionColumns = [
    { key: 'workflow', header: 'Workflow', render: (r: Record<string, unknown>) => fieldStr((r.workflow as Record<string, unknown>) ?? {}, 'name') },
    { key: 'status', header: 'Status', render: (r: Record<string, unknown>) => <StatusBadge status={fieldStr(r, 'status')} /> },
    { key: 'triggerType', header: 'Trigger', render: (r: Record<string, unknown>) => fieldStr(r, 'triggerType') },
    { key: 'subjectType', header: 'Subject', render: (r: Record<string, unknown>) => `${fieldStr(r, 'subjectType')}:${fieldStr(r, 'subjectId').slice(0, 8)}` },
    { key: 'createdAt', header: 'Started', render: (r: Record<string, unknown>) => formatDateTime(r.createdAt as string) },
  ];

  const triggerColumns = [
    { key: 'triggerType', header: 'Trigger', render: (r: Record<string, unknown>) => fieldStr(r, 'triggerType') },
    { key: 'workflow', header: 'Workflow', render: (r: Record<string, unknown>) => fieldStr((r.workflow as Record<string, unknown>) ?? {}, 'name') },
    { key: 'isActive', header: 'Active', render: (r: Record<string, unknown>) => (r.isActive ? 'Yes' : 'No') },
  ];

  const templateColumns = [
    { key: 'name', header: 'Template', render: (r: Record<string, unknown>) => fieldStr(r, 'name') },
    { key: 'journeyType', header: 'Journey', render: (r: Record<string, unknown>) => fieldStr(r, 'journeyType') },
    { key: 'category', header: 'Category', render: (r: Record<string, unknown>) => fieldStr(r, 'category') || '—' },
    { key: 'usageCount', header: 'Uses', render: (r: Record<string, unknown>) => String(r.usageCount ?? 0) },
    {
      key: 'use',
      header: '',
      render: (r: Record<string, unknown>) => (
        <CanAccess permission={['automation.write']}>
          <Button size="sm" onClick={() => useTemplate.mutate(fieldStr(r, 'id'))}>
            Use Template
          </Button>
        </CanAccess>
      ),
    },
  ];

  const logColumns = [
    { key: 'level', header: 'Level', render: (r: Record<string, unknown>) => fieldStr(r, 'level') },
    { key: 'message', header: 'Message', render: (r: Record<string, unknown>) => fieldStr(r, 'message') },
    { key: 'nodeKey', header: 'Node', render: (r: Record<string, unknown>) => fieldStr(r, 'nodeKey') || '—' },
    { key: 'createdAt', header: 'Time', render: (r: Record<string, unknown>) => formatDateTime(r.createdAt as string) },
  ];

  const listConfig = useMemo(() => {
    switch (tab) {
      case 'executions':
        return { query: executions, columns: executionColumns };
      case 'triggers':
        return { query: triggers, columns: triggerColumns };
      case 'templates':
        return { query: templates, columns: templateColumns };
      case 'logs':
        return { query: logs, columns: logColumns };
      default:
        return { query: workflows, columns: workflowColumns };
    }
  }, [tab, workflows, executions, triggers, templates, logs]);

  return (
    <div>
      <PageHeader
        title="Marketing Automation"
        subtitle="Customer journey automation platform for Kuber Finserve"
        actions={
          <CanAccess permission={['automation.write']}>
            <Button variant="secondary" onClick={() => aiSuggest.mutate()} disabled={aiSuggest.isPending}>
              AI Suggestions
            </Button>
            <Button onClick={() => createWorkflow.mutate('LEAD_NURTURING')} disabled={createWorkflow.isPending}>
              New Journey
            </Button>
          </CanAccess>
        }
      />

      <Tabs tabs={TABS} active={tab} onChange={(id) => setTab(id as TabId)} />

      {tab === 'dashboard' && (
        <div style={{ marginTop: 16 }}>
          {dashboard.isLoading ? (
            <LoadingSpinner />
          ) : (
            <>
              <div className="stat-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 16 }}>
                <StatCard label="Workflow Runs" value={String(summary.totalRuns ?? 0)} />
                <StatCard label="Success Rate" value={`${summary.successRate ?? 0}%`} />
                <StatCard label="Conversion Rate" value={`${summary.conversionRate ?? 0}%`} />
                <StatCard label="Drop-off Rate" value={`${summary.dropOffRate ?? 0}%`} />
                <StatCard label="Revenue" value={`₹${summary.revenueGenerated ?? 0}`} />
                <StatCard label="ROI" value={`${summary.roi ?? 0}%`} />
              </div>
              <Card title="Channel Performance">
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={channelChart}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                    <XAxis dataKey="channel" stroke="var(--color-text-muted)" fontSize={12} />
                    <YAxis stroke="var(--color-text-muted)" fontSize={12} />
                    <Tooltip />
                    <Bar dataKey="count" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </>
          )}
        </div>
      )}

      {tab === 'builder' && (
        <Card title="Start a Journey" className="mt-md">
          <p style={{ color: 'var(--color-text-muted)', marginBottom: 12 }}>
            Select a journey type or open an existing workflow in the visual designer.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {JOURNEY_TYPES.map((jt) => (
              <Button key={jt} variant="secondary" size="sm" onClick={() => createWorkflow.mutate(jt)}>
                {jt.replace(/_/g, ' ')}
              </Button>
            ))}
          </div>
        </Card>
      )}

      {['workflows', 'builder', 'executions', 'triggers', 'templates', 'logs'].includes(tab) && (
        <div style={{ marginTop: 16 }}>
          <PaginatedListView
            search={search}
            onSearchChange={setSearch}
            searchPlaceholder="Search…"
            columns={listConfig.columns}
            data={listConfig.query.data?.items ?? []}
            meta={listConfig.query.data?.meta}
            onPageChange={setPage}
            isLoading={listConfig.query.isLoading}
            emptyTitle="No records found"
            emptyDescription="Create a journey or adjust your filters."
          />
        </div>
      )}

      {tab === 'analytics' && (
        <div style={{ marginTop: 16 }}>
          {dashboard.isLoading ? (
            <LoadingSpinner />
          ) : (
            <Card title="Journey Performance">
              <pre style={{ fontSize: '0.75rem', overflow: 'auto', color: 'var(--color-text-secondary)' }}>
                {JSON.stringify(dashboard.data?.journeyPerformance ?? [], null, 2)}
              </pre>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
