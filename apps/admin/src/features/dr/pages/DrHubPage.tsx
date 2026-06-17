import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';

import { CanAccess } from '@/components/guards/CanAccess';
import { Button, Card, LoadingSpinner, PageHeader, StatCard, Tabs } from '@/components/ui';
import { StatusBadge } from '@/components/ui/Badge';
import { usePagination } from '@/hooks';
import { fieldStr, formatDateTime } from '@/lib/utils';
import { drService } from '@/services/dr.service';

import '../dr.css';

type TabId = 'dashboard' | 'recovery' | 'failover' | 'drills' | 'reports';

const TABS: { id: TabId; label: string }[] = [
  { id: 'dashboard', label: 'DR Dashboard' },
  { id: 'recovery', label: 'Recovery Dashboard' },
  { id: 'failover', label: 'Failover Dashboard' },
  { id: 'drills', label: 'DR Drill Dashboard' },
  { id: 'reports', label: 'Recovery Reports' },
];

export function DrHubPage() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<TabId>('dashboard');
  const { reset } = usePagination();

  useEffect(() => { reset(); }, [tab, reset]);

  const dashboard = useQuery({
    queryKey: ['dr', 'dashboard'],
    queryFn: () => drService.dashboard(),
    enabled: ['dashboard', 'recovery', 'failover'].includes(tab),
    refetchInterval: tab === 'dashboard' ? 60_000 : false,
  });

  const drills = useQuery({
    queryKey: ['dr', 'drills'],
    queryFn: () => drService.drills({ page: 1, limit: 20 }),
    enabled: tab === 'drills',
  });

  const reports = useQuery({
    queryKey: ['dr', 'reports'],
    queryFn: () => drService.reports(),
    enabled: tab === 'reports',
  });

  const drillMut = useMutation({
    mutationFn: () => drService.startDrill({ drillType: 'QUARTERLY', scenario: 'DATABASE_FAILURE' }),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['dr'] }),
  });

  const scores = useMemo(() => {
    const d = dashboard.data ?? {};
    return {
      coverage: fieldStr(d, 'drCoveragePercent'),
      drReadiness: fieldStr(d, 'disasterRecoveryReadinessPercent'),
      failover: fieldStr(d, 'failoverReadinessPercent'),
      bcp: fieldStr(d, 'businessContinuityScore'),
      resilience: fieldStr(d, 'productionResilienceScore'),
      rpo: fieldStr(d, 'rpoAchievedMinutes'),
      rto: fieldStr(d, 'rtoAchievedMinutes'),
    };
  }, [dashboard.data]);

  const scenarios = (dashboard.data?.scenarios ?? []) as { code?: string; name: string; scenario?: string; rtoMinutes?: number }[];
  const runbooks = (dashboard.data?.runbooks ?? []) as { code: string; name: string }[];
  const drillItems = ((drills.data as Record<string, unknown>)?.items ?? drills.data ?? []) as Record<string, unknown>[];

  if (dashboard.isLoading && tab === 'dashboard') return <LoadingSpinner />;

  return (
    <div className="dr-hub">
      <PageHeader
        title="Disaster Recovery"
        subtitle="Business continuity, failover, recovery runbooks — RPO &lt; 15 min, RTO &lt; 60 min"
      />

      <Tabs tabs={TABS} active={tab} onChange={(id) => setTab(id as TabId)} />

      {tab === 'dashboard' && (
        <>
          <div className="dr-scores">
            <StatCard label="DR Coverage" value={`${scores.coverage}%`} />
            <StatCard label="DR Readiness" value={`${scores.drReadiness}%`} />
            <StatCard label="Failover Readiness" value={`${scores.failover}%`} />
            <StatCard label="Business Continuity" value={`${scores.bcp}%`} />
            <StatCard label="Resilience Score" value={`${scores.resilience}%`} />
            <StatCard label="RPO Achieved" value={`${scores.rpo} min`} />
            <StatCard label="RTO Achieved" value={`${scores.rto} min`} />
          </div>
          <div className="grid-2">
            <Card title="Failover Strategy">
              <p>Primary: production-ap-south-1</p>
              <p>Standby: standby-ap-south-2</p>
              <p className="text-muted">DNS failover ready · Blue-green · Traffic switching</p>
            </Card>
            <Card title="DR Plans">
              <p>{((dashboard.data?.plans as unknown[]) ?? []).length} active recovery plans</p>
              <p>{runbooks.length} recovery runbooks</p>
            </Card>
          </div>
          <Card title="Disaster Scenarios (15)">
            <div className="scenario-grid">
              {scenarios.map((s) => (
                <div key={s.code ?? s.name} className="scenario-item">
                  <strong>{s.name}</strong>
                  <br />
                  <span className="text-muted">RTO: {s.rtoMinutes ?? 60} min</span>
                </div>
              ))}
            </div>
          </Card>
        </>
      )}

      {tab === 'recovery' && (
        <Card title="Recovery Operations">
          <p>Point-in-time recovery · Database restore · Replica promotion · S3 versioning · Document restore</p>
          <p className="text-muted">Runbooks: {runbooks.map((r) => r.name).slice(0, 5).join(' · ')}…</p>
          <CanAccess permission={['recovery.manage', 'dr.execute']}>
            <Button className="mt-4" onClick={() => drService.startRecovery({ scenario: 'DATABASE_FAILURE' })}>
              Initiate Recovery (DB)
            </Button>
          </CanAccess>
        </Card>
      )}

      {tab === 'failover' && (
        <Card title="Failover Dashboard">
          <p>Traffic switching · DNS failover · Blue-green recovery · Read replica promotion</p>
          <CanAccess permission={['dr.execute', 'recovery.manage']}>
            <Button className="mt-4" onClick={() => drService.startFailover({ failoverType: 'BLUE_GREEN' })}>
              Test Failover (Blue-Green)
            </Button>
          </CanAccess>
        </Card>
      )}

      {tab === 'drills' && (
        <>
          <CanAccess permission={['dr.manage', 'dr.execute']}>
            <Button className="mb-4" onClick={() => drillMut.mutate()}>Start Quarterly DR Drill</Button>
          </CanAccess>
          <Card title="DR Drill History">
            <ul className="app-store-checklist">
              {drillItems.map((d) => (
                <li key={fieldStr(d, 'id')} className={fieldStr(d, 'passed') === 'true' ? 'passed' : 'pending'}>
                  {fieldStr(d, 'drillType')} — {fieldStr(d, 'scenario')} — <StatusBadge status={fieldStr(d, 'status')} />
                  {' '}{formatDateTime(fieldStr(d, 'createdAt'))}
                </li>
              ))}
            </ul>
          </Card>
        </>
      )}

      {tab === 'reports' && (
        <div className="grid-2">
          {(['drReadinessReport', 'recoveryReport', 'failoverReport', 'businessContinuityReport'] as const).map((key) => {
            const r = (reports.data?.[key] ?? {}) as Record<string, unknown>;
            const titles: Record<string, string> = {
              drReadinessReport: 'DR Readiness Report',
              recoveryReport: 'Recovery Report',
              failoverReport: 'Failover Report',
              businessContinuityReport: 'Business Continuity Report',
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
