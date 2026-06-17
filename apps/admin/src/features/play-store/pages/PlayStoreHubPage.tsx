import { useQuery } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';

import { PaginatedListView } from '@/components/common/PaginatedListView';
import { Card, LoadingSpinner, PageHeader, StatCard, Tabs } from '@/components/ui';
import { StatusBadge } from '@/components/ui/Badge';
import { usePagination } from '@/hooks';
import { fieldStr, formatDateTime } from '@/lib/utils';
import { playStoreService } from '@/services/play-store.service';

import '../play-store.css';

type TabId = 'dashboard' | 'releases' | 'assets' | 'compliance' | 'reports';
type AppFilter = 'all' | 'customer' | 'dsa';

const TABS: { id: TabId; label: string }[] = [
  { id: 'dashboard', label: 'Play Store Dashboard' },
  { id: 'releases', label: 'Release Tracking' },
  { id: 'assets', label: 'Store Assets' },
  { id: 'compliance', label: 'Compliance' },
  { id: 'reports', label: 'Reports' },
];

export function PlayStoreHubPage() {
  const [tab, setTab] = useState<TabId>('dashboard');
  const [appFilter, setAppFilter] = useState<AppFilter>('all');
  const { page, limit, setPage, reset } = usePagination();

  useEffect(() => { reset(); }, [tab, reset]);

  const dashboard = useQuery({
    queryKey: ['play-store', 'dashboard'],
    queryFn: () => playStoreService.dashboard(),
    enabled: ['dashboard', 'assets', 'compliance', 'reports'].includes(tab),
    refetchInterval: tab === 'dashboard' ? 60_000 : false,
  });

  const checklist = useQuery({
    queryKey: ['play-store', 'checklist'],
    queryFn: () => playStoreService.checklist(),
    enabled: ['compliance', 'assets'].includes(tab),
  });

  const releases = useQuery({
    queryKey: ['play-store', 'releases', { page, limit, appFilter }],
    queryFn: () =>
      playStoreService.releases({
        page,
        limit,
        ...(appFilter !== 'all' ? { app: appFilter.toUpperCase() } : {}),
      }),
    enabled: tab === 'releases',
  });

  const reports = useQuery({
    queryKey: ['play-store', 'reports', appFilter],
    queryFn: () =>
      playStoreService.reports(appFilter !== 'all' ? { app: appFilter.toUpperCase() } : undefined),
    enabled: tab === 'reports',
  });

  const scores = useMemo(() => {
    const s = (dashboard.data?.scores ?? checklist.data?.scores ?? {}) as Record<string, number>;
    return {
      playStore: s.playStoreReadiness ?? 0,
      compliance: s.complianceScore ?? 0,
      release: s.releaseReadiness ?? 0,
      launch: s.productionLaunchReadiness ?? 0,
      security: s.securityScore ?? 0,
      performance: s.performanceScore ?? 0,
    };
  }, [dashboard.data, checklist.data]);

  const releaseColumns = [
    {
      key: 'app',
      header: 'App',
      render: (r: Record<string, unknown>) =>
        fieldStr((r.listing as Record<string, unknown>) ?? r, 'app') || fieldStr(r, 'app'),
    },
    { key: 'versionName', header: 'Version', render: (r: Record<string, unknown>) => fieldStr(r, 'versionName') },
    { key: 'versionCode', header: 'Code', render: (r: Record<string, unknown>) => fieldStr(r, 'versionCode') },
    { key: 'track', header: 'Track', render: (r: Record<string, unknown>) => <StatusBadge status={fieldStr(r, 'track')} /> },
    { key: 'status', header: 'Status', render: (r: Record<string, unknown>) => <StatusBadge status={fieldStr(r, 'status')} /> },
    { key: 'rolloutPercent', header: 'Rollout', render: (r: Record<string, unknown>) => `${fieldStr(r, 'rolloutPercent')}%` },
    { key: 'createdAt', header: 'Created', render: (r: Record<string, unknown>) => formatDateTime(fieldStr(r, 'createdAt')) },
  ];

  const assets = (dashboard.data?.storeAssetsChecklist ?? checklist.data?.storeAssets ?? []) as {
    asset: string;
    spec: string;
    customer: boolean;
    dsa: boolean;
  }[];

  const customerScreens = (dashboard.data?.apps as Record<string, unknown>)?.customer as Record<string, unknown> | undefined;
  const dsaScreens = (dashboard.data?.apps as Record<string, unknown>)?.dsa as Record<string, unknown> | undefined;

  if (dashboard.isLoading && tab === 'dashboard') return <LoadingSpinner />;

  return (
    <div className="play-store-hub">
      <PageHeader
        title="Play Store"
        subtitle="Google Play deployment readiness, release tracking, and compliance for KuberOne Customer & Partner apps"
      />

      <Tabs
        tabs={[
          { id: 'all', label: 'All Apps' },
          { id: 'customer', label: 'Customer' },
          { id: 'dsa', label: 'DSA Partner' },
        ]}
        active={appFilter}
        onChange={(id) => setAppFilter(id as AppFilter)}
      />
      <Tabs tabs={TABS} active={tab} onChange={(id) => setTab(id as TabId)} />

      {tab === 'dashboard' && (
        <>
          <div className="play-store-scores">
            <StatCard label="Play Store Readiness" value={`${scores.playStore}%`} />
            <StatCard label="Compliance Score" value={`${scores.compliance}%`} />
            <StatCard label="Release Readiness" value={`${scores.release}%`} />
            <StatCard label="Production Launch" value={`${scores.launch}%`} />
            <StatCard label="Security Score" value={`${scores.security}%`} />
            <StatCard label="Performance" value={`${scores.performance}%`} />
          </div>

          <div className="grid-2">
            <Card title="Package Names">
              <p><strong>Customer:</strong> com.kuberone.customer</p>
              <p><strong>DSA Partner:</strong> com.kuberone.partner</p>
              <p className="text-muted">Categories: Finance · Business</p>
            </Card>
            <Card title="Testing Tracks">
              {((dashboard.data?.testingTracks as { id: string; label: string }[]) ?? []).map((t) => (
                <p key={t.id}>{t.label}</p>
              ))}
            </Card>
          </div>

          <Card title="Staged Rollout Strategy" className="mt-4">
            <p>{((dashboard.data?.rolloutStrategy as string[]) ?? ['10%', '50%', '100%']).join(' → ')}</p>
          </Card>
        </>
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
          emptyTitle="No Play Store releases"
        />
      )}

      {tab === 'assets' && (
        <div className="grid-2">
          <Card title="Store Assets Checklist">
            <table className="play-store-assets-table">
              <thead>
                <tr><th>Asset</th><th>Spec</th><th>Customer</th><th>DSA</th></tr>
              </thead>
              <tbody>
                {assets.map((a) => (
                  <tr key={a.asset}>
                    <td>{a.asset}</td>
                    <td>{a.spec}</td>
                    <td>{a.customer ? '✓' : '—'}</td>
                    <td>{a.dsa ? '✓' : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
          <Card title="Screenshot Requirements">
            <h4>Customer App</h4>
            <ul className="play-store-screenshot-list">
              {((customerScreens?.screenshots as string[]) ?? []).map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
            <h4 className="mt-4">DSA Partner App</h4>
            <ul className="play-store-screenshot-list">
              {((dsaScreens?.screenshots as string[]) ?? []).map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </Card>
        </div>
      )}

      {tab === 'compliance' && (
        <div className="grid-2">
          <Card title="Compliance Checklist">
            <ul className="play-store-checklist">
              {((checklist.data?.compliance as { id: string; label: string }[]) ?? []).map((item) => (
                <li key={item.id} className="pending">{item.label}</li>
              ))}
            </ul>
          </Card>
          <Card title="Play Integrity & Launch">
            <h4>Play Integrity</h4>
            <ul className="play-store-checklist">
              {((checklist.data?.integrity as { id: string; label: string }[]) ?? []).map((item) => (
                <li key={item.id} className="passed">{item.label}</li>
              ))}
            </ul>
            <h4 className="mt-4">Launch Checklist</h4>
            <ul className="play-store-checklist">
              {((checklist.data?.launchChecklist as string[]) ?? []).map((item) => (
                <li key={item} className="pending">{item}</li>
              ))}
            </ul>
          </Card>
        </div>
      )}

      {tab === 'reports' && (
        <div className="grid-2">
          {(['storeReport', 'complianceReport', 'releaseReport', 'launchReport'] as const).map((key) => {
            const r = (reports.data?.[key] ?? {}) as Record<string, unknown>;
            const titles: Record<string, string> = {
              storeReport: 'Store Readiness Report',
              complianceReport: 'Compliance Report',
              releaseReport: 'Release Report',
              launchReport: 'Launch Report',
            };
            return (
              <Card key={key} title={titles[key]}>
                <p><strong>Score:</strong> {fieldStr(r, 'score')}%</p>
                <p>{fieldStr(r, 'summary')}</p>
                <p className="text-muted">{formatDateTime(fieldStr(r, 'generatedAt'))}</p>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
