import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';

import { PaginatedListView } from '@/components/common/PaginatedListView';
import { CanAccess } from '@/components/guards/CanAccess';
import { Button, Card, LoadingSpinner, PageHeader, StatCard, Tabs } from '@/components/ui';
import { StatusBadge } from '@/components/ui/Badge';
import { useDebounce, usePagination } from '@/hooks';
import { fieldStr, formatDateTime } from '@/lib/utils';
import { backupService } from '@/services/backup.service';

import '../backup.css';

type TabId = 'dashboard' | 'jobs' | 'history' | 'restore' | 'dr' | 'reports';

const TABS: { id: TabId; label: string }[] = [
  { id: 'dashboard', label: 'Backup Dashboard' },
  { id: 'jobs', label: 'Backup Jobs' },
  { id: 'history', label: 'Backup History' },
  { id: 'restore', label: 'Restore Center' },
  { id: 'dr', label: 'DR Dashboard' },
  { id: 'reports', label: 'Recovery Reports' },
];

export function BackupHubPage() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<TabId>('dashboard');
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search);
  const { page, limit, setPage, reset } = usePagination();
  const params = useMemo(() => ({ period: 'day' }), []);

  useEffect(() => { reset(); }, [tab, debouncedSearch, reset]);

  const overview = useQuery({
    queryKey: ['backup', 'overview', params],
    queryFn: () => backupService.overview(params),
    enabled: ['dashboard', 'reports'].includes(tab),
  });

  const dr = useQuery({
    queryKey: ['backup', 'dr'],
    queryFn: () => backupService.drOverview(),
    enabled: ['dashboard', 'dr', 'reports'].includes(tab),
  });

  const jobs = useQuery({
    queryKey: ['backup', 'jobs', { page, limit, search: debouncedSearch }],
    queryFn: () => backupService.jobs({ page, limit, search: debouncedSearch || undefined }),
    enabled: tab === 'jobs',
  });

  const history = useQuery({
    queryKey: ['backup', 'history', { page, limit }],
    queryFn: () => backupService.history({ page, limit, sortOrder: 'desc' }),
    enabled: tab === 'history',
  });

  const restores = useQuery({
    queryKey: ['backup', 'restores', { page, limit }],
    queryFn: () => backupService.restores({ page, limit }),
    enabled: tab === 'restore',
  });

  const drills = useQuery({
    queryKey: ['backup', 'drills', { page, limit }],
    queryFn: () => backupService.drDrills({ page, limit }),
    enabled: tab === 'dr',
  });

  const triggerMut = useMutation({
    mutationFn: (scope: string) => backupService.trigger({ scope, backupType: 'FULL' }),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['backup'] }),
  });

  const drillMut = useMutation({
    mutationFn: () => backupService.startDrill({ scenario: 'DATABASE_FAILURE', auditType: 'QUARTERLY_DR_DRILL' }),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['backup'] }),
  });

  const summary = (overview.data?.summary ?? {}) as Record<string, unknown>;
  const drSummary = (dr.data?.summary ?? {}) as Record<string, unknown>;

  const jobColumns = [
    { key: 'code', header: 'Code', render: (r: Record<string, unknown>) => fieldStr(r, 'code') },
    { key: 'name', header: 'Job', render: (r: Record<string, unknown>) => fieldStr(r, 'name') },
    { key: 'scope', header: 'Scope', render: (r: Record<string, unknown>) => fieldStr(r, 'scope') },
    { key: 'schedule', header: 'Schedule', render: (r: Record<string, unknown>) => fieldStr(r, 'schedule') },
    { key: 'status', header: 'Status', render: (r: Record<string, unknown>) => <StatusBadge status={fieldStr(r, 'status')} /> },
    { key: 'lastRunAt', header: 'Last Run', render: (r: Record<string, unknown>) => formatDateTime(fieldStr(r, 'lastRunAt')) },
    {
      key: 'actions', header: '', render: (r: Record<string, unknown>) => (
        <CanAccess permission={['backup.manage']}>
          <Button size="sm" onClick={() => triggerMut.mutate(fieldStr(r, 'scope'))}>Run Now</Button>
        </CanAccess>
      ),
    },
  ];

  const historyColumns = [
    { key: 'job', header: 'Job', render: (r: Record<string, unknown>) => fieldStr((r.job as Record<string, unknown>) ?? {}, 'name') },
    { key: 'scope', header: 'Scope', render: (r: Record<string, unknown>) => fieldStr(r, 'scope') },
    { key: 'status', header: 'Status', render: (r: Record<string, unknown>) => <StatusBadge status={fieldStr(r, 'status')} /> },
    { key: 'durationMs', header: 'Duration', render: (r: Record<string, unknown>) => `${fieldStr(r, 'durationMs')}ms` },
    { key: 'fileCount', header: 'Files', render: (r: Record<string, unknown>) => fieldStr(r, 'fileCount') },
    { key: 'createdAt', header: 'Time', render: (r: Record<string, unknown>) => formatDateTime(fieldStr(r, 'createdAt')) },
  ];

  const restoreColumns = [
    { key: 'scope', header: 'Scope', render: (r: Record<string, unknown>) => fieldStr(r, 'scope') },
    { key: 'targetType', header: 'Target', render: (r: Record<string, unknown>) => `${fieldStr(r, 'targetType')}/${fieldStr(r, 'targetId').slice(0, 8)}` },
    { key: 'status', header: 'Status', render: (r: Record<string, unknown>) => <StatusBadge status={fieldStr(r, 'status')} /> },
    { key: 'createdAt', header: 'Requested', render: (r: Record<string, unknown>) => formatDateTime(fieldStr(r, 'createdAt')) },
  ];

  const drillColumns = [
    { key: 'auditType', header: 'Type', render: (r: Record<string, unknown>) => fieldStr(r, 'auditType') },
    { key: 'scenario', header: 'Scenario', render: (r: Record<string, unknown>) => fieldStr(r, 'scenario') },
    { key: 'status', header: 'Status', render: (r: Record<string, unknown>) => <StatusBadge status={fieldStr(r, 'status')} /> },
    { key: 'passed', header: 'Passed', render: (r: Record<string, unknown>) => fieldStr(r, 'passed') === 'true' ? 'Yes' : 'No' },
    { key: 'rtoAchieved', header: 'RTO', render: (r: Record<string, unknown>) => `${fieldStr(r, 'rtoAchieved')}min` },
    { key: 'createdAt', header: 'Time', render: (r: Record<string, unknown>) => formatDateTime(fieldStr(r, 'createdAt')) },
  ];

  if (overview.isLoading && tab === 'dashboard') return <LoadingSpinner />;

  return (
    <div className="backup-hub">
      <PageHeader
        title="Backup & Recovery"
        subtitle="Enterprise backup, restore & disaster recovery for KuberOne platform data"
      />

      <Tabs tabs={TABS} active={tab} onChange={(id) => setTab(id as TabId)} />

      {tab === 'dashboard' && (
        <>
          <div className="rpo-rto-grid mt-4">
            <StatCard label="Backup Coverage" value={`${fieldStr(summary, 'backupCoveragePercent')}%`} />
            <StatCard label="Recovery Coverage" value={`${fieldStr(summary, 'recoveryCoveragePercent')}%`} />
            <StatCard label="RPO Target" value={`${fieldStr(summary, 'rpoTargetMinutes')} min`} />
            <StatCard label="RTO Target" value={`${fieldStr(summary, 'rtoTargetMinutes')} min`} />
            <StatCard label="DR Readiness" value={`${fieldStr(drSummary, 'drReadinessPercent')}%`} />
            <StatCard label="Resilience Score" value={fieldStr(drSummary, 'productionResilienceScore')} />
          </div>
          <div className="stat-grid mt-4">
            <StatCard label="Active Jobs" value={fieldStr(summary, 'activeJobs')} />
            <StatCard label="Executions (24h)" value={fieldStr(summary, 'executions')} />
            <StatCard label="Success Rate" value={`${fieldStr(summary, 'successRate')}%`} />
            <StatCard label="Failed (24h)" value={fieldStr(summary, 'failed')} />
          </div>
        </>
      )}

      {tab === 'jobs' && (
        <PaginatedListView search={search} onSearchChange={setSearch} columns={jobColumns} data={jobs.data?.items ?? []} meta={jobs.data?.meta} isLoading={jobs.isLoading} onPageChange={setPage} emptyTitle="No backup jobs" />
      )}

      {tab === 'history' && (
        <PaginatedListView search="" onSearchChange={() => {}} columns={historyColumns} data={history.data?.items ?? []} meta={history.data?.meta} isLoading={history.isLoading} onPageChange={setPage} emptyTitle="No backup history" />
      )}

      {tab === 'restore' && (
        <PaginatedListView search="" onSearchChange={() => {}} columns={restoreColumns} data={restores.data?.items ?? []} meta={restores.data?.meta} isLoading={restores.isLoading} onPageChange={setPage} emptyTitle="No restore requests" />
      )}

      {tab === 'dr' && (
        <>
          <div className="flex gap-2 mb-4">
            <CanAccess permission={['dr.manage']}>
              <Button onClick={() => drillMut.mutate()}>Start DR Drill</Button>
            </CanAccess>
          </div>
          <PaginatedListView search="" onSearchChange={() => {}} columns={drillColumns} data={drills.data?.items ?? []} meta={drills.data?.meta} isLoading={drills.isLoading} onPageChange={setPage} emptyTitle="No DR drills" />
        </>
      )}

      {tab === 'reports' && (
        <Card title="Recovery & Compliance Reports">
          <div className="stat-grid">
            <StatCard label="Business Continuity" value={fieldStr(drSummary, 'businessContinuityScore')} />
            <StatCard label="Successful Backups (week)" value={fieldStr(drSummary, 'successfulBackupsWeek')} />
            <StatCard label="Failed Backups (week)" value={fieldStr(drSummary, 'failedBackupsWeek')} />
            <StatCard label="DR Plans" value={fieldStr(drSummary, 'drPlans')} />
          </div>
        </Card>
      )}
    </div>
  );
}
