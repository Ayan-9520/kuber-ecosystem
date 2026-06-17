import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';

import { PaginatedListView } from '@/components/common/PaginatedListView';
import { CanAccess } from '@/components/guards/CanAccess';
import { Button, Card, LoadingSpinner, PageHeader, StatCard, Tabs } from '@/components/ui';
import { StatusBadge } from '@/components/ui/Badge';
import { useDebounce, usePagination } from '@/hooks';
import { downloadBlob, fieldStr, formatDateTime } from '@/lib/utils';
import { governanceService } from '@/services/governance.service';

import '../governance.css';

type TabId = 'overview' | 'audit' | 'compliance' | 'risk' | 'security' | 'governance';

const TABS: { id: TabId; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'audit', label: 'Audit Center' },
  { id: 'compliance', label: 'Compliance' },
  { id: 'risk', label: 'Risk' },
  { id: 'security', label: 'Security' },
  { id: 'governance', label: 'Governance' },
];

const AUDIT_SOURCES = ['', 'AUTH', 'RBAC', 'LEADS', 'APPLICATIONS', 'AI', 'CONTENT', 'AUTOMATION'];
const SECURITY_TYPES = ['', 'FAILED_LOGIN', 'ACCOUNT_LOCKOUT', 'SUSPICIOUS_ACTIVITY', 'AI_PROMPT_ABUSE', 'API_ABUSE'];

