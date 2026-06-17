import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';

import { CanAccess } from '@/components/guards/CanAccess';
import { Button, Card, LoadingSpinner, PageHeader, StatCard, Tabs } from '@/components/ui';
import { StatusBadge } from '@/components/ui/Badge';
import { fieldStr, formatDateTime } from '@/lib/utils';
import { goLiveService } from '@/services/go-live.service';

import '../go-live.css';

type TabId =
  | 'executive'
  | 'launch'
  | 'war-room'
  | 'incidents'
  | 'traffic'
  | 'readiness'
  | 'checklist'
  | 'approvals'
  | 'reports';

const TABS: { id: TabId; label: string }[] = [
  { id: 'executive', label: 'Executive Dashboard' },
  { id: 'launch', label: 'Launch Dashboard' },
  { id: 'war-room', label: 'War Room' },
  { id: 'incidents', label: 'Incident Dashboard' },
  { id: 'traffic', label: 'Live Traffic' },
  { id: 'readiness', label: 'Readiness Dashboard' },
  { id: 'checklist', label: 'Go-Live Checklist' },
  { id: 'approvals', label: 'Release Dashboard' },
  { id: 'reports', label: 'Reports' },
];

const APPROVAL_LABELS: Record<string, string> = {
  QA: 'QA Approval',
  SECURITY: 'Security Approval',
  DEVOPS: 'DevOps Approval',
  PRODUCT: 'Product Approval',
  MANAGEMENT: 'Management Approval',
  FINAL_RELEASE: 'Final Release Approval',
};

const WORKFLOW_LABELS: Record<string, string> = {
  PRODUCTION_FREEZE: '1. Production Freeze',
  DATABASE_BACKUP: '2. Database Backup',
  RELEASE_DEPLOYMENT: '3. Release Deployment',
  HEALTH_VALIDATION: '4. Health Validation',
  SMOKE_TESTING: '5. Smoke Testing',
  BUSINESS_VALIDATION: '6. Business Validation',
  LAUNCH_APPROVAL: '7. Launch Approval',
  TRAFFIC_ENABLEMENT: '8. Traffic Enablement',
  COMPLETED: 'Completed',
};

