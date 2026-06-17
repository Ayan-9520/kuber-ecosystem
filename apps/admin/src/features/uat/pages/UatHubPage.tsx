import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';

import { PaginatedListView } from '@/components/common/PaginatedListView';
import { CanAccess } from '@/components/guards/CanAccess';
import { Button, Card, LoadingSpinner, PageHeader, StatCard, Tabs } from '@/components/ui';
import { StatusBadge } from '@/components/ui/Badge';
import { useDebounce, usePagination } from '@/hooks';
import { fieldStr, formatDateTime } from '@/lib/utils';
import { uatService } from '@/services/uat.service';

import '../uat.css';

type TabId =
  | 'dashboard'
  | 'final-signoff'
  | 'stakeholders'
  | 'approvals'
  | 'reviews'
  | 'risks'
  | 'plans'
  | 'scenarios'
  | 'execution'
  | 'defects'
  | 'signoffs'
  | 'reports'
  | 'templates';

const TABS: { id: TabId; label: string }[] = [
  { id: 'dashboard', label: 'Readiness Dashboard' },
  { id: 'final-signoff', label: 'Signoff Dashboard' },
  { id: 'stakeholders', label: 'Stakeholder Dashboard' },
  { id: 'approvals', label: 'Approval Center' },
  { id: 'reviews', label: 'Review Dashboard' },
  { id: 'risks', label: 'Risk Register' },
  { id: 'plans', label: 'Plans & Cycles' },
  { id: 'scenarios', label: 'Test Case Manager' },
  { id: 'execution', label: 'Execution' },
  { id: 'defects', label: 'Defect Tracking' },
  { id: 'signoffs', label: 'Legacy Signoffs' },
  { id: 'reports', label: 'Reports' },
  { id: 'templates', label: 'Templates' },
];

const BUSINESS_FLOWS = [
  '', 'AUTH', 'CUSTOMER', 'DSA', 'LMS', 'LOS', 'DOCUMENT',
  'REFERRAL', 'COMMISSION', 'SUPPORT', 'CAMPAIGN', 'AI', 'ANALYTICS',
];

const TEST_TYPES = ['', 'POSITIVE', 'NEGATIVE', 'BOUNDARY', 'BUSINESS_RULE', 'EXCEPTION'];
const DEFECT_SEVERITIES = ['', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];
const EXEC_STATUSES = ['', 'NOT_STARTED', 'IN_PROGRESS', 'PASSED', 'FAILED', 'BLOCKED', 'SKIPPED'];

function pct(val: unknown): string {
  const n = Number(val);
  return Number.isFinite(n) ? `${n.toFixed(1)}%` : '—';
}

