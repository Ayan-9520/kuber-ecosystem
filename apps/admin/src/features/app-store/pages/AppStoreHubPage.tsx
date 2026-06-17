import { useQuery } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';

import { PaginatedListView } from '@/components/common/PaginatedListView';
import { Card, LoadingSpinner, PageHeader, StatCard, Tabs } from '@/components/ui';
import { StatusBadge } from '@/components/ui/Badge';
import { usePagination } from '@/hooks';
import { fieldStr, formatDateTime } from '@/lib/utils';
import { appStoreService } from '@/services/app-store.service';

import '../app-store.css';

type TabId = 'dashboard' | 'testflight' | 'releases' | 'assets' | 'compliance' | 'reports';

const TABS: { id: TabId; label: string }[] = [
  { id: 'dashboard', label: 'App Store Dashboard' },
  { id: 'testflight', label: 'TestFlight' },
  { id: 'releases', label: 'Release Tracking' },
  { id: 'assets', label: 'Store Assets' },
  { id: 'compliance', label: 'Compliance' },
  { id: 'reports', label: 'Reports' },
];

export function AppStoreHubPage() {
  const [tab, setTab] = useState<TabId>('dashboard');
  const { page, limit, setPage, reset } = usePagination();

  useEffect(() => { reset(); }, [tab, reset]);

  const dashboard = useQuery({
    queryKey: ['app-store', 'dashboard'],
    queryFn: () => appStoreService.dashboard(),
    enabled: ['dashboard', 'assets'].includes(tab),
    refetchInterval: tab === 'dashboard' ? 60_000 : false,
  });

  const testflight = useQuery({
    queryKey: ['app-store', 'testflight'],
    queryFn: () => appStoreService.testflight(),
    enabled: tab === 'testflight',
  });

  const checklist = useQuery({
    queryKey: ['app-store', 'checklist'],
    queryFn: () => appStoreService.checklist(),
    enabled: ['compliance', 'assets'].includes(tab),
  });

  const releases = useQuery({
    queryKey: ['app-store', 'releases', { page, limit }],
    queryFn: () => appStoreService.releases({ page, limit }),
    enabled: tab === 'releases',
  });

  const reports = useQuery({
    queryKey: ['app-store', 'reports'],
    queryFn: () => appStoreService.reports(),
    enabled: tab === 'reports',
  });

  const scores = useMemo(() => {
    const s = (dashboard.data?.scores ?? checklist.data?.scores ?? {}) as Record<string, number>;
    return {
      appStore: s.appStoreReadiness ?? 0,
      compliance: s.complianceScore ?? 0,
      review: s.reviewReadiness ?? 0,
      release: s.releaseReadiness ?? 0,
      launch: s.productionLaunchReadiness ?? 0,
      security: s.securityScore ?? 0,
    };
  }, [dashboard.data, checklist.data]);

  const releaseColumns = [
    { key: 'app', header: 'App', render: (r: Record<string, unknown>) => fieldStr((r.listing as Record<string, unknown>) ?? r, 'app') },
    { key: 'versionName', header: 'Version', render: (r: Record<string, unknown>) => fieldStr(r, 'versionName') },
    { key: 'buildNumber', header: 'Build', render: (r: Record<string, unknown>) => fieldStr(r, 'buildNumber') },
    { key: 'track', header: 'Track', render: (r: Record<string, unknown>) => <StatusBadge status={fieldStr(r, 'track')} /> },
    { key: 'status', header: 'Status', render: (r: Record<string, unknown>) => <StatusBadge status={fieldStr(r, 'status')} /> },
    { key: 'phasedRelease', header: 'Phased', render: (r: Record<string, unknown>) => fieldStr(r, 'phasedRelease') === 'true' ? '✓' : '—' },
    { key: 'createdAt', header: 'Created', render: (r: Record<string, unknown>) => formatDateTime(fieldStr(r, 'createdAt')) },
  ];

  const customerScreens = (dashboard.data?.apps as Record<string, unknown>)?.customer as Record<string, unknown> | undefined;
  const dsaScreens = (dashboard.data?.apps as Record<string, unknown>)?.dsa as Record<string, unknown> | undefined;
  const assets = (dashboard.data?.storeAssetsChecklist ?? checklist.data?.storeAssets ?? []) as {
    asset: string; spec: string; customer: boolean; dsa: boolean;
  }[];

  if (dashboard.isLoading && tab === 'dashboard') return <LoadingSpinner />;

  return (
    <div className="app-store-hub">
      <PageHeader
        title="App Store"
        subtitle="Apple App Store & TestFlight deployment for KuberOne Customer & Partner apps"
      />

      <Tabs tabs={TABS} active={tab} onChange={(id) => setTab(id as TabId)} />

      {tab === 'dashboard' && (
        <>
          <div className="app-store-scores">
            <StatCard label="App Store Readiness" value={`${scores.appStore}%`} />
            <StatCard label="Compliance Score" value={`${scores.compliance}%`} />
            <StatCard label="Review Readiness" value={`${scores.review}%`} />
            <StatCard label="Release Readiness" value={`${scores.release}%`} />
            <StatCard label="Production Launch" value={`${scores.launch}%`} />
            <StatCard label="Security Score" value={`${scores.security}%`} />
          </div>
          <div className="grid-2">
            <Card title="Bundle Identifiers">
              <p><strong>Customer:</strong> com.kuberone.customer</p>
              <p><strong>DSA Partner:</strong> com.kuberone.partner</p>
            </Card>
            <Card title="Release Strategy">
              <p>Phased release: 7 days</p>
              <p className="text-muted">TestFlight → App Review → Phased rollout</p>
            </Card>
          </div>
          <Card title="Management Teams — Launch Briefing">
            <ul className="app-store-checklist">
              {((dashboard.data?.managementTeams as { label: string; testflightGroup: string }[]) ?? []).map((t) => (
                <li key={t.testflightGroup} className="pending">
                  {t.label} <span className="text-muted">({t.testflightGroup})</span>
                </li>
              ))}
            </ul>
          </Card>
        </>
      )}

      {tab === 'testflight' && (
        <div className="grid-2">
          <Card title="TestFlight Tracks">
            {((testflight.data?.tracks as { id: string; label: string }[]) ?? []).map((t) => (
              <p key={t.id}>{t.label}</p>
            ))}
          </Card>
          <Card title="Beta Groups">
            <ul className="app-store-checklist">
              {((testflight.data?.betaGroups as string[]) ?? []).map((g) => (
                <li key={g} className="pending">{g}</li>
              ))}
            </ul>
          </Card>
        </div>
      )}

      {tab === 'releases' && (
        <PaginatedListView search="" onSearchChange={() => {}} columns={releaseColumns}
          data={releases.data?.items ?? []} meta={releases.data?.meta} isLoading={releases.isLoading}
          onPageChange={setPage} emptyTitle="No App Store releases" />
      )}

      {tab === 'assets' && (
        <div className="grid-2">
          <Card title="Store Assets Checklist">
            <table className="play-store-assets-table">
              <thead><tr><th>Asset</th><th>Spec</th><th>Customer</th><th>DSA</th></tr></thead>
              <tbody>
                {assets.map((a) => (
                  <tr key={a.asset}><td>{a.asset}</td><td>{a.spec}</td><td>{a.customer ? '✓' : '—'}</td><td>{a.dsa ? '✓' : '—'}</td></tr>
                ))}
              </tbody>
            </table>
          </Card>
          <Card title="Screenshot Requirements">
            <h4>Customer</h4>
            <ul className="app-store-screenshots">
              {((customerScreens?.screenshots as string[]) ?? []).map((s) => <li key={s}>{s}</li>)}
            </ul>
            <h4 className="mt-4">DSA Partner</h4>
            <ul className="app-store-screenshots">
              {((dsaScreens?.screenshots as string[]) ?? []).map((s) => <li key={s}>{s}</li>)}
            </ul>
          </Card>
        </div>
      )}

      {tab === 'compliance' && (
        <div className="grid-2">
          <Card title="Privacy & Compliance">
            <ul className="app-store-checklist">
              {((checklist.data?.compliance as { id: string; label: string }[]) ?? []).map((item) => (
                <li key={item.id} className="pending">{item.label}</li>
              ))}
            </ul>
          </Card>
          <Card title="App Review Readiness">
            <ul className="app-store-checklist">
              {((checklist.data?.reviewReadiness as { id: string; label: string }[]) ?? []).map((item) => (
                <li key={item.id} className="passed">{item.label}</li>
              ))}
            </ul>
            <h4 className="mt-4">Submission</h4>
            <ul className="app-store-checklist">
              {((checklist.data?.submissionChecklist as string[]) ?? []).map((item) => (
                <li key={item} className="pending">{item}</li>
              ))}
            </ul>
          </Card>
        </div>
      )}

      {tab === 'reports' && (
        <div className="grid-2">
          {(['storeReport', 'complianceReport', 'reviewReport', 'releaseReport', 'launchReport'] as const).map((key) => {
            const r = (reports.data?.[key] ?? {}) as Record<string, unknown>;
            const titles: Record<string, string> = {
              storeReport: 'App Store Readiness', complianceReport: 'Compliance Report',
              reviewReport: 'Review Readiness', releaseReport: 'Release Report', launchReport: 'Launch Report',
            };
            return (
              <Card key={key} title={titles[key]}>
                <p><strong>Score:</strong> {fieldStr(r, 'score')}%</p>
                <p>{fieldStr(r, 'summary')}</p>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