export function GoLiveHubPage() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<TabId>('executive');

  const dashboard = useQuery({
    queryKey: ['go-live', 'dashboard'],
    queryFn: () => goLiveService.dashboard(),
    enabled: ['readiness', 'launch', 'approvals', 'executive'].includes(tab),
    refetchInterval: ['executive', 'launch', 'traffic'].includes(tab) ? 30_000 : false,
  });

  const status = useQuery({
    queryKey: ['go-live', 'status'],
    queryFn: () => goLiveService.status(),
    enabled: ['executive', 'launch', 'war-room', 'incidents', 'traffic', 'reports'].includes(tab),
    refetchInterval: ['executive', 'traffic'].includes(tab) ? 30_000 : false,
  });

  const warRoom = useQuery({
    queryKey: ['go-live', 'war-room'],
    queryFn: () => goLiveService.warRoom(),
    enabled: tab === 'war-room',
  });

  const metrics = useQuery({
    queryKey: ['go-live', 'metrics'],
    queryFn: () => goLiveService.metrics(),
    enabled: tab === 'traffic',
    refetchInterval: tab === 'traffic' ? 30_000 : false,
  });

  const checklist = useQuery({
    queryKey: ['go-live', 'checklist'],
    queryFn: () => goLiveService.checklist({ page: 1, limit: 100 }),
    enabled: tab === 'checklist',
  });

  const reports = useQuery({
    queryKey: ['go-live', 'reports'],
    queryFn: () => goLiveService.reports(),
    enabled: tab === 'reports',
  });

  const execReports = useQuery({
    queryKey: ['go-live', 'execution-reports'],
    queryFn: () => goLiveService.executionReports(),
    enabled: tab === 'reports',
  });

  const approveMut = useMutation({
    mutationFn: ({ launchId, type }: { launchId: string; type: string }) =>
      goLiveService.decideApproval(launchId, type, { status: 'APPROVED' }),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['go-live'] }),
  });

  const launchMut = useMutation({
    mutationFn: () => goLiveService.startLaunch({}),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['go-live'] }),
  });

  const advanceMut = useMutation({
    mutationFn: () => goLiveService.advanceWorkflow({}),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['go-live'] }),
  });

  const warRoomMut = useMutation({
    mutationFn: () => goLiveService.activateWarRoom({}),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['go-live'] }),
  });

  const metricsMut = useMutation({
    mutationFn: () => goLiveService.snapshotMetrics({}),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['go-live'] }),
  });

  const d = dashboard.data ?? {};
  const s = status.data ?? {};
  const readinessPct = Number(d.goLiveReadinessPercent ?? s.launchReadinessPercent ?? 0);
  const launchSuccessPct = Number(s.launchSuccessPercent ?? 0);
  const goLiveReady = Boolean(d.goLiveReady);
  const goLiveStatus = fieldStr(s, 'goLiveStatus') || 'PARTIAL SUCCESS';
  const dimensions = (d.dimensions ?? {}) as Record<string, number>;
  const sectionScores = (d.sectionScores ?? []) as { section: string; label: string; score: number; passed: number; total: number }[];
  const qualityGates = (d.qualityGates ?? []) as { gateCode?: string; label: string; passed?: boolean; status?: string; detail?: string }[];
  type ApprovalItem = { id: string; approvalType: string; status: string; approvedAt?: string };
  const approvalItems = ((d.approvals as { items?: ApprovalItem[] })?.items
    ?? (d.launchExecution as { approvals?: ApprovalItem[] })?.approvals
    ?? []) as ApprovalItem[];
  const launchExec = (d.launchExecution ?? s) as { id?: string; code?: string; status?: string; currentStep?: string };
  const launchId = launchExec?.id ?? fieldStr(s, 'launchId');
  const blockers = (d.blockers ?? []) as string[];
  const launchChecklists = (d.launchChecklists ?? {}) as Record<string, string[]>;
  const workflowSteps = (s.workflowSteps ?? []) as { step: string; label: string }[];
  const currentStep = fieldStr(launchExec, 'currentStep') || fieldStr(s, 'currentStep') || 'PRODUCTION_FREEZE';
  const incidents = (s.incidents ?? []) as Record<string, unknown>[];
  const events = (s.events ?? []) as Record<string, unknown>[];
  const preLaunch = (s.preLaunchValidation ?? []) as { id: string; label: string; passed: boolean }[];
  const successCriteria = (s.successCriteria ?? []) as { criterion: string; met: boolean }[];
  const metricItems = (metrics.data?.items ?? s.metrics ?? []) as Record<string, unknown>[];
  const warRoomData = warRoom.data ?? {};
  const warRoomSession = (warRoomData.session ?? {}) as Record<string, unknown>;
  const warRoomTeams = (warRoomData.teams ?? []) as { id: string; label: string; role?: string }[];

  const checklistItems = useMemo(() => {
    const items = (checklist.data?.items ?? []) as { section: string; itemCode: string; title: string; status: string }[];
    const bySection: Record<string, typeof items> = {};
    for (const item of items) {
      (bySection[item.section] ??= []).push(item);
    }
    return bySection;
  }, [checklist.data]);

  const verdictClass = goLiveStatus === 'SUCCESSFUL GO-LIVE' ? 'verdict-ready'
    : goLiveStatus === 'FAILED' ? 'verdict-blocked' : 'verdict-partial';

  if ((dashboard.isLoading && tab === 'readiness') || (status.isLoading && tab === 'executive')) {
    return <LoadingSpinner />;
  }

  return (
    <div className="go-live-hub">
      <PageHeader
        title="Go-Live Command Center"
        subtitle="KuberOne production launch execution — war room, workflow, incidents, traffic monitoring & executive oversight"
      />

      <div className={`verdict-banner ${verdictClass}`}>
        {goLiveStatus} — {readinessPct}% readiness · {launchSuccessPct}% launch success · {fieldStr(s, 'servicesHealthy') || '—'} services healthy
      </div>

      <Tabs tabs={TABS} active={tab} onChange={(id) => setTab(id as TabId)} />

      {tab === 'executive' && (
        <>
          <div className="readiness-grid">
            <StatCard label="Launch Readiness" value={`${readinessPct}%`} />
            <StatCard label="Launch Success" value={`${launchSuccessPct}%`} />
            <StatCard label="Services Healthy" value={fieldStr(s, 'servicesHealthy') || '—'} />
            <StatCard label="Incidents" value={String(s.incidentsDetected ?? incidents.length)} />
            <StatCard label="Open Incidents" value={String(s.openIncidents ?? 0)} />
            <StatCard label="Production Status" value={fieldStr(s, 'productionStatus') || launchExec.status || 'PLANNED'} />
          </div>
          <Card title="Success Criteria">
            <div className="criteria-grid">
              {successCriteria.map((c) => (
                <div key={c.criterion} className={`criteria-item ${c.met ? 'met' : 'pending'}`}>
                  {c.met ? '✓' : '○'} {c.criterion}
                </div>
              ))}
            </div>
          </Card>
          <Card title="Pre-Launch Validation">
            <div className="prelaunch-grid">
              {preLaunch.map((p) => (
                <div key={p.id} className={`prelaunch-item ${p.passed ? 'pass' : 'fail'}`}>
                  <StatusBadge status={p.passed ? 'PASSED' : 'PENDING'} />
                  <span>{p.label}</span>
                </div>
              ))}
            </div>
          </Card>
        </>
      )}

      {tab === 'launch' && (
        <>
          <Card title="Launch Workflow">
            <p>Current step: <strong>{WORKFLOW_LABELS[currentStep] ?? currentStep}</strong></p>
            <p className="text-muted">Status: <StatusBadge status={launchExec?.status || 'PLANNED'} /></p>
            <div className="workflow-steps">
              {workflowSteps.map((ws) => (
                <div key={ws.step} className={`workflow-step ${ws.step === currentStep ? 'active' : ''} ${workflowSteps.findIndex((w) => w.step === ws.step) < workflowSteps.findIndex((w) => w.step === currentStep) ? 'done' : ''}`}>
                  {WORKFLOW_LABELS[ws.step] ?? ws.label}
                </div>
              ))}
            </div>
            <CanAccess permission={['launch.manage', 'golive.manage']}>
              <div className="flex gap-2 mt-4 flex-wrap">
                <Button type="button" variant="primary" disabled={!goLiveReady || launchMut.isPending} onClick={() => launchMut.mutate()}>
                  Start Launch
                </Button>
                <Button type="button" variant="secondary" disabled={advanceMut.isPending} onClick={() => advanceMut.mutate()}>
                  Advance Step
                </Button>
              </div>
            </CanAccess>
          </Card>

          <Card title="Recent Launch Events">
            {events.slice(0, 8).map((e) => (
              <div key={fieldStr(e, 'id')} className="event-row">
                <strong>{fieldStr(e, 'title')}</strong>
                <span className="text-muted text-sm">{formatDateTime(fieldStr(e, 'createdAt'))}</span>
              </div>
            ))}
            {events.length === 0 && <p className="text-muted">No events yet.</p>}
          </Card>

          {(['preLaunch', 'launch', 'postLaunch'] as const).map((key) => (
            <Card key={key} title={key.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase())} className="launch-checklist">
              <ul>{(launchChecklists[key] ?? []).map((item) => <li key={item}>{item}</li>)}</ul>
            </Card>
          ))}
        </>
      )}

      {tab === 'war-room' && (
        <>
          <Card title="War Room Session">
            <p>Code: {fieldStr(warRoomSession, 'code') || `WR-${launchExec.code ?? 'GO-LIVE-KUBERONE-V1'}`}</p>
            <p>Status: <StatusBadge status={fieldStr(warRoomSession, 'status') || 'STANDBY'} /></p>
            <p className="text-muted">Bridge: {fieldStr(warRoomSession, 'bridgeUrl') || 'https://bridge.kuberone.com/go-live'}</p>
            <CanAccess permission={['launch.manage', 'golive.manage']}>
              <Button type="button" variant="primary" disabled={warRoomMut.isPending} onClick={() => warRoomMut.mutate()}>
                Activate War Room
              </Button>
            </CanAccess>
          </Card>
          <Card title="Launch Teams">
            <div className="war-room-teams">
              {warRoomTeams.map((t) => (
                <div key={t.id} className="war-room-team-card">
                  <h4>{t.label}</h4>
                  <p>{t.role ?? '—'}</p>
                </div>
              ))}
            </div>
          </Card>
          <Card title="Communication Matrix">
            <ul>{(launchChecklists.warRoom ?? []).map((item) => <li key={item}>{item}</li>)}</ul>
          </Card>
        </>
      )}

      {tab === 'incidents' && (
        <Card title="Incident Dashboard">
          {incidents.map((inc) => (
            <div key={fieldStr(inc, 'id')} className="incident-row">
              <div>
                <strong>{fieldStr(inc, 'code')} — {fieldStr(inc, 'title')}</strong>
                <div className="text-sm">
                  <StatusBadge status={fieldStr(inc, 'severity')} /> · <StatusBadge status={fieldStr(inc, 'status')} />
                </div>
                <p className="text-sm mt-1">{fieldStr(inc, 'description')}</p>
              </div>
            </div>
          ))}
          {incidents.length === 0 && <p className="text-muted">No launch incidents detected.</p>}
        </Card>
      )}

      {tab === 'traffic' && (
        <>
          <CanAccess permission={['launch.manage', 'golive.manage']}>
            <Button type="button" variant="secondary" className="mb-4" disabled={metricsMut.isPending} onClick={() => metricsMut.mutate()}>
              Snapshot Metrics
            </Button>
          </CanAccess>
          <div className="readiness-grid">
            {metricItems.slice(0, 8).map((m) => (
              <StatCard
                key={fieldStr(m, 'id') || fieldStr(m, 'name')}
                label={fieldStr(m, 'name')}
                value={`${fieldStr(m, 'value')}${fieldStr(m, 'unit') ? ` ${fieldStr(m, 'unit')}` : ''}`}
              />
            ))}
          </div>
          {metricItems.length === 0 && (
            <Card title="Live Traffic">
              <p className="text-muted">No metrics recorded. Click Snapshot Metrics to capture traffic data.</p>
            </Card>
          )}
        </>
      )}

      {tab === 'readiness' && (
        <>
          <div className="readiness-grid">
            <StatCard label="Go-Live Readiness" value={`${readinessPct}%`} />
            <StatCard label="Backend" value={`${dimensions.backend ?? 0}%`} />
            <StatCard label="CRM" value={`${dimensions.crm ?? 0}%`} />
            <StatCard label="Customer App" value={`${dimensions.customerApp ?? 0}%`} />
            <StatCard label="DSA App" value={`${dimensions.dsaApp ?? 0}%`} />
            <StatCard label="Security" value={`${dimensions.security ?? 0}%`} />
            <StatCard label="Infrastructure" value={`${dimensions.infrastructure ?? 0}%`} />
          </div>
          <Card title="Section Scores">
            <div className="section-scores">
              {sectionScores.map((sec) => (
                <div key={sec.section} className="section-score-card">
                  <strong>{sec.label}</strong>
                  <div>{sec.score}% · {sec.passed}/{sec.total} passed</div>
                </div>
              ))}
            </div>
          </Card>
          <Card title="Quality Gates">
            {qualityGates.map((g) => (
              <div key={g.gateCode ?? g.label} className="gate-row">
                <StatusBadge status={g.passed || g.status === 'PASSED' ? 'success' : 'danger'} />
                <span>{g.label}</span>
                <span className="text-muted">{g.detail}</span>
              </div>
            ))}
          </Card>
          {blockers.length > 0 && (
            <Card title="Blockers">
              <ul>{blockers.map((b) => <li key={b}>{b}</li>)}</ul>
            </Card>
          )}
        </>
      )}

      {tab === 'checklist' && (
        <>
          {checklist.isLoading && <LoadingSpinner />}
          {Object.entries(checklistItems).map(([section, items]) => (
            <Card key={section} title={section.replace(/_/g, ' ')} className="checklist-section">
              {items.map((item) => (
                <div key={item.itemCode} className="approval-row">
                  <span>{item.title}</span>
                  <StatusBadge status={item.status === 'PASSED' ? 'success' : item.status === 'FAILED' ? 'danger' : 'warning'} />
                </div>
              ))}
            </Card>
          ))}
        </>
      )}

      {tab === 'approvals' && (
        <Card title="Release Approval Workflow">
          {approvalItems.map((a) => (
            <div key={a.id} className="approval-row">
              <div>
                <strong>{APPROVAL_LABELS[a.approvalType] ?? a.approvalType}</strong>
                {a.approvedAt && <div className="text-muted">{formatDateTime(a.approvedAt)}</div>}
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <StatusBadge status={a.status === 'APPROVED' ? 'success' : a.status === 'REJECTED' ? 'danger' : 'warning'} />
                {a.status === 'PENDING' && launchId && (
                  <CanAccess permission={['launch.approve', 'golive.approve', 'release.approve']}>
                    <Button type="button" variant="secondary" size="sm" disabled={approveMut.isPending} onClick={() => approveMut.mutate({ launchId, type: a.approvalType })}>
                      Approve
                    </Button>
                  </CanAccess>
                )}
              </div>
            </div>
          ))}
        </Card>
      )}

      {tab === 'reports' && (
        <>
          {reports.isLoading && execReports.isLoading && <LoadingSpinner />}
          <div className="readiness-grid">
            {(['readinessReport', 'approvalReport', 'releaseReport', 'riskReport'] as const).map((key) => {
              const r = (reports.data as Record<string, unknown> | undefined)?.[key] as Record<string, unknown> | undefined;
              if (!r) return null;
              return (
                <Card key={key} title={String(r.reportType ?? key)}>
                  <StatCard label="Score" value={`${r.score ?? 0}%`} />
                  <p>{String(r.summary ?? '')}</p>
                </Card>
              );
            })}
          </div>
          {execReports.data && (
            <Card title="Execution Reports" className="mt-4">
              <pre className="text-xs overflow-auto max-h-64">{JSON.stringify(execReports.data, null, 2)}</pre>
            </Card>
          )}
          <Button type="button" variant="secondary" onClick={() => void reports.refetch()}>Regenerate Reports</Button>
        </>
      )}
    </div>
  );
}
