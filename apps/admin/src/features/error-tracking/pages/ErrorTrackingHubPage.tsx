import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import { PaginatedListView } from '@/components/common/PaginatedListView';
import { CanAccess } from '@/components/guards/CanAccess';
import { Button, Card, LoadingSpinner, PageHeader, StatCard, Tabs } from '@/components/ui';
import { StatusBadge } from '@/components/ui/Badge';
import { useDebounce, usePagination } from '@/hooks';
import { fieldStr, formatDateTime } from '@/lib/utils';
import { errorTrackingService } from '@/services/error-tracking.service';

import '../error-tracking.css';

type TabId = 'dashboard' | 'explorer' | 'analytics' | 'assignments' | 'alerts';

const TABS: { id: TabId; label: string }[] = [
  { id: 'dashboard', label: 'Error Dashboard' },
  { id: 'explorer', label: 'Error Explorer' },
  { id: 'analytics', label: 'Error Analytics' },
  { id: 'assignments', label: 'Assignment Board' },
  { id: 'alerts', label: 'Error Alerts' },
];

export function ErrorTrackingHubPage() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<TabId>('dashboard');
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search);
  const { page, limit, setPage, reset } = usePagination();
  const params = useMemo(() => ({ period: 'day' }), []);

  useEffect(() => { reset(); }, [tab, debouncedSearch, reset]);

  const overview = useQuery({
    queryKey: ['errors', 'analytics', params],
    queryFn: () => errorTrackingService.overview(params),
    enabled: ['dashboard', 'analytics'].includes(tab),
  });

  const groups = useQuery({
    queryKey: ['errors', 'groups', { page, limit, search: debouncedSearch }],
    queryFn: () => errorTrackingService.groups({ page, limit, search: debouncedSearch || undefined, sortOrder: 'desc' }),
    enabled: tab === 'explorer',
  });

  const assignments = useQuery({
    queryKey: ['errors', 'assignments', { page, limit }],
    queryFn: () => errorTrackingService.assignments({ page, limit }),
    enabled: tab === 'assignments',
  });

  const alerts = useQuery({
    queryKey: ['errors', 'alerts', { page, limit, search: debouncedSearch }],
    queryFn: () => errorTrackingService.alerts({ page, limit, search: debouncedSearch || undefined }),
    enabled: tab === 'alerts',
  });

  const resolveMut = useMutation({
    mutationFn: (groupId: string) => errorTrackingService.resolve({ groupId, resolutionType: 'FIXED' }),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['errors'] }),
  });

  const summary = (overview.data?.summary ?? {}) as Record<string, unknown>;

  const groupColumns = [
    { key: 'title', header: 'Error', render: (r: Record<string, unknown>) => (
      <Link to={`/errors/${fieldStr(r, 'id')}`} className="text-blue-600 hover:underline">{fieldStr(r, 'title').slice(0, 60)}</Link>
    ) },
    { key: 'source', header: 'Source', render: (r: Record<string, unknown>) => fieldStr(r, 'source') },
    { key: 'priority', header: 'Priority', render: (r: Record<string, unknown>) => <span className={`lifecycle-badge priority-${fieldStr(r, 'priority').toLowerCase()}`}>{fieldStr(r, 'priority')}</span> },
    { key: 'status', header: 'Status', render: (r: Record<string, unknown>) => <StatusBadge status={fieldStr(r, 'status')} /> },
    { key: 'occurrenceCount', header: 'Count', render: (r: Record<string, unknown>) => fieldStr(r, 'occurrenceCount') },
    { key: 'lastSeenAt', header: 'Last Seen', render: (r: Record<string, unknown>) => formatDateTime(fieldStr(r, 'lastSeenAt')) },
    {
      key: 'actions', header: '', render: (r: Record<string, unknown>) => (
        <CanAccess permission={['errors.resolve']}>
          {!['RESOLVED', 'CLOSED', 'IGNORED'].includes(fieldStr(r, 'status')) && (
            <Button size="sm" onClick={() => resolveMut.mutate(fieldStr(r, 'id'))}>Resolve</Button>
          )}
        </CanAccess>
      ),
    },
  ];

  const alertColumns = [
    { key: 'code', header: 'Code', render: (r: Record<string, unknown>) => fieldStr(r, 'code') },
    { key: 'title', header: 'Alert', render: (r: Record<string, unknown>) => fieldStr(r, 'title') },
    { key: 'severity', header: 'Severity', render: (r: Record<string, unknown>) => <StatusBadge status={fieldStr(r, 'severity')} /> },
    { key: 'status', header: 'Status', render: (r: Record<string, unknown>) => <StatusBadge status={fieldStr(r, 'status')} /> },
    { key: 'source', header: 'Source', render: (r: Record<string, unknown>) => fieldStr(r, 'source') },
    { key: 'createdAt', header: 'Time', render: (r: Record<string, unknown>) => formatDateTime(fieldStr(r, 'createdAt')) },
  ];

  const assignmentColumns = [
    { key: 'group', header: 'Error', render: (r: Record<string, unknown>) => fieldStr((r.group as Record<string, unknown>) ?? {}, 'title').slice(0, 50) },
    { key: 'assignedTo', header: 'Assignee', render: (r: Record<string, unknown>) => fieldStr((r.assignedTo as Record<string, unknown>) ?? {}, 'email') },
    { key: 'status', header: 'Status', render: (r: Record<string, unknown>) => <StatusBadge status={fieldStr(r, 'status')} /> },
    { key: 'createdAt', header: 'Assigned', render: (r: Record<string, unknown>) => formatDateTime(fieldStr(r, 'createdAt')) },
  ];

  if (overview.isLoading && tab === 'dashboard') return <LoadingSpinner />;

  return (
    <div className="error-tracking-hub">
      <PageHeader
        title="Error Tracking"
        subtitle="Centralized error tracking across backend, CRM, customer app, DSA app, AI & notifications"
      />

      <Tabs tabs={TABS} active={tab} onChange={(id) => setTab(id as TabId)} />

      {tab === 'dashboard' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
            <StatCard label="Error Coverage" value={`${fieldStr(summary, 'errorCoveragePercent')}%`} />
            <StatCard label="Tracked Types" value={fieldStr(summary, 'trackedErrorTypes')} />
            <StatCard label="MTTD Readiness" value={`${fieldStr(summary, 'mttdReadiness')}%`} />
            <StatCard label="MTTR Readiness" value={`${fieldStr(summary, 'mttrReadiness')}%`} />
            <StatCard label="Critical Open" value={fieldStr(summary, 'criticalOpen')} />
            <StatCard label="New (24h)" value={fieldStr(summary, 'newGroups')} />
            <StatCard label="Resolved (24h)" value={fieldStr(summary, 'resolved')} />
            <StatCard label="Reliability Score" value={fieldStr(summary, 'operationalReliabilityScore')} />
          </div>
        </>
      )}

      {tab === 'explorer' && (
        <PaginatedListView
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search errors by title, message, module..."
          columns={groupColumns}
          data={groups.data?.items ?? []}
          meta={groups.data?.meta}
          isLoading={groups.isLoading}
          onPageChange={setPage}
          emptyTitle="No errors found"
        />
      )}

      {tab === 'analytics' && (
        <Card title="Error Trends">
          <div className="stat-grid">
            <StatCard label="Total Events" value={fieldStr(summary, 'totalEvents')} />
            <StatCard label="Affected Users" value={fieldStr(summary, 'affectedUsers')} />
            <StatCard label="Total Groups" value={fieldStr(summary, 'totalGroups')} />
          </div>
        </Card>
      )}

      {tab === 'assignments' && (
        <PaginatedListView
          search=""
          onSearchChange={() => {}}
          columns={assignmentColumns}
          data={assignments.data?.items ?? []}
          meta={assignments.data?.meta}
          isLoading={assignments.isLoading}
          onPageChange={setPage}
          emptyTitle="No assignments"
        />
      )}

      {tab === 'alerts' && (
        <PaginatedListView
          search={search}
          onSearchChange={setSearch}
          columns={alertColumns}
          data={alerts.data?.items ?? []}
          meta={alerts.data?.meta}
          isLoading={alerts.isLoading}
          onPageChange={setPage}
          emptyTitle="No error alerts"
        />
      )}
    </div>
  );
}