export function UatHubPage() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<TabId>('dashboard');
  const [search, setSearch] = useState('');
  const [businessFlow, setBusinessFlow] = useState('');
  const [testType, setTestType] = useState('');
  const [defectSeverity, setDefectSeverity] = useState('');
  const [execStatus, setExecStatus] = useState('');
  const [selectedCycleId, setSelectedCycleId] = useState('');
  const debouncedSearch = useDebounce(search);
  const { page, limit, setPage, reset } = usePagination();

  useEffect(() => {
    reset();
  }, [tab, debouncedSearch, businessFlow, testType, defectSeverity, execStatus, reset]);

  const dashParams = useMemo(
    () => ({ period: 'month', ...(selectedCycleId ? { cycleId: selectedCycleId } : {}) }),
    [selectedCycleId],
  );

  const dashboard = useQuery({
    queryKey: ['uat', 'dashboard', dashParams],
    queryFn: () => uatService.dashboard(dashParams),
    enabled: ['dashboard', 'reports'].includes(tab),
  });

  const cycles = useQuery({
    queryKey: ['uat', 'cycles', { limit: 20 }],
    queryFn: () => uatService.cycles({ limit: 20, sortBy: 'createdAt', sortOrder: 'desc' }),
    enabled: true,
  });

  const cycleItems = (cycles.data?.items ?? []) as Record<string, unknown>[];
  const activeCycleId = selectedCycleId || fieldStr(cycleItems[0] ?? {}, 'id');

  const readiness = useQuery({
    queryKey: ['uat', 'readiness', activeCycleId],
    queryFn: () => uatService.readiness(activeCycleId),
    enabled: !!activeCycleId && ['dashboard', 'signoffs', 'reports'].includes(tab),
  });

  const qualityGates = useQuery({
    queryKey: ['uat', 'quality-gates', activeCycleId],
    queryFn: () => uatService.qualityGates(activeCycleId),
    enabled: !!activeCycleId && tab === 'dashboard',
  });

  const listParams = useMemo(
    () => ({
      page,
      limit,
      search: debouncedSearch || undefined,
      cycleId: activeCycleId || undefined,
      businessFlow: businessFlow || undefined,
      testType: testType || undefined,
      severity: defectSeverity || undefined,
      status: execStatus || undefined,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    }),
    [page, limit, debouncedSearch, activeCycleId, businessFlow, testType, defectSeverity, execStatus],
  );

  const plans = useQuery({
    queryKey: ['uat', 'plans', listParams],
    queryFn: () => uatService.plans(listParams),
    enabled: tab === 'plans',
  });

  const scenarios = useQuery({
    queryKey: ['uat', 'scenarios', listParams],
    queryFn: () => uatService.scenarios(listParams),
    enabled: tab === 'scenarios',
  });

  const testCases = useQuery({
    queryKey: ['uat', 'test-cases', listParams],
    queryFn: () => uatService.testCases(listParams),
    enabled: tab === 'scenarios',
  });

  const executions = useQuery({
    queryKey: ['uat', 'executions', listParams],
    queryFn: () => uatService.executions(listParams),
    enabled: tab === 'execution',
  });

  const defects = useQuery({
    queryKey: ['uat', 'defects', listParams],
    queryFn: () => uatService.defects(listParams),
    enabled: tab === 'defects',
  });

  const signoffs = useQuery({
    queryKey: ['uat', 'signoffs', { cycleId: activeCycleId }],
    queryFn: () => uatService.signoffs({ cycleId: activeCycleId, limit: 20 }),
    enabled: tab === 'signoffs' && !!activeCycleId,
  });

  const finalStatus = useQuery({
    queryKey: ['uat', 'status', activeCycleId],
    queryFn: () => uatService.status({ cycleId: activeCycleId }),
    enabled: !!activeCycleId && ['final-signoff', 'stakeholders', 'approvals', 'reviews', 'risks', 'reports'].includes(tab),
    refetchInterval: tab === 'final-signoff' ? 60_000 : false,
  });

  const approvalsList = useQuery({
    queryKey: ['uat', 'approvals', { cycleId: activeCycleId }],
    queryFn: () => uatService.approvals({ cycleId: activeCycleId, limit: 50 }),
    enabled: tab === 'approvals' && !!activeCycleId,
  });

  const risksList = useQuery({
    queryKey: ['uat', 'risks', { cycleId: activeCycleId }],
    queryFn: () => uatService.risks({ cycleId: activeCycleId, limit: 50 }),
    enabled: tab === 'risks' && !!activeCycleId,
  });

  const finalReports = useQuery({
    queryKey: ['uat', 'final-reports', activeCycleId],
    queryFn: () => uatService.reports.finalSignoff({ cycleId: activeCycleId }),
    enabled: tab === 'reports' && !!activeCycleId,
  });

  const templates = useQuery({
    queryKey: ['uat', 'templates', listParams],
    queryFn: () => uatService.templates(listParams),
    enabled: tab === 'templates',
  });

  const summaryReport = useQuery({
    queryKey: ['uat', 'report-summary', activeCycleId],
    queryFn: () => uatService.reports.summary({ cycleId: activeCycleId }),
    enabled: tab === 'reports' && !!activeCycleId,
  });

  const executeMut = useMutation({
    mutationFn: (data: unknown) => uatService.executeTestCase(data),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['uat'] }),
  });

  const signoffMut = useMutation({
    mutationFn: (data: unknown) => uatService.submitSignoff(data),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['uat'] }),
  });

  const approvalMut = useMutation({
    mutationFn: (data: unknown) => uatService.submitApproval(data),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['uat'] }),
  });

  const reviewMut = useMutation({
    mutationFn: (data: unknown) => uatService.updateReview(data),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['uat'] }),
  });

  const summary = (dashboard.data?.summary ?? {}) as Record<string, unknown>;
  const moduleCoverage = (dashboard.data?.moduleCoverage ?? []) as Record<string, unknown>[];
  const readinessData = (readiness.data ?? {}) as Record<string, unknown>;
  const qgData = (qualityGates.data ?? {}) as Record<string, unknown>;
  const qgBlockers = (qgData.blockers ?? []) as string[];

  const planColumns = [
    { key: 'code', header: 'Code', render: (r: Record<string, unknown>) => fieldStr(r, 'code') },
    { key: 'name', header: 'Plan', render: (r: Record<string, unknown>) => fieldStr(r, 'name') },
    { key: 'status', header: 'Status', render: (r: Record<string, unknown>) => <StatusBadge status={fieldStr(r, 'status')} /> },
    { key: 'version', header: 'Version', render: (r: Record<string, unknown>) => fieldStr(r, 'version') },
    { key: 'createdAt', header: 'Created', render: (r: Record<string, unknown>) => formatDateTime(fieldStr(r, 'createdAt')) },
  ];

  const scenarioColumns = [
    { key: 'code', header: 'Code', render: (r: Record<string, unknown>) => fieldStr(r, 'code') },
    { key: 'name', header: 'Scenario', render: (r: Record<string, unknown>) => fieldStr(r, 'name') },
    { key: 'businessFlow', header: 'Flow', render: (r: Record<string, unknown>) => fieldStr(r, 'businessFlow') },
    { key: 'userGroup', header: 'User Group', render: (r: Record<string, unknown>) => fieldStr(r, 'userGroup') },
    { key: 'priority', header: 'Priority', render: (r: Record<string, unknown>) => fieldStr(r, 'priority') },
  ];

  const testCaseColumns = [
    { key: 'code', header: 'Code', render: (r: Record<string, unknown>) => fieldStr(r, 'code') },
    { key: 'title', header: 'Test Case', render: (r: Record<string, unknown>) => fieldStr(r, 'title') },
    { key: 'testType', header: 'Type', render: (r: Record<string, unknown>) => <StatusBadge status={fieldStr(r, 'testType')} /> },
    { key: 'priority', header: 'Priority', render: (r: Record<string, unknown>) => fieldStr(r, 'priority') },
  ];

  const executionColumns = [
    { key: 'testCase', header: 'Test Case', render: (r: Record<string, unknown>) => {
      const tc = r.testCase as Record<string, unknown> | undefined;
      return fieldStr(tc ?? {}, 'title') || fieldStr(tc ?? {}, 'code');
    }},
    { key: 'status', header: 'Status', render: (r: Record<string, unknown>) => <StatusBadge status={fieldStr(r, 'status')} /> },
    { key: 'executedBy', header: 'Executed By', render: (r: Record<string, unknown>) => {
      const u = r.executedBy as Record<string, unknown> | undefined;
      return fieldStr(u ?? {}, 'email') || '—';
    }},
    { key: 'executedAt', header: 'Executed At', render: (r: Record<string, unknown>) => formatDateTime(fieldStr(r, 'executedAt')) || '—' },
    {
      key: 'actions',
      header: 'Actions',
      render: (r: Record<string, unknown>) => {
        const tc = r.testCase as Record<string, unknown> | undefined;
        const testCaseId = fieldStr(tc ?? {}, 'id') || fieldStr(r, 'testCaseId');
        if (!testCaseId || !activeCycleId) return null;
        return (
          <CanAccess permission={['uat.execute']}>
            <div className="flex gap-1">
              <Button size="sm" variant="secondary" onClick={() => executeMut.mutate({ cycleId: activeCycleId, testCaseId, status: 'PASSED' })}>Pass</Button>
              <Button size="sm" variant="ghost" onClick={() => executeMut.mutate({ cycleId: activeCycleId, testCaseId, status: 'FAILED' })}>Fail</Button>
            </div>
          </CanAccess>
        );
      },
    },
  ];

  const defectColumns = [
    { key: 'code', header: 'Code', render: (r: Record<string, unknown>) => fieldStr(r, 'code') },
    { key: 'title', header: 'Defect', render: (r: Record<string, unknown>) => fieldStr(r, 'title') },
    { key: 'severity', header: 'Severity', render: (r: Record<string, unknown>) => <StatusBadge status={fieldStr(r, 'severity')} /> },
    { key: 'status', header: 'Status', render: (r: Record<string, unknown>) => <StatusBadge status={fieldStr(r, 'status')} /> },
    { key: 'businessFlow', header: 'Flow', render: (r: Record<string, unknown>) => fieldStr(r, 'businessFlow') || '—' },
    { key: 'createdAt', header: 'Reported', render: (r: Record<string, unknown>) => formatDateTime(fieldStr(r, 'createdAt')) },
  ];

  const signoffItems = (signoffs.data?.items ?? []) as Record<string, unknown>[];

  const statusData = (finalStatus.data ?? {}) as Record<string, unknown>;
  const scores = (statusData.scores ?? {}) as Record<string, number>;
  const certification = (statusData.certification ?? {}) as Record<string, number>;
  const gateResult = (statusData.gates ?? {}) as Record<string, unknown>;
  const gateItems = (gateResult.gates ?? []) as { label: string; passed?: boolean; detail?: string }[];
  const gateBlockers = (gateResult.blockers ?? []) as string[];
  const canSignoff = Boolean(gateResult.canApproveFinalSignoff ?? statusData.canSignoff);
  const stakeholderItems = (statusData.stakeholders ?? []) as Record<string, unknown>[];
  const approvalItems = (statusData.approvals ?? approvalsList.data?.items ?? []) as Record<string, unknown>[];
  const reviewItems = (statusData.reviews ?? []) as Record<string, unknown>[];
  const riskItems = (risksList.data?.items ?? statusData.risks ?? []) as Record<string, unknown>[];
  const finalUatStatus = fieldStr(statusData, 'finalUatStatus') || 'NOT APPROVED';
  const launchAuth = fieldStr(statusData, 'launchAuthorizationStatus') || 'NOT AUTHORIZED';
  const goLivePct = Number(scores.goLiveApprovalPercent ?? 0);

  if (dashboard.isLoading && tab === 'dashboard') {
    return <LoadingSpinner />;
  }

  return (
    <div className="uat-hub">
      <PageHeader
        title="UAT Signoff Framework"
        subtitle="KuberOne Final UAT — business approval, stakeholder signoff, quality gates & go-live authorization"
        actions={
          <select
            className="form-select"
            value={activeCycleId}
            onChange={(e) => setSelectedCycleId(e.target.value)}
            aria-label="Select UAT cycle"
          >
            {cycleItems.map((c) => (
              <option key={fieldStr(c, 'id')} value={fieldStr(c, 'id')}>
                {fieldStr(c, 'name')} ({fieldStr(c, 'code')})
              </option>
            ))}
          </select>
        }
      />

      <Tabs tabs={TABS} active={tab} onChange={(id) => setTab(id as TabId)} />

      {tab === 'dashboard' && (
        <>
          <div className="uat-readiness-bar">
            <span className={`uat-readiness-pill ${Number(summary.businessCoveragePercent) >= 100 ? 'ready' : ''}`}>
              Business Coverage: {pct(summary.businessCoveragePercent)}
            </span>
            <span className="uat-readiness-pill">
              Modules: {fieldStr(summary, 'modulesCovered')}/{fieldStr(summary, 'totalModules')}
            </span>
            <span className="uat-readiness-pill">
              Scenarios: {fieldStr(summary, 'totalScenarios')}
            </span>
            <span className="uat-readiness-pill">
              Test Cases: {fieldStr(summary, 'totalTestCases')}
            </span>
            <span className={`uat-readiness-pill ${Number(summary.signoffReadinessPercent) >= 100 ? 'ready' : ''}`}>
              Signoff Readiness: {pct(summary.signoffReadinessPercent)}
            </span>
            <span className={`uat-readiness-pill ${readinessData.goLiveReady ? 'ready' : 'blocked'}`}>
              Go-Live Readiness: {pct(readinessData.goLiveReadinessPercent ?? summary.goLiveReadinessPercent)}
            </span>
          </div>

          <div className="stat-grid">
            <StatCard label="UAT Plans" value={fieldStr(summary, 'totalPlans')} />
            <StatCard label="UAT Cycles" value={fieldStr(summary, 'totalCycles')} />
            <StatCard label="Executions" value={fieldStr(summary, 'totalExecutions')} />
            <StatCard label="Open Defects" value={fieldStr(summary, 'openDefects')} />
          </div>

          <div className={`uat-quality-gate ${qgData.canSignoff ? 'pass' : 'fail'}`}>
            <strong>Quality Gates</strong>
            <p className="text-sm mt-1 mb-0">
              Critical defects: {fieldStr(qgData, 'criticalDefects')} / {fieldStr(qgData, 'maxCritical')} max
              {' · '}
              High defects: {fieldStr(qgData, 'highDefects')} / {fieldStr(qgData, 'maxHigh')} max
            </p>
            {qgBlockers.length > 0 && (
              <ul className="text-sm mt-2 mb-0">
                {qgBlockers.map((b) => <li key={b}>{b}</li>)}
              </ul>
            )}
            {qgBlockers.length === 0 && <p className="text-sm mt-1 mb-0 text-green-700">All quality gates passed.</p>}
          </div>

          <Card className="mt-4" title="Module Coverage">
            <div className="uat-flow-grid">
              {moduleCoverage.map((m) => (
                <div key={fieldStr(m, 'businessFlow')} className="uat-flow-card">
                  <h4>{fieldStr(m, 'businessFlow')}</h4>
                  <p>{fieldStr(m, 'scenarios')} scenarios · {fieldStr(m, 'testCases')} cases</p>
                  <p>Coverage: {pct(m.coveragePercent)}</p>
                </div>
              ))}
            </div>
          </Card>
        </>
      )}

      {tab === 'final-signoff' && (
        <>
          <div className={`uat-verdict-banner ${finalUatStatus === 'APPROVED FOR GO-LIVE' ? 'approved' : finalUatStatus === 'PARTIALLY APPROVED' ? 'partial' : 'blocked'}`}>
            {finalUatStatus} — {goLivePct}% Go-Live Approval · Launch: {launchAuth}
          </div>
          <div className="stat-grid">
            <StatCard label="Business Approval" value={`${scores.businessApprovalPercent ?? certification.business ?? 0}%`} />
            <StatCard label="Technology Approval" value={`${scores.technologyApprovalPercent ?? certification.technology ?? 0}%`} />
            <StatCard label="Operations Approval" value={`${scores.operationsApprovalPercent ?? certification.operations ?? 0}%`} />
            <StatCard label="Security Approval" value={`${scores.securityApprovalPercent ?? certification.security ?? 0}%`} />
            <StatCard label="Management Approval" value={`${scores.managementApprovalPercent ?? certification.management ?? 0}%`} />
            <StatCard label="Go-Live Approval" value={`${goLivePct}%`} />
          </div>
          <Card title="Quality Gates — Final Signoff">
            <div className={`uat-quality-gate ${canSignoff ? 'pass' : 'fail'}`}>
              {(Array.isArray(gateItems) ? gateItems : []).map((g) => (
                <div key={g.label} className="flex justify-between text-sm py-1 border-b">
                  <span>{g.label}</span>
                  <StatusBadge status={g.passed ? 'APPROVED' : 'REJECTED'} />
                </div>
              ))}
              {gateBlockers.length > 0 && (
                <ul className="text-sm mt-2 mb-0">
                  {gateBlockers.map((b) => <li key={b}>{b}</li>)}
                </ul>
              )}
            </div>
          </Card>
          <Card className="mt-4" title="Final Certification">
            <div className="uat-cert-grid">
              {(['Business', 'Technology', 'Operations', 'Security', 'Management'] as const).map((label) => {
                const key = label.toLowerCase() as keyof typeof certification;
                const pctVal = certification[key] ?? scores[`${key}ApprovalPercent` as keyof typeof scores] ?? 0;
                return (
                  <div key={label} className={`uat-cert-card ${Number(pctVal) >= 100 ? 'approved' : Number(pctVal) >= 50 ? 'partial' : 'pending'}`}>
                    <h4>{label} Approved</h4>
                    <p>{pctVal}%</p>
                  </div>
                );
              })}
            </div>
          </Card>
        </>
      )}

      {tab === 'stakeholders' && (
        <Card title="Stakeholder Groups">
          <div className="uat-stakeholder-grid">
            {stakeholderItems.map((s) => {
              const group = fieldStr(s, 'stakeholderGroup');
              const approval = approvalItems.find((a) => {
                const sh = a.stakeholder as Record<string, unknown> | undefined;
                return fieldStr(sh ?? a, 'stakeholderGroup') === group || fieldStr(a, 'stakeholderId') === fieldStr(s, 'id');
              });
              return (
                <div key={fieldStr(s, 'id')} className="uat-stakeholder-card">
                  <h4>{fieldStr(s, 'label')}</h4>
                  <p>{fieldStr(s, 'department')}</p>
                  <StatusBadge status={fieldStr(approval ?? {}, 'stage') || 'PENDING'} />
                  {fieldStr(approval ?? {}, 'approverName') && (
                    <p className="text-xs text-muted mt-1">
                      {fieldStr(approval ?? {}, 'approverName')} · {formatDateTime(fieldStr(approval ?? {}, 'approvedAt'))}
                    </p>
                  )}
                </div>
              );
            })}
            {stakeholderItems.length === 0 && <p className="text-muted">No stakeholders configured. Run database seed.</p>}
          </div>
        </Card>
      )}

      {tab === 'approvals' && (
        <Card title="Digital Signoff — Approval Center">
          <div className="space-y-3">
            {approvalItems.map((a) => {
              const sh = (a.stakeholder ?? {}) as Record<string, unknown>;
              return (
                <div key={fieldStr(a, 'id')} className="uat-approval-row">
                  <div>
                    <strong>{fieldStr(sh, 'label') || fieldStr(a, 'stakeholderGroup')}</strong>
                    <div className="text-sm text-muted">
                      Role: {fieldStr(a, 'approverRole') || '—'} · Dept: {fieldStr(a, 'department') || fieldStr(sh, 'department') || '—'}
                    </div>
                    <div className="text-sm">
                      Status: <StatusBadge status={fieldStr(a, 'stage')} />
                      {fieldStr(a, 'approvedAt') && ` · ${formatDateTime(fieldStr(a, 'approvedAt'))}`}
                    </div>
                    {fieldStr(a, 'comments') && <p className="text-sm mt-1">{fieldStr(a, 'comments')}</p>}
                  </div>
                  <CanAccess permission={['uat.signoff']}>
                    {fieldStr(a, 'stage') !== 'APPROVED' && activeCycleId && (
                      <div className="flex gap-2 flex-wrap">
                        <Button size="sm" onClick={() => approvalMut.mutate({
                          cycleId: activeCycleId,
                          stakeholderId: fieldStr(a, 'stakeholderId'),
                          stage: 'APPROVED',
                          approverRole: fieldStr(sh, 'label'),
                          department: fieldStr(sh, 'department'),
                        })}>
                          Approve
                        </Button>
                        <Button size="sm" variant="secondary" onClick={() => approvalMut.mutate({
                          cycleId: activeCycleId,
                          stakeholderId: fieldStr(a, 'stakeholderId'),
                          stage: 'REWORK_REQUIRED',
                        })}>
                          Rework
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => approvalMut.mutate({
                          cycleId: activeCycleId,
                          stakeholderId: fieldStr(a, 'stakeholderId'),
                          stage: 'REJECTED',
                        })}>
                          Reject
                        </Button>
                      </div>
                    )}
                  </CanAccess>
                </div>
              );
            })}
            {approvalItems.length === 0 && <p className="text-muted">No approvals pending configuration.</p>}
          </div>
        </Card>
      )}

      {tab === 'reviews' && (
        <Card title="Review Dashboard — Signoff Areas">
          <div className="space-y-3">
            {reviewItems.map((r) => (
              <div key={fieldStr(r, 'id')} className="uat-review-row">
                <div>
                  <strong>{fieldStr(r, 'reviewArea')}</strong>
                  <div className="text-sm">
                    Score: {fieldStr(r, 'score')}% · <StatusBadge status={fieldStr(r, 'stage')} />
                  </div>
                  {Array.isArray(r.checklist) && (
                    <ul className="text-xs mt-1 columns-2">
                      {(r.checklist as { item: string; checked?: boolean }[]).slice(0, 8).map((c) => (
                        <li key={c.item}>{c.checked ? '✓' : '○'} {c.item}</li>
                      ))}
                    </ul>
                  )}
                </div>
                <CanAccess permission={['uat.review']}>
                  {fieldStr(r, 'stage') !== 'APPROVED' && activeCycleId && (
                    <Button size="sm" onClick={() => reviewMut.mutate({
                      cycleId: activeCycleId,
                      reviewArea: fieldStr(r, 'reviewArea'),
                      stage: 'APPROVED',
                      score: 100,
                    })}>
                      Mark Approved
                    </Button>
                  )}
                </CanAccess>
              </div>
            ))}
            {reviewItems.length === 0 && <p className="text-muted">No review areas configured.</p>}
          </div>
        </Card>
      )}

      {tab === 'risks' && (
        <Card title="Risk Register">
          <div className="space-y-3">
            {riskItems.map((r) => (
              <div key={fieldStr(r, 'id')} className="uat-risk-row">
                <div>
                  <strong>{fieldStr(r, 'code')} — {fieldStr(r, 'title')}</strong>
                  <div className="text-sm">
                    <StatusBadge status={fieldStr(r, 'severity')} /> · <StatusBadge status={fieldStr(r, 'status')} />
                    {fieldStr(r, 'reviewArea') && ` · ${fieldStr(r, 'reviewArea')}`}
                  </div>
                  <p className="text-sm mt-1">{fieldStr(r, 'description')}</p>
                </div>
              </div>
            ))}
            {riskItems.length === 0 && <p className="text-muted">No risks registered.</p>}
          </div>
        </Card>
      )}

      {tab === 'plans' && (
        <PaginatedListView
          search={search}
          onSearchChange={setSearch}
          columns={planColumns}
          data={plans.data?.items ?? []}
          meta={plans.data?.meta}
          isLoading={plans.isLoading}
          onPageChange={setPage}
          emptyTitle="No UAT plans"
        />
      )}

      {tab === 'scenarios' && (
        <>
          <div className="flex gap-2 mb-4 flex-wrap">
            <select className="form-select" value={businessFlow} onChange={(e) => setBusinessFlow(e.target.value)}>
              <option value="">All Flows</option>
              {BUSINESS_FLOWS.filter(Boolean).map((f) => <option key={f} value={f}>{f}</option>)}
            </select>
            <select className="form-select" value={testType} onChange={(e) => setTestType(e.target.value)}>
              <option value="">All Types</option>
              {TEST_TYPES.filter(Boolean).map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <PaginatedListView
            search={search}
            onSearchChange={setSearch}
            columns={scenarioColumns}
            data={scenarios.data?.items ?? []}
            meta={scenarios.data?.meta}
            isLoading={scenarios.isLoading}
            onPageChange={setPage}
            emptyTitle="No scenarios"
          />
          <div className="mt-6">
            <PaginatedListView
              search={search}
              onSearchChange={setSearch}
              columns={testCaseColumns}
              data={testCases.data?.items ?? []}
              meta={testCases.data?.meta}
              isLoading={testCases.isLoading}
              onPageChange={setPage}
              emptyTitle="No test cases"
            />
          </div>
        </>
      )}

      {tab === 'execution' && (
        <PaginatedListView
          search={search}
          onSearchChange={setSearch}
          columns={executionColumns}
          data={executions.data?.items ?? []}
          meta={executions.data?.meta}
          isLoading={executions.isLoading}
          onPageChange={setPage}
          emptyTitle="No executions"
          filters={
            <select value={execStatus} onChange={(e) => setExecStatus(e.target.value)}>
              <option value="">All Statuses</option>
              {EXEC_STATUSES.filter(Boolean).map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          }
        />
      )}

      {tab === 'defects' && (
        <PaginatedListView
          search={search}
          onSearchChange={setSearch}
          columns={defectColumns}
          data={defects.data?.items ?? []}
          meta={defects.data?.meta}
          isLoading={defects.isLoading}
          onPageChange={setPage}
          emptyTitle="No defects"
          filters={
            <select value={defectSeverity} onChange={(e) => setDefectSeverity(e.target.value)}>
              <option value="">All Severities</option>
              {DEFECT_SEVERITIES.filter(Boolean).map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          }
        />
      )}

      {tab === 'signoffs' && (
        <Card title="Signoff Dashboard">
          <div className="space-y-3">
            {signoffItems.map((s) => (
              <div key={fieldStr(s, 'id')} className="flex items-center justify-between border-b pb-3">
                <div>
                  <strong>{fieldStr(s, 'signoffType')}</strong>
                  <div className="text-sm text-muted">
                    Status: <StatusBadge status={fieldStr(s, 'status')} />
                    {fieldStr(s, 'signedAt') && ` · Signed ${formatDateTime(fieldStr(s, 'signedAt'))}`}
                  </div>
                </div>
                <CanAccess permission={['uat.signoff']}>
                  {fieldStr(s, 'status') === 'PENDING' && activeCycleId && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => signoffMut.mutate({
                          cycleId: activeCycleId,
                          signoffType: fieldStr(s, 'signoffType'),
                          status: 'APPROVED',
                        })}
                      >
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => signoffMut.mutate({
                          cycleId: activeCycleId,
                          signoffType: fieldStr(s, 'signoffType'),
                          status: 'REJECTED',
                        })}
                      >
                        Reject
                      </Button>
                    </div>
                  )}
                </CanAccess>
              </div>
            ))}
            {signoffItems.length === 0 && <p className="text-muted">No signoffs configured for this cycle.</p>}
          </div>
        </Card>
      )}

      {tab === 'reports' && (
        <div className="grid gap-4">
          <Card title="Final UAT Signoff Report">
            {finalReports.isLoading ? <LoadingSpinner /> : (
              <pre className="text-xs overflow-auto max-h-64">{JSON.stringify(finalReports.data, null, 2)}</pre>
            )}
          </Card>
          <Card title="UAT Summary Report">
            {summaryReport.isLoading ? <LoadingSpinner /> : (
              <pre className="text-xs overflow-auto max-h-64">{JSON.stringify(summaryReport.data, null, 2)}</pre>
            )}
          </Card>
          <Card title="Business Readiness">
            <div className="uat-readiness-bar">
              <span className="uat-readiness-pill">Execution: {pct(readinessData.executionRate)}</span>
              <span className="uat-readiness-pill">Pass Rate: {pct(readinessData.passRate)}</span>
              <span className="uat-readiness-pill">Signoff: {pct(readinessData.signoffRate)}</span>
              <span className={`uat-readiness-pill ${readinessData.goLiveReady ? 'ready' : 'blocked'}`}>
                Go-Live: {pct(readinessData.goLiveReadinessPercent)}
              </span>
            </div>
            {(readinessData.goLiveBlockers as string[] | undefined)?.length ? (
              <ul className="text-sm">
                {(readinessData.goLiveBlockers as string[]).map((b) => <li key={b}>{b}</li>)}
              </ul>
            ) : null}
          </Card>
        </div>
      )}

      {tab === 'templates' && (
        <PaginatedListView
          search={search}
          onSearchChange={setSearch}
          columns={[
            { key: 'code', header: 'Code', render: (r: Record<string, unknown>) => fieldStr(r, 'code') },
            { key: 'name', header: 'Template', render: (r: Record<string, unknown>) => fieldStr(r, 'name') },
            { key: 'businessFlow', header: 'Flow', render: (r: Record<string, unknown>) => fieldStr(r, 'businessFlow') },
            { key: 'userGroup', header: 'User Group', render: (r: Record<string, unknown>) => fieldStr(r, 'userGroup') },
          ]}
          data={templates.data?.items ?? []}
          meta={templates.data?.meta}
          isLoading={templates.isLoading}
          onPageChange={setPage}
          emptyTitle="No templates"
        />
      )}
    </div>
  );
}
