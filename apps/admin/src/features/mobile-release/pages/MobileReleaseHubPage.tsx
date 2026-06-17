import { useQuery } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';

import { PaginatedListView } from '@/components/common/PaginatedListView';
import { Card, LoadingSpinner, PageHeader, StatCard, Tabs } from '@/components/ui';
import { StatusBadge } from '@/components/ui/Badge';
import { usePagination } from '@/hooks';
import { fieldStr, formatDateTime } from '@/lib/utils';
import { mobileReleaseService } from '@/services/mobile-release.service';

import '../mobile-release.css';

type TabId = 'dashboard' | 'builds' | 'releases' | 'checklist';

const TABS: { id: TabId; label: string }[] = [
  { id: 'dashboard', label: 'Release Dashboard' },
  { id: 'builds', label: 'Build History' },
  { id: 'releases', label: 'Release History' },
  { id: 'checklist', label: 'Play Store Checklist' },
];

export function MobileReleaseHubPage() {
  const [tab, setTab] = useState<TabId>('dashboard');
  const { page, limit, setPage, reset } = usePagination();

  useEffect(() => { reset(); }, [tab, reset]);

  const dashboard = useQuery({
    queryKey: ['mobile-release', 'dashboard'],
    queryFn: () => mobileReleaseService.dashboard(),
    enabled: tab === 'dashboard',
    refetchInterval: 60_000,
  });

  const checklist = useQuery({
    queryKey: ['mobile-release', 'checklist'],
    queryFn: () => mobileReleaseService.checklist(),
    enabled: tab === 'checklist' || tab === 'dashboard',
  });

  const builds = useQuery({
    queryKey: ['mobile-release', 'builds', { page, limit }],
    queryFn: () => mobileReleaseService.builds({ page, limit }),
    enabled: tab === 'builds',
  });

  const releases = useQuery({
    queryKey: ['mobile-release', 'releases', { page, limit }],
    queryFn: () => mobileReleaseService.releases({ page, limit }),
    enabled: tab === 'releases',
  });

  const scores = useMemo(() => {
    const s = (dashboard.data?.scores ?? checklist.data?.scores ?? {}) as Record<string, number>;
    return {
      playStore: s.playStoreReadiness ?? 0,
      security: s.securityScore ?? 0,
      performance: s.performanceScore ?? 0,
      overall: s.androidReleaseReadiness ?? 0,
    };
  }, [dashboard.data, checklist.data]);

  const buildColumns = [
    { key: 'app', header: 'App', render: (r: Record<string, unknown>) => fieldStr(r, 'app') },
    { key: 'environment', header: 'Env', render: (r: Record<string, unknown>) => fieldStr(r, 'environment') },
    { key: 'buildFormat', header: 'Format', render: (r: Record<string, unknown>) => fieldStr(r, 'buildFormat') },
    { key: 'versionName', header: 'Version', render: (r: Record<string, unknown>) => fieldStr(r, 'versionName') },
    { key: 'versionCode', header: 'Code', render: (r: Record<string, unknown>) => fieldStr(r, 'versionCode') },
    { key: 'status', header: 'Status', render: (r: Record<string, unknown>) => <StatusBadge status={fieldStr(r, 'status')} /> },
    { key: 'signed', header: 'Signed', render: (r: Record<string, unknown>) => fieldStr(r, 'signed') === 'true' ? '✓' : '—' },
    { key: 'createdAt', header: 'Built', render: (r: Record<string, unknown>) => formatDateTime(fieldStr(r, 'createdAt')) },
  ];

  const releaseColumns = [
    { key: 'app', header: 'App', render: (r: Record<string, unknown>) => fieldStr(r, 'app') },
    { key: 'versionName', header: 'Version', render: (r: Record<string, unknown>) => fieldStr(r, 'versionName') },
    { key: 'versionCode', header: 'Code', render: (r: Record<string, unknown>) => fieldStr(r, 'versionCode') },
    { key: 'track', header: 'Track', render: (r: Record<string, unknown>) => fieldStr(r, 'track') },
    { key: 'status', header: 'Status', render: (r: Record<string, unknown>) => <StatusBadge status={fieldStr(r, 'status')} /> },
    { key: 'playStoreReady', header: 'Store Ready', render: (r: Record<string, unknown>) => fieldStr(r, 'playStoreReady') === 'true' ? '✓' : '—' },
    { key: 'readinessScore', header: 'Readiness', render: (r: Record<string, unknown>) => `${fieldStr(r, 'readinessScore')}%` },
    { key: 'createdAt', header: 'Created', render: (r: Record<string, unknown>) => formatDateTime(fieldStr(r, 'createdAt')) },
  ];

  if (dashboard.isLoading && tab === 'dashboard') return <LoadingSpinner />;

  return (
    <div className="mobile-release-hub">
      <PageHeader
        title="Mobile Releases"
        subtitle="Android build pipeline, release tracking, and Play Store readiness for Customer & DSA apps"
      />

      <Tabs tabs={TABS} active={tab} onChange={(id) => setTab(id as TabId)} />

      {tab === 'dashboard' && (
        <>
          <div className="mobile-release-scores">
            <StatCard label="Android Release Readiness" value={`${scores.overall}%`} />
            <StatCard label="Play Store Readiness" value={`${scores.playStore}%`} />
            <StatCard label="Security Score" value={`${scores.security}%`} />
            <StatCard label="Performance Score" value={`${scores.performance}%`} />
          </div>

          <div className="grid-2">
            <Card title="Package IDs">
              <p><strong>Customer:</strong> com.kuberone.customer</p>
              <p><strong>DSA Partner:</strong> com.kuberone.partner</p>
              <p className="text-muted">Variants: debug, qa, staging suffixes</p>
            </Card>
            <Card title="Build Outputs">
              <p>APK · AAB · Split APK · Universal APK</p>
              <p className="text-muted">Hermes · R8/ProGuard · Resource shrinking (production)</p>
            </Card>
          </div>

          {(dashboard.data?.recentBuilds as Record<string, unknown>[] | undefined)?.length ? (
            <Card title="Recent Builds" className="mt-4">
              <PaginatedListView
                search=""
                onSearchChange={() => {}}
                columns={buildColumns}
                data={(dashboard.data?.recentBuilds as Record<string, unknown>[]) ?? []}
                meta={{ page: 1, limit: 10, total: (dashboard.data?.recentBuilds as unknown[])?.length ?? 0, totalPages: 1 }}
                isLoading={false}
                onPageChange={() => {}}
                emptyTitle="No builds"
              />
            </Card>
          ) : null}
        </>
      )}

      {tab === 'builds' && (
        <PaginatedListView
          search=""
          onSearchChange={() => {}}
          columns={buildColumns}
          data={builds.data?.items ?? []}
          meta={builds.data?.meta}
          isLoading={builds.isLoading}
          onPageChange={setPage}
          emptyTitle="No builds"
        />
      )}

      {tab === 'releases' && (
        <PaginatedListView
          search=""
          onSearchChange={() => {}}
          columns={releaseColumns}
          data={releases.data?.items ?? []}
          meta={releases.data?.meta}
          isLoading={releases.isLoading}
          onPageChange={setPage}
          emptyTitle="No releases"
        />
      )}

      {tab === 'checklist' && (
        <div className="grid-2">
          <Card title="Play Store Checklist">
            <ul className="mobile-release-checklist">
              {((checklist.data?.playStore as { id: string; label: string }[]) ?? []).map((item) => (
                <li key={item.id} className="pending">{item.label}</li>
              ))}
            </ul>
          </Card>
          <Card title="Upload & Version Checklists">
            <h4>Upload</h4>
            <ul className="mobile-release-checklist">
              {((checklist.data?.uploadChecklist as string[]) ?? []).map((item) => (
                <li key={item} className="pending">{item}</li>
              ))}
            </ul>
            <h4 className="mt-4">Version</h4>
            <ul className="mobile-release-checklist">
              {((checklist.data?.versionChecklist as string[]) ?? []).map((item) => (
                <li key={item} className="pending">{item}</li>
              ))}
            </ul>
          </Card>
        </div>
      )}
    </div>
  );
}
