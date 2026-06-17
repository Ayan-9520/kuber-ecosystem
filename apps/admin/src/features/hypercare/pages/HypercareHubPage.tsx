import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

import { CanAccess } from '@/components/guards/CanAccess';
import { Button, Card, LoadingSpinner, PageHeader, StatCard, Tabs } from '@/components/ui';
import { StatusBadge } from '@/components/ui/Badge';
import { fieldStr, formatDateTime } from '@/lib/utils';
import { hypercareService } from '@/services/hypercare.service';

import '../hypercare.css';

type TabId = 'hypercare' | 'support' | 'incidents' | 'adoption' | 'executive' | 'performance' | 'reports';

const TABS: { id: TabId; label: string }[] = [
  { id: 'hypercare', label: 'Hypercare Dashboard' },
  { id: 'support', label: 'Issue Dashboard' },
  { id: 'incidents', label: 'Incident Dashboard' },
  { id: 'adoption', label: 'Adoption Dashboard' },
  { id: 'performance', label: 'Performance Dashboard' },
  { id: 'executive', label: 'Executive Dashboard' },
  { id: 'reports', label: 'Reports' },
];

const PHASES = ['WEEK_1', 'WEEK_2', 'WEEK_3', 'WEEK_4', 'EXTENSION'];

export function HypercareHubPage() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<TabId>('hypercare');

  const status = useQuery({
    queryKey: ['hypercare', 'status'],
    queryFn: () => hypercareService.status(),
    refetchInterval: ['hypercare', 'incidents', 'adoption', 'executive'].includes(tab) ? 30_000 : false,
  });

  const reports = useQuery({
    queryKey: ['hypercare', 'reports'],
    queryFn: () => hypercareService.reports(),
    enabled: tab === 'reports',
  });

  const metricsMut = useMutation({
    mutationFn: () => hypercareService.snapshotMetrics({}),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['hypercare'] }),
  });

  const resolveIncidentMut = useMutation({
    mutationFn: (id: string) => hypercareService.updateIncident(id, { status: 'RESOLVED' }),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['hypercare'] }),
  });

  const resolveIssueMut = useMutation({
    mutationFn: (id: string) => hypercareService.updateIssue(id, { status: 'RESOLVED' }),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['hypercare'] }),
  });

  const s = status.data ?? {};
  const scores = (s.scores ?? {}) as Record<string, number>;
  const finalStatus = fieldStr(s, 'finalStatus') || 'STABILIZING';
  const incidents = (s.incidents ?? []) as Record<string, unknown>[];
  const issues = (s.issues ?? []) as Record<string, unknown>[];
  const metrics = (s.metrics ?? []) as Record<string, unknown>[];
  const adoptionMetrics = (s.adoptionMetrics ?? []) as { name: string; value: number; unit?: string }[];
  const productionMonitoring = (s.productionMonitoring ?? []) as { name: string; healthy: boolean }[];
  const successCriteria = (s.successCriteria ?? []) as { criterion: string; met: boolean }[];
  const phases = (s.phases ?? PHASES.map((p) => ({ phase: p, label: p }))) as { phase: string; label: string }[];
  const hotfixQueue = (s.hotfixQueue ?? []) as Record<string, unknown>[];

  const verdictClass = finalStatus === 'PRODUCTION_STABILIZED' ? 'verdict-stabilized'
    : finalStatus === 'STABLE' ? 'verdict-stable'
    : finalStatus === 'UNSTABLE' ? 'verdict-unstable' : 'verdict-stabilizing';

  if (status.isLoading && tab === 'hypercare') return <LoadingSpinner />;

  return (
    <div className="hypercare-hub">
      <PageHeader
        title="Hypercare Support Phase"
        subtitle="KuberOne post-launch stabilization — monitoring, incidents, adoption, performance & executive oversight"
      />

      <div className={`verdict-banner ${verdictClass}`}>
        {finalStatus.replace(/_/g, ' ')} — Week {fieldStr(s, 'weekNumber') || '1'} · Success Score {scores.hypercareSuccessScore ?? 0}%
      </div>

      <Tabs tabs={TABS} active={tab} onChange={(id) => setTab(id as TabId)} />

      {tab === 'hypercare' && (
        <>
          <div className="readiness-grid">
            <StatCard label="Production Stability" value={`${scores.productionStabilityPercent ?? 0}%`} />
            <StatCard label="User Adoption" value={`${scores.userAdoptionPercent ?? 0}%`} />
            <StatCard label="Incident Resolution" value={`${scores.incidentResolutionPercent ?? 0}%`} />
            <StatCard label="Performance Score" value={`${scores.performanceScore ?? 0}%`} />
            <StatCard label="AI Stability" value={`${scores.aiStabilityPercent ?? 0}%`} />
            <StatCard label="Health Score" value={`${scores.productionHealthScore ?? 0}%`} />
          </div>
          <Card title="Hypercare Phases">
            <div className="phase-grid">
              {phases.map((p) => (
                <div key={p.phase} className={`phase-card ${p.phase === fieldStr(s, 'phase') ? 'active' : ''}`}>
                  {p.label ?? p.phase.replace(/_/g, ' ')}
                </div>
              ))}
            </div>
          </Card>
          <Card title="Production Monitoring">
            <div className="monitor-grid">
              {productionMonitoring.map((m) => (
                <div key={m.name} className={`monitor-item ${m.healthy ? 'healthy' : 'unhealthy'}`}>
                  {m.healthy ? '✓' : '○'} {m.name}
                </div>
              ))}
            </div>
          </Card>
          <Card title="Success Criteria">
            <div className="criteria-grid">
              {successCriteria.map((c) => (
                <div key={c.criterion} className={`criteria-item ${c.met ? 'met' : 'pending'}`}>
                  {c.met ? '✓' : '○'} {c.criterion}
                </div>
              ))}
            </div>
          </Card>
        </>
      )}

      {tab === 'support' && (
        <Card title="Issue Queue — Bug & Support Management">
          {issues.map((issue) => (
            <div key={fieldStr(issue, 'id')} className="issue-row">
              <div>
                <strong>{fieldStr(issue, 'code')} — {fieldStr(issue, 'title')}</strong>
                <div className="text-sm">
                  <StatusBadge status={fieldStr(issue, 'category')} /> · <StatusBadge status={fieldStr(issue, 'severity')} /> · <StatusBadge status={fieldStr(issue, 'status')} />
                </div>
                <p className="text-sm mt-1">{fieldStr(issue, 'description')}</p>
              </div>
              <CanAccess permission={['hypercare.resolve', 'incident.manage']}>
                {fieldStr(issue, 'status') !== 'RESOLVED' && (
                  <Button size="sm" onClick={() => resolveIssueMut.mutate(fieldStr(issue, 'id'))}>Resolve</Button>
                )}
              </CanAccess>
            </div>
          ))}
          {hotfixQueue.length > 0 && (
            <Card title="Hotfix Queue" className="mt-4">
              {hotfixQueue.map((h) => (
                <div key={fieldStr(h, 'id')} className="issue-row">{fieldStr(h, 'code')} — {fieldStr(h, 'title')}</div>
              ))}
            </Card>
          )}
          {issues.length === 0 && <p className="text-muted">No issues in queue.</p>}
        </Card>
      )}

      {tab === 'incidents' && (
        <Card title="Incident Dashboard — SLA Management">
          <p className="text-sm text-muted mb-3">SEV-1: 15min · SEV-2: 30min · SEV-3: 4hr · SEV-4: 1 business day</p>
          {incidents.map((inc) => (
            <div key={fieldStr(inc, 'id')} className="incident-row">
              <div>
                <strong>{fieldStr(inc, 'code')} — {fieldStr(inc, 'title')}</strong>
                <div className="text-sm">
                  <StatusBadge status={fieldStr(inc, 'severity')} /> · <StatusBadge status={fieldStr(inc, 'status')} />
                </div>
                <p className="sla-badge">
                  SLA: {fieldStr(inc, 'slaResponseMinutes')} min
                  {fieldStr(inc, 'slaDeadline') && ` · Due ${formatDateTime(fieldStr(inc, 'slaDeadline'))}`}
                </p>
                <p className="text-sm">{fieldStr(inc, 'description')}</p>
              </div>
              <CanAccess permission={['hypercare.resolve', 'incident.manage']}>
                {!['RESOLVED', 'CLOSED'].includes(fieldStr(inc, 'status')) && (
                  <Button size="sm" onClick={() => resolveIncidentMut.mutate(fieldStr(inc, 'id'))}>Resolve</Button>
                )}
              </CanAccess>
            </div>
          ))}
          {incidents.length === 0 && <p className="text-muted">No incidents recorded.</p>}
        </Card>
      )}

      {tab === 'adoption' && (
        <>
          <div className="readiness-grid">
            {adoptionMetrics.map((m) => (
              <StatCard key={m.name} label={m.name} value={`${m.value}${m.unit ? ` ${m.unit}` : ''}`} />
            ))}
          </div>
          <Card title="User Adoption Tracking">
            <p>Daily Active Users, Weekly Active Users, Feature Usage, AI Usage, Voice AI Usage, Drop Off Analysis</p>
            <StatCard label="Adoption Score" value={`${scores.userAdoptionPercent ?? 0}%`} />
          </Card>
        </>
      )}

      {tab === 'performance' && (
        <>
          <CanAccess permission={['hypercare.manage']}>
            <Button className="mb-4" variant="secondary" disabled={metricsMut.isPending} onClick={() => metricsMut.mutate()}>
              Refresh Metrics
            </Button>
          </CanAccess>
          <div className="readiness-grid">
            <StatCard label="Performance Score" value={`${scores.performanceScore ?? 0}%`} />
            {metrics.filter((m) => fieldStr(m, 'category') === 'PERFORMANCE').map((m) => (
              <StatCard key={fieldStr(m, 'id')} label={fieldStr(m, 'name')} value={`${fieldStr(m, 'value')} ${fieldStr(m, 'unit')}`} />
            ))}
          </div>
          <Card title="Performance Tuning Watchlist">
            <ul>
              {['Slow APIs', 'Slow Queries', 'Queue Delays', 'AI Latency', 'Notification Latency', 'Frontend Performance', 'Mobile Performance'].map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </Card>
        </>
      )}

      {tab === 'executive' && (
        <>
          <div className="readiness-grid">
            <StatCard label="Hypercare Success" value={`${scores.hypercareSuccessScore ?? 0}%`} />
            <StatCard label="Production Stability" value={`${scores.productionStabilityPercent ?? 0}%`} />
            <StatCard label="Open Incidents" value={String(s.openIncidents ?? 0)} />
            <StatCard label="Critical Incidents" value={String(s.criticalIncidents ?? 0)} />
            <StatCard label="Open Issues" value={String(s.openIssues ?? 0)} />
            <StatCard label="SLA Breaches" value={String(s.slaBreaches ?? 0)} />
          </div>
          <Card title="Executive Summary">
            <p>Phase: {fieldStr(s, 'phase').replace(/_/g, ' ')} · Session: {fieldStr(s, 'sessionCode')}</p>
            <p>Production health at {scores.productionHealthScore ?? 0}% with {scores.userAdoptionPercent ?? 0}% user adoption during hypercare week {fieldStr(s, 'weekNumber')}.</p>
          </Card>
        </>
      )}

      {tab === 'reports' && (
        <>
          {reports.isLoading ? <LoadingSpinner /> : (
            <Card title="Hypercare Reports">
              <pre className="text-xs overflow-auto max-h-96">{JSON.stringify(reports.data, null, 2)}</pre>
            </Card>
          )}
          <Button variant="secondary" onClick={() => void reports.refetch()}>Generate Reports</Button>
        </>
      )}
    </div>
  );
}