export function GovernanceHubPage() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<TabId>('overview');
  const [search, setSearch] = useState('');
  const [auditSource, setAuditSource] = useState('');
  const [securityType, setSecurityType] = useState('');
  const debouncedSearch = useDebounce(search);
  const { page, limit, setPage, reset } = usePagination();

  useEffect(() => {
    reset();
  }, [tab, debouncedSearch, auditSource, securityType, reset]);

  const params = useMemo(
    () => ({
      page,
      limit,
      search: debouncedSearch || undefined,
      source: auditSource || undefined,
      eventType: securityType || undefined,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    }),
    [page, limit, debouncedSearch, auditSource, securityType],
  );

  const auditDashboard = useQuery({
    queryKey: ['governance', 'audit-dashboard'],
    queryFn: () => governanceService.auditDashboard({ period: 'month' }),
    enabled: ['overview', 'audit'].includes(tab),
  });

  const complianceDashboard = useQuery({
    queryKey: ['governance', 'compliance-dashboard'],
    queryFn: () => governanceService.complianceDashboard({ period: 'month' }),
    enabled: ['overview', 'compliance'].includes(tab),
  });

  const riskDashboard = useQuery({
    queryKey: ['governance', 'risk-dashboard'],
    queryFn: () => governanceService.riskDashboard({ period: 'month' }),
    enabled: ['overview', 'risk'].includes(tab),
  });

  const securityDashboard = useQuery({
    queryKey: ['governance', 'security-dashboard'],
    queryFn: () => governanceService.securityDashboard({ period: 'month' }),
    enabled: ['overview', 'security'].includes(tab),
  });

  const aiGovernance = useQuery({
    queryKey: ['governance', 'ai-governance'],
    queryFn: () => governanceService.aiGovernance({ period: 'month' }),
    enabled: ['overview', 'security', 'governance'].includes(tab),
  });

  const auditEvents = useQuery({
    queryKey: ['governance', 'audit-events', params],
    queryFn: () => governanceService.auditEvents(params),
    enabled: tab === 'audit',
  });

  const violations = useQuery({
    queryKey: ['governance', 'violations', params],
    queryFn: () => governanceService.violations(params),
    enabled: tab === 'compliance',
  });

  const riskRegister = useQuery({
    queryKey: ['governance', 'risk-register', params],
    queryFn: () => governanceService.riskRegister(params),
    enabled: tab === 'risk',
  });

  const securityEvents = useQuery({
    queryKey: ['governance', 'security-events', params],
    queryFn: () => governanceService.securityEvents(params),
    enabled: tab === 'security',
  });

  const securityAlerts = useQuery({
    queryKey: ['governance', 'security-alerts', params],
    queryFn: () => governanceService.securityAlerts({ ...params, status: 'OPEN' }),
    enabled: tab === 'security',
  });

  const retentionPolicies = useQuery({
    queryKey: ['governance', 'retention'],
    queryFn: () => governanceService.retentionPolicies(),
    enabled: tab === 'governance',
  });

  const complianceRules = useQuery({
    queryKey: ['governance', 'rules'],
    queryFn: () => governanceService.complianceRules(),
    enabled: tab === 'governance',
  });

  const exportMut = useMutation({
    mutationFn: () => governanceService.exportAuditEvents({ format: 'CSV', ...params }),
    onSuccess: (blob) => downloadBlob(blob, `audit-events-${Date.now()}.csv`),
  });

  const resolveMut = useMutation({
    mutationFn: (id: string) => governanceService.resolveViolation({ violationId: id, status: 'RESOLVED' }),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['governance'] }),
  });

  const ackAlertMut = useMutation({
    mutationFn: (id: string) => governanceService.updateAlert({ alertId: id, status: 'ACKNOWLEDGED' }),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['governance'] }),
  });

  const auditSummary = (auditDashboard.data?.summary ?? {}) as Record<string, unknown>;
  const complianceSummary = (complianceDashboard.data?.summary ?? {}) as Record<string, unknown>;
  const riskSummary = (riskDashboard.data?.summary ?? {}) as Record<string, unknown>;
  const securitySummary = (securityDashboard.data?.summary ?? {}) as Record<string, unknown>;
  const aiSummary = (aiGovernance.data?.summary ?? {}) as Record<string, unknown>;

  const auditColumns = [
    { key: 'source', header: 'Source', render: (r: Record<string, unknown>) => fieldStr(r, 'source') },
    { key: 'action', header: 'Action', render: (r: Record<string, unknown>) => fieldStr(r, 'action') },
    { key: 'entityType', header: 'Entity', render: (r: Record<string, unknown>) => fieldStr(r, 'entityType') },
    { key: 'userId', header: 'User', render: (r: Record<string, unknown>) => fieldStr(r, 'userId') },
    { key: 'ipAddress', header: 'IP', render: (r: Record<string, unknown>) => fieldStr(r, 'ipAddress') },
    { key: 'createdAt', header: 'Time', render: (r: Record<string, unknown>) => formatDateTime(r.createdAt as string) },
  ];

  const violationColumns = [
    { key: 'severity', header: 'Severity', render: (r: Record<string, unknown>) => <StatusBadge status={fieldStr(r, 'severity')} /> },
    { key: 'status', header: 'Status', render: (r: Record<string, unknown>) => <StatusBadge status={fieldStr(r, 'status')} /> },
    { key: 'description', header: 'Description', render: (r: Record<string, unknown>) => fieldStr(r, 'description').slice(0, 80) },
    {
      key: 'actions',
      header: '',
      render: (r: Record<string, unknown>) => (
        <CanAccess permission={['compliance.manage']}>
          <Button size="sm" onClick={() => resolveMut.mutate(fieldStr(r, 'id'))}>Resolve</Button>
        </CanAccess>
      ),
    },
  ];

  const riskColumns = [
    { key: 'code', header: 'Code', render: (r: Record<string, unknown>) => fieldStr(r, 'code') },
    { key: 'title', header: 'Title', render: (r: Record<string, unknown>) => fieldStr(r, 'title') },
    { key: 'riskType', header: 'Type', render: (r: Record<string, unknown>) => fieldStr(r, 'riskType') },
    { key: 'severity', header: 'Severity', render: (r: Record<string, unknown>) => <StatusBadge status={fieldStr(r, 'severity')} /> },
    { key: 'riskScore', header: 'Score', render: (r: Record<string, unknown>) => String(r.riskScore ?? 0) },
    { key: 'status', header: 'Status', render: (r: Record<string, unknown>) => <StatusBadge status={fieldStr(r, 'status')} /> },
  ];

  const securityEventColumns = [
    { key: 'eventType', header: 'Type', render: (r: Record<string, unknown>) => fieldStr(r, 'eventType') },
    { key: 'severity', header: 'Severity', render: (r: Record<string, unknown>) => <StatusBadge status={fieldStr(r, 'severity')} /> },
    { key: 'description', header: 'Description', render: (r: Record<string, unknown>) => fieldStr(r, 'description').slice(0, 100) },
    { key: 'ipAddress', header: 'IP', render: (r: Record<string, unknown>) => fieldStr(r, 'ipAddress') },
    { key: 'createdAt', header: 'Time', render: (r: Record<string, unknown>) => formatDateTime(r.createdAt as string) },
  ];

  const alertColumns = [
    { key: 'title', header: 'Alert', render: (r: Record<string, unknown>) => fieldStr(r, 'title') },
    { key: 'severity', header: 'Severity', render: (r: Record<string, unknown>) => <StatusBadge status={fieldStr(r, 'severity')} /> },
    { key: 'status', header: 'Status', render: (r: Record<string, unknown>) => <StatusBadge status={fieldStr(r, 'status')} /> },
    {
      key: 'actions',
      header: '',
      render: (r: Record<string, unknown>) => (
        <CanAccess permission={['security.manage']}>
          <Button size="sm" variant="secondary" onClick={() => ackAlertMut.mutate(fieldStr(r, 'id'))}>Acknowledge</Button>
        </CanAccess>
      ),
    },
  ];

  return (
    <div className="governance-hub">
      <PageHeader
        title="Audit & Compliance Center"
        subtitle="Centralized audit, compliance, risk, security, and governance oversight for Kuber Finserve"
        actions={
          <CanAccess permission={['audit.export']}>
            <Button variant="secondary" onClick={() => exportMut.mutate()} disabled={exportMut.isPending}>
              Export Audit
            </Button>
          </CanAccess>
        }
      />

      <Tabs tabs={TABS} active={tab} onChange={(id) => setTab(id as TabId)} />

      {tab === 'overview' && (
        <>
          <div className="stat-grid">
            <StatCard label="Audit Events" value={String(auditSummary.totalEvents ?? 0)} />
            <StatCard label="Compliance Score" value={String(complianceSummary.complianceScore ?? '—')} />
            <StatCard label="Risk Score" value={String(riskSummary.riskScore ?? '—')} />
            <StatCard label="Security Score" value={String(securitySummary.securityScore ?? '—')} />
            <StatCard label="Open Violations" value={String(complianceSummary.openViolations ?? 0)} />
            <StatCard label="Open Alerts" value={String(securitySummary.openAlerts ?? 0)} />
            <StatCard label="AI Requests" value={String(aiSummary.totalRequests ?? 0)} />
            <StatCard label="AI Cost (USD)" value={String(aiSummary.totalCost ?? 0)} />
          </div>
          {(auditDashboard.isLoading || complianceDashboard.isLoading) && <LoadingSpinner />}
        </>
      )}

      {tab === 'audit' && (
        <>
          <div className="stat-grid">
            <StatCard label="Total Events" value={String(auditSummary.totalEvents ?? 0)} />
            <StatCard label="Centralized" value={String(auditSummary.centralizedEvents ?? 0)} />
            <StatCard label="Legacy Logs" value={String(auditSummary.legacyEvents ?? 0)} />
          </div>
          <PaginatedListView
            search={search}
            onSearchChange={setSearch}
            searchPlaceholder="Search audit trail…"
            columns={auditColumns}
            data={auditEvents.data?.items ?? []}
            meta={auditEvents.data?.meta}
            isLoading={auditEvents.isLoading}
            onPageChange={setPage}
            emptyTitle="No audit events"
            emptyDescription="Activity across all modules will appear here."
            filters={
              <select value={auditSource} onChange={(e) => setAuditSource(e.target.value)}>
                {AUDIT_SOURCES.map((s) => (
                  <option key={s || 'all'} value={s}>{s || 'All sources'}</option>
                ))}
              </select>
            }
          />
        </>
      )}

      {tab === 'compliance' && (
        <>
          <div className="stat-grid">
            <StatCard label="Compliance Score" value={String(complianceSummary.complianceScore ?? 0)} />
            <StatCard label="Open Violations" value={String(complianceSummary.openViolations ?? 0)} />
            <StatCard label="Active Rules" value={String(complianceSummary.activeRules ?? 0)} />
            <StatCard label="Data Access Events" value={String(complianceSummary.dataAccessEvents ?? 0)} />
          </div>
          <PaginatedListView
            search={search}
            onSearchChange={setSearch}
            columns={violationColumns}
            data={violations.data?.items ?? []}
            meta={violations.data?.meta}
            isLoading={violations.isLoading}
            onPageChange={setPage}
            emptyTitle="No violations"
            emptyDescription="Compliance violations will be tracked here."
          />
        </>
      )}

      {tab === 'risk' && (
        <>
          <div className="stat-grid">
            <StatCard label="Risk Score" value={String(riskSummary.riskScore ?? 0)} />
            <StatCard label="Open Risks" value={String(riskSummary.openRisks ?? 0)} />
            <StatCard label="Critical Risks" value={String(riskSummary.criticalRisks ?? 0)} />
            <StatCard label="Avg Risk Score" value={String(riskSummary.avgRiskScore ?? 0)} />
          </div>
          <PaginatedListView
            search={search}
            onSearchChange={setSearch}
            columns={riskColumns}
            data={riskRegister.data?.items ?? []}
            meta={riskRegister.data?.meta}
            isLoading={riskRegister.isLoading}
            onPageChange={setPage}
            emptyTitle="No risks registered"
            emptyDescription="Risk register entries will appear here."
          />
        </>
      )}

      {tab === 'security' && (
        <>
          <div className="stat-grid">
            <StatCard label="Security Score" value={String(securitySummary.securityScore ?? 0)} />
            <StatCard label="Failed Logins" value={String(securitySummary.failedLogins ?? 0)} />
            <StatCard label="Open Alerts" value={String(securitySummary.openAlerts ?? 0)} />
            <StatCard label="AI Prompt Abuse" value={String(securitySummary.aiPromptAbuse ?? 0)} />
          </div>
          <Card title="Security Alerts" className="mb-md">
            <PaginatedListView
              search={search}
              onSearchChange={setSearch}
              columns={alertColumns}
              data={securityAlerts.data?.items ?? []}
              meta={securityAlerts.data?.meta}
              isLoading={securityAlerts.isLoading}
              onPageChange={setPage}
              emptyTitle="No open alerts"
              emptyDescription="Security alerts are raised for high-severity events."
            />
          </Card>
          <Card title="Security Events">
            <PaginatedListView
              search={search}
              onSearchChange={setSearch}
              columns={securityEventColumns}
              data={securityEvents.data?.items ?? []}
              meta={securityEvents.data?.meta}
              isLoading={securityEvents.isLoading}
              onPageChange={setPage}
              emptyTitle="No security events"
              emptyDescription="Failed logins, API abuse, and suspicious activity are logged here."
              filters={
                <select value={securityType} onChange={(e) => setSecurityType(e.target.value)}>
                  {SECURITY_TYPES.map((t) => (
                    <option key={t || 'all'} value={t}>{t || 'All event types'}</option>
                  ))}
                </select>
              }
            />
          </Card>
        </>
      )}

      {tab === 'governance' && (
        <>
          <div className="stat-grid">
            <StatCard label="AI Requests" value={String(aiSummary.totalRequests ?? 0)} />
            <StatCard label="AI Tokens" value={String(aiSummary.totalTokens ?? 0)} />
            <StatCard label="AI Error Rate" value={`${aiSummary.errorRate ?? 0}%`} />
            <StatCard label="Retention Policies" value={String(retentionPolicies.data?.length ?? 0)} />
          </div>
          <Card title="Compliance Rules" className="mb-md">
            {(complianceRules.data ?? []).slice(0, 8).map((rule) => (
              <div key={fieldStr(rule, 'code')} style={{ padding: '8px 0', borderBottom: '1px solid var(--color-border)' }}>
                <strong>{fieldStr(rule, 'name')}</strong>
                <span style={{ marginLeft: 8, color: 'var(--color-text-muted)' }}>{fieldStr(rule, 'framework')}</span>
              </div>
            ))}
          </Card>
          <Card title="Document Retention Policies">
            {(retentionPolicies.data ?? []).map((p) => (
              <div key={fieldStr(p, 'code')} style={{ padding: '8px 0', borderBottom: '1px solid var(--color-border)' }}>
                <strong>{fieldStr(p, 'name')}</strong>
                <span style={{ marginLeft: 8 }}>{fieldStr(p, 'retentionDays')} days — {fieldStr(p, 'action')}</span>
              </div>
            ))}
          </Card>
        </>
      )}
    </div>
  );
}
