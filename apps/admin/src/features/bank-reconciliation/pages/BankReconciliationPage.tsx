import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Landmark } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { AxiosError } from 'axios';

import {
  buildTemplateCsv,
  parseDelimitedText,
  rowsToStatementLines,
  SAMPLE_STATEMENT_CSV,
  validateStatementFormat,
} from '../data/parseCsv';
import { canBcre, resolveBcreRole } from '../data/permissions';
import type {
  BankCommissionStatement,
  BcreSummary,
  MatchReviewStatus,
  MatchType,
  ReconciliationAuditEvent,
  ReconciliationDispute,
  ReconciliationMatch,
  VarianceType,
} from '../data/types';

import { Button, Card, EmptyState, PageHeader, StatCard, TableSkeleton } from '@/components/ui';
import { StatusBadge } from '@/components/ui/Badge';
import { usePermissions } from '@/hooks/usePermissions';
import { formatCurrency, formatDate } from '@/lib/utils';
import { bankReconciliationService } from '@/services/index';

import '../bcre.css';

type TabId = 'upload' | 'workspace' | 'statements' | 'dashboard' | 'disputes' | 'audit';

const BCRE_KEYS = {
  summary: ['bank-reconciliation', 'summary'] as const,
  statements: (params: Record<string, unknown>) =>
    ['bank-reconciliation', 'statements', params] as const,
  matches: (params: Record<string, unknown>) =>
    ['bank-reconciliation', 'matches', params] as const,
  disputes: (params: Record<string, unknown>) =>
    ['bank-reconciliation', 'disputes', params] as const,
  audit: (params: Record<string, unknown>) =>
    ['bank-reconciliation', 'audit', params] as const,
};

function apiErrorMessage(err: unknown, fallback: string): string {
  const ax = err as AxiosError<{ message?: string; error?: { message?: string } }>;
  return (
    ax?.response?.data?.message ||
    ax?.response?.data?.error?.message ||
    (err instanceof Error ? err.message : null) ||
    fallback
  );
}

function downloadText(filename: string, content: string, mime = 'text/csv;charset=utf-8') {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function normalizeStatement(raw: Record<string, unknown>): BankCommissionStatement {
  const period = (raw.statementPeriod ?? {}) as Record<string, unknown>;
  return {
    id: String(raw.id ?? ''),
    bankName: String(raw.bankName ?? ''),
    statementPeriod: {
      month: period.month != null ? String(period.month) : null,
      year: period.year != null ? Number(period.year) : null,
      from: period.from != null ? String(period.from) : null,
      to: period.to != null ? String(period.to) : null,
    },
    uploadedBy: String(raw.uploadedBy ?? ''),
    uploadedAt: String(raw.uploadedAt ?? ''),
    fileName: String(raw.fileName ?? ''),
    totalRows: Number(raw.totalRows ?? 0),
    totalAmount: Number(raw.totalAmount ?? 0),
    status: String(raw.status ?? 'UPLOADED') as BankCommissionStatement['status'],
  };
}

function normalizeMatch(raw: Record<string, unknown>): ReconciliationMatch {
  const lineRaw = raw.line as Record<string, unknown> | undefined;
  return {
    id: String(raw.id ?? ''),
    statementLineId: String(raw.statementLineId ?? ''),
    statementId: String(raw.statementId ?? ''),
    bankName: String(raw.bankName ?? ''),
    matchedCaseId: raw.matchedCaseId != null ? String(raw.matchedCaseId) : null,
    caseNumber: raw.caseNumber != null ? String(raw.caseNumber) : null,
    matchType: String(raw.matchType ?? 'UNMATCHED') as MatchType,
    matchScore: Number(raw.matchScore ?? 0),
    expectedCommission: Number(raw.expectedCommission ?? 0),
    receivedCommission: Number(raw.receivedCommission ?? 0),
    variance: Number(raw.variance ?? 0),
    varianceType: String(raw.varianceType ?? 'MISSING') as VarianceType,
    status: String(raw.status ?? 'PENDING_REVIEW') as MatchReviewStatus,
    reviewedBy: raw.reviewedBy != null ? String(raw.reviewedBy) : null,
    reviewedAt: raw.reviewedAt != null ? String(raw.reviewedAt) : null,
    notes: raw.notes != null ? String(raw.notes) : null,
    line: lineRaw
      ? {
          id: String(lineRaw.id ?? ''),
          statementId: String(lineRaw.statementId ?? ''),
          bankReference: lineRaw.bankReference != null ? String(lineRaw.bankReference) : null,
          loanAccountNumber:
            lineRaw.loanAccountNumber != null ? String(lineRaw.loanAccountNumber) : null,
          applicationNumber:
            lineRaw.applicationNumber != null ? String(lineRaw.applicationNumber) : null,
          customerName: String(lineRaw.customerName ?? ''),
          pan: lineRaw.pan != null ? String(lineRaw.pan) : null,
          disbursedAmount: Number(lineRaw.disbursedAmount ?? 0),
          commissionAmount: Number(lineRaw.commissionAmount ?? 0),
          gstAmount: Number(lineRaw.gstAmount ?? 0),
          tdsAmount: Number(lineRaw.tdsAmount ?? 0),
          netAmount: Number(lineRaw.netAmount ?? 0),
          payoutDate: lineRaw.payoutDate != null ? String(lineRaw.payoutDate) : null,
          rawPayload: (lineRaw.rawPayload as Record<string, unknown>) ?? null,
        }
      : undefined,
  };
}

function normalizeDispute(raw: Record<string, unknown>): ReconciliationDispute {
  return {
    id: String(raw.id ?? ''),
    matchId: String(raw.matchId ?? ''),
    bankName: String(raw.bankName ?? ''),
    raisedBy: String(raw.raisedBy ?? ''),
    raisedAt: String(raw.raisedAt ?? ''),
    amount: Number(raw.amount ?? 0),
    reason: String(raw.reason ?? ''),
    status: String(raw.status ?? 'OPEN') as ReconciliationDispute['status'],
    resolutionNotes: raw.resolutionNotes != null ? String(raw.resolutionNotes) : null,
    resolvedAt: raw.resolvedAt != null ? String(raw.resolvedAt) : null,
  };
}

function normalizeAudit(raw: Record<string, unknown>): ReconciliationAuditEvent {
  return {
    id: String(raw.id ?? ''),
    entityType: String(raw.entityType ?? ''),
    entityId: String(raw.entityId ?? ''),
    action: String(raw.action ?? ''),
    actorUserId: String(raw.actorUserId ?? ''),
    actorName: String(raw.actorName ?? ''),
    before: (raw.before as Record<string, unknown>) ?? null,
    after: (raw.after as Record<string, unknown>) ?? null,
    ipAddress: raw.ipAddress != null ? String(raw.ipAddress) : null,
    createdAt: String(raw.createdAt ?? ''),
  };
}

export function BankReconciliationPage() {
  const { user } = usePermissions();
  const role = resolveBcreRole({ roles: user?.roles, permissions: user?.permissions });
  const queryClient = useQueryClient();

  const [tab, setTab] = useState<TabId>('dashboard');
  const [toast, setToast] = useState<string | null>(null);
  const [uploadErrors, setUploadErrors] = useState<string[]>([]);
  const [uploadWarnings, setUploadWarnings] = useState<string[]>([]);
  const [month, setMonth] = useState('2026-07');
  const [bankLabel, setBankLabel] = useState('HDFC Bank');
  const [search, setSearch] = useState('');
  const [matchTypeFilter, setMatchTypeFilter] = useState<'ALL' | MatchType>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | MatchReviewStatus>('ALL');
  const [varianceFilter, setVarianceFilter] = useState<'ALL' | VarianceType>('ALL');
  const [activeStatementId, setActiveStatementId] = useState<string | null>(null);
  const [disputeNote, setDisputeNote] = useState('');

  const notify = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 3200);
  };

  const invalidateAll = () => {
    void queryClient.invalidateQueries({ queryKey: ['bank-reconciliation'] });
  };

  const summaryQuery = useQuery({
    queryKey: BCRE_KEYS.summary,
    queryFn: () => bankReconciliationService.summary() as Promise<BcreSummary>,
  });

  const statementsQuery = useQuery({
    queryKey: BCRE_KEYS.statements({ page: 1, limit: 50 }),
    queryFn: async () => {
      const res = await bankReconciliationService.listStatements({ page: 1, limit: 50 });
      return {
        items: res.items.map((r) => normalizeStatement(r as Record<string, unknown>)),
        meta: res.meta,
      };
    },
  });

  const matchParams = useMemo(
    () => ({
      page: 1,
      limit: 100,
      statementId: activeStatementId || undefined,
      matchType: matchTypeFilter === 'ALL' ? undefined : matchTypeFilter,
      status: statusFilter === 'ALL' ? undefined : statusFilter,
      varianceType: varianceFilter === 'ALL' ? undefined : varianceFilter,
      search: search.trim() || undefined,
    }),
    [activeStatementId, matchTypeFilter, statusFilter, varianceFilter, search],
  );

  const matchesQuery = useQuery({
    queryKey: BCRE_KEYS.matches(matchParams),
    queryFn: async () => {
      const res = await bankReconciliationService.listMatches(matchParams);
      return {
        items: res.items.map((r) => normalizeMatch(r as Record<string, unknown>)),
        meta: res.meta,
      };
    },
  });

  const disputesQuery = useQuery({
    queryKey: BCRE_KEYS.disputes({ page: 1, limit: 50 }),
    queryFn: async () => {
      const res = await bankReconciliationService.listDisputes({ page: 1, limit: 50 });
      return {
        items: res.items.map((r) => normalizeDispute(r as Record<string, unknown>)),
        meta: res.meta,
      };
    },
  });

  const auditQuery = useQuery({
    queryKey: BCRE_KEYS.audit({ page: 1, limit: 50 }),
    queryFn: async () => {
      const res = await bankReconciliationService.listAudit({ page: 1, limit: 50 });
      return {
        items: res.items.map((r) => normalizeAudit(r as Record<string, unknown>)),
        meta: res.meta,
      };
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: unknown) => bankReconciliationService.createStatement(data),
    onSuccess: (raw) => {
      const stmt = normalizeStatement(raw as Record<string, unknown>);
      setActiveStatementId(stmt.id);
      invalidateAll();
      setTab('statements');
      notify(`Uploaded ${stmt.fileName} · ${stmt.totalRows} rows`);
    },
    onError: (err) => notify(apiErrorMessage(err, 'Failed to upload statement')),
  });

  const reconcileMutation = useMutation({
    mutationFn: (id: string) => bankReconciliationService.reconcileStatement(id),
    onSuccess: () => {
      invalidateAll();
      setTab('workspace');
      notify('Reconciliation complete — matches refreshed');
    },
    onError: (err) => notify(apiErrorMessage(err, 'Reconciliation failed')),
  });

  const reviewMutation = useMutation({
    mutationFn: ({
      id,
      action,
      note,
      reason,
    }: {
      id: string;
      action: 'accept' | 'dispute' | 'write-off' | 'resolve';
      note?: string;
      reason?: string;
    }) => bankReconciliationService.reviewMatch(id, { action, note, reason }),
    onSuccess: (_data, vars) => {
      invalidateAll();
      notify(`Match ${vars.action.replace('-', ' ')}d`);
      setDisputeNote('');
    },
    onError: (err) => notify(apiErrorMessage(err, 'Review action failed')),
  });

  const disputeUpdateMutation = useMutation({
    mutationFn: ({
      id,
      status,
      resolutionNotes,
    }: {
      id: string;
      status: ReconciliationDispute['status'];
      resolutionNotes?: string;
    }) => bankReconciliationService.updateDispute(id, { status, resolutionNotes }),
    onSuccess: () => {
      invalidateAll();
      notify('Dispute updated');
    },
    onError: (err) => notify(apiErrorMessage(err, 'Failed to update dispute')),
  });

  const ingestText = (fileName: string, text: string) => {
    setUploadErrors([]);
    setUploadWarnings([]);

    if (fileName.toLowerCase().endsWith('.xlsx') || fileName.toLowerCase().endsWith('.xls')) {
      if (text.includes('\0') || text.charCodeAt(0) === 0x50) {
        setUploadErrors([
          'Binary Excel (.xlsx) detected. Open in Excel and Save As → CSV (UTF-8), then upload.',
        ]);
        return;
      }
    }

    const parsed = parseDelimitedText(text);
    const format = validateStatementFormat(parsed.headers);
    setUploadWarnings(format.warnings);
    if (!format.ok) {
      setUploadErrors(format.errors);
      return;
    }

    const lines = rowsToStatementLines(parsed.rows).filter((l) => l.customerName);
    if (!lines.length) {
      setUploadErrors(['No valid data rows found']);
      return;
    }

    createMutation.mutate({
      bankName: bankLabel,
      statementPeriod: { month, year: Number(month.slice(0, 4)) || undefined },
      fileName,
      lines,
    });
  };

  const onFileChange = async (file: File | null) => {
    if (!file || !canBcre(role, 'uploadStatement')) return;
    const lower = file.name.toLowerCase();
    if (
      !lower.endsWith('.csv') &&
      !lower.endsWith('.tsv') &&
      !lower.endsWith('.txt') &&
      !lower.endsWith('.xlsx') &&
      !lower.endsWith('.xls')
    ) {
      setUploadErrors(['Unsupported file type. Use CSV (Excel → Save As CSV) or TSV.']);
      return;
    }
    const text = await file.text();
    ingestText(file.name, text);
  };

  const loadSample = () => {
    if (!canBcre(role, 'uploadStatement')) return;
    ingestText(`sample-payout-${month}.csv`, SAMPLE_STATEMENT_CSV);
  };

  const summary = summaryQuery.data;
  const statements = statementsQuery.data?.items ?? [];
  const matches = matchesQuery.data?.items ?? [];
  const disputes = disputesQuery.data?.items ?? [];
  const audit = auditQuery.data?.items ?? [];

  const pageLoading =
    (tab === 'dashboard' && summaryQuery.isLoading) ||
    (tab === 'statements' && statementsQuery.isLoading) ||
    (tab === 'workspace' && matchesQuery.isLoading) ||
    (tab === 'disputes' && disputesQuery.isLoading) ||
    (tab === 'audit' && auditQuery.isLoading);

  const pageError =
    (tab === 'dashboard' && summaryQuery.isError) ||
    (tab === 'statements' && statementsQuery.isError) ||
    (tab === 'workspace' && matchesQuery.isError) ||
    (tab === 'disputes' && disputesQuery.isError) ||
    (tab === 'audit' && auditQuery.isError);

  const refetchTab = () => {
    if (tab === 'dashboard') void summaryQuery.refetch();
    else if (tab === 'statements') void statementsQuery.refetch();
    else if (tab === 'workspace') void matchesQuery.refetch();
    else if (tab === 'disputes') void disputesQuery.refetch();
    else if (tab === 'audit') void auditQuery.refetch();
  };

  const mutating =
    createMutation.isPending ||
    reconcileMutation.isPending ||
    reviewMutation.isPending ||
    disputeUpdateMutation.isPending;

  return (
    <div className="bcre-page page-container">
      <PageHeader
        title="Bank Commission Reconciliation"
        subtitle="Upload bank payout CSV → match loan cases → review variance → raise disputes"
        actions={<span className="bcre-pill">Role: {role}</span>}
      />

      {toast ? (
        <Card>
          <p style={{ margin: 0, fontWeight: 600 }}>{toast}</p>
        </Card>
      ) : null}

      <div className="bcre-tabs">
        {(
          [
            ['dashboard', 'Finance dashboard'],
            ['upload', 'Upload'],
            ['workspace', 'Match workspace'],
            ['statements', 'Statements'],
            ['disputes', 'Disputes'],
            ['audit', 'Audit log'],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            className={`bcre-tab${tab === id ? ' is-active' : ''}`}
            onClick={() => setTab(id)}
          >
            {label}
          </button>
        ))}
      </div>

      {pageLoading ? <TableSkeleton rows={8} cols={6} /> : null}

      {pageError ? (
        <div className="bcre-empty">
          <EmptyState
            icon={<Landmark size={32} />}
            title="Failed to load reconciliation data"
            description="Could not reach the bank reconciliation API."
            action={
              <Button type="button" onClick={refetchTab}>
                Retry
              </Button>
            }
          />
        </div>
      ) : null}

      {!pageLoading && !pageError && tab === 'upload' ? (
        <Card title="Upload monthly bank commission statement">
          {!canBcre(role, 'uploadStatement') ? (
            <p className="text-muted">Only Finance / Admin can upload statements.</p>
          ) : (
            <>
              <div className="bcre-filters">
                <div>
                  <label className="text-muted" style={{ fontSize: 12 }}>
                    Statement month
                  </label>
                  <input type="month" value={month} onChange={(e) => setMonth(e.target.value)} />
                </div>
                <div>
                  <label className="text-muted" style={{ fontSize: 12 }}>
                    Bank / label
                  </label>
                  <input value={bankLabel} onChange={(e) => setBankLabel(e.target.value)} />
                </div>
              </div>
              <div className="bcre-upload">
                <p style={{ margin: 0, fontWeight: 700 }}>Drop CSV here</p>
                <p className="text-muted" style={{ margin: '0.35rem 0 0', fontSize: '0.85rem' }}>
                  Required columns: Customer Name, Commission Amount. Optional: Loan Account Number,
                  Application Number, PAN, Disbursed Amount, GST, TDS, Net Amount, Payout Date, Bank
                  Reference.
                </p>
                <input
                  type="file"
                  accept=".csv,.tsv,.txt,.xlsx,.xls"
                  disabled={createMutation.isPending}
                  onChange={(e) => void onFileChange(e.target.files?.[0] ?? null)}
                />
              </div>
              {uploadErrors.map((err) => (
                <p key={err} className="bcre-error">
                  {err}
                </p>
              ))}
              {uploadWarnings.map((w) => (
                <p key={w} className="bcre-ok">
                  Warning: {w}
                </p>
              ))}
              <div className="bcre-actions">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => downloadText('bank-commission-template.csv', buildTemplateCsv())}
                >
                  Download CSV template
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  disabled={createMutation.isPending}
                  onClick={loadSample}
                >
                  {createMutation.isPending ? 'Uploading…' : 'Load sample statement'}
                </Button>
              </div>
            </>
          )}
        </Card>
      ) : null}

      {!pageLoading && !pageError && tab === 'workspace' ? (
        <Card title="Match workspace">
          <div className="stat-grid bcre-stat-grid" style={{ marginBottom: '0.75rem' }}>
            <StatCard label="Exact" value={String(summary?.matchedCount ?? 0)} />
            <StatCard label="Probable" value={String(summary?.probableCount ?? 0)} />
            <StatCard label="Unmatched" value={String(summary?.unmatchedCount ?? 0)} />
            <StatCard
              label="Pending review"
              value={String(summary?.pendingReviewCount ?? 0)}
            />
          </div>

          <div className="bcre-filters">
            <input
              placeholder="Search customer, case, LAN, PAN…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select
              value={activeStatementId ?? ''}
              onChange={(e) => setActiveStatementId(e.target.value || null)}
            >
              <option value="">All statements</option>
              {statements.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.bankName} · {s.fileName}
                </option>
              ))}
            </select>
            <select
              value={matchTypeFilter}
              onChange={(e) => setMatchTypeFilter(e.target.value as typeof matchTypeFilter)}
            >
              <option value="ALL">All match types</option>
              <option value="EXACT">Exact</option>
              <option value="PROBABLE">Probable</option>
              <option value="UNMATCHED">Unmatched</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
            >
              <option value="ALL">All statuses</option>
              <option value="PENDING_REVIEW">Pending review</option>
              <option value="ACCEPTED">Accepted</option>
              <option value="DISPUTED">Disputed</option>
              <option value="WRITTEN_OFF">Written off</option>
              <option value="RESOLVED">Resolved</option>
            </select>
            <select
              value={varianceFilter}
              onChange={(e) => setVarianceFilter(e.target.value as typeof varianceFilter)}
            >
              <option value="ALL">All variance</option>
              <option value="MATCHED">Matched</option>
              <option value="SHORT_PAYMENT">Short payment</option>
              <option value="EXCESS">Excess</option>
              <option value="MISSING">Missing</option>
            </select>
          </div>

          {matches.length === 0 ? (
            <div className="bcre-empty">
              <EmptyState
                icon={<Landmark size={32} />}
                title="No matches yet"
                description="Upload a statement and run reconcile to generate matches against loan cases."
                action={
                  <Button type="button" onClick={() => setTab('upload')}>
                    Upload statement
                  </Button>
                }
              />
            </div>
          ) : (
            <>
              <div className="bcre-table-wrap">
                <table className="bcre-table">
                  <thead>
                    <tr>
                      <th>Match</th>
                      <th>Customer / refs</th>
                      <th>Bank</th>
                      <th>Received</th>
                      <th>Expected</th>
                      <th>Variance</th>
                      <th>Case</th>
                      <th>Score</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {matches.map((m) => (
                      <tr key={m.id}>
                        <td>
                          <StatusBadge status={m.matchType} />
                          <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                            {m.varianceType}
                          </div>
                        </td>
                        <td>
                          <strong>{m.line?.customerName ?? '—'}</strong>
                          <div className="text-muted">{m.line?.applicationNumber ?? '—'}</div>
                          <div className="text-muted">{m.line?.loanAccountNumber ?? '—'}</div>
                        </td>
                        <td>{m.bankName}</td>
                        <td>{formatCurrency(m.receivedCommission)}</td>
                        <td>{formatCurrency(m.expectedCommission)}</td>
                        <td
                          style={{
                            color:
                              m.variance < 0 ? '#b91c1c' : m.variance > 0 ? '#b45309' : '#047857',
                            fontWeight: 600,
                          }}
                        >
                          {formatCurrency(m.variance)}
                        </td>
                        <td>{m.caseNumber ?? '—'}</td>
                        <td>{m.matchScore}</td>
                        <td>
                          <StatusBadge status={m.status} />
                        </td>
                        <td>
                          {canBcre(role, 'reviewMatch') && m.status === 'PENDING_REVIEW' ? (
                            <div className="bcre-actions" style={{ marginTop: 0 }}>
                              <Button
                                type="button"
                                size="sm"
                                variant="primary"
                                disabled={mutating}
                                onClick={() =>
                                  reviewMutation.mutate({ id: m.id, action: 'accept' })
                                }
                              >
                                Accept
                              </Button>
                              <Button
                                type="button"
                                size="sm"
                                variant="secondary"
                                disabled={mutating || !disputeNote.trim()}
                                onClick={() =>
                                  reviewMutation.mutate({
                                    id: m.id,
                                    action: 'dispute',
                                    reason: disputeNote.trim(),
                                  })
                                }
                              >
                                Dispute
                              </Button>
                              <Button
                                type="button"
                                size="sm"
                                variant="ghost"
                                disabled={mutating}
                                onClick={() =>
                                  reviewMutation.mutate({
                                    id: m.id,
                                    action: 'write-off',
                                    note: 'Written off',
                                  })
                                }
                              >
                                Write-off
                              </Button>
                            </div>
                          ) : null}
                          {canBcre(role, 'reviewMatch') && m.status === 'DISPUTED' ? (
                            <Button
                              type="button"
                              size="sm"
                              variant="primary"
                              disabled={mutating}
                              onClick={() =>
                                reviewMutation.mutate({
                                  id: m.id,
                                  action: 'resolve',
                                  note: 'Resolved after review',
                                })
                              }
                            >
                              Resolve
                            </Button>
                          ) : null}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {canBcre(role, 'raiseDispute') ? (
                <div className="bcre-filters" style={{ marginTop: '0.75rem' }}>
                  <input
                    placeholder="Dispute reason (required before Dispute)"
                    value={disputeNote}
                    onChange={(e) => setDisputeNote(e.target.value)}
                  />
                </div>
              ) : null}
            </>
          )}
        </Card>
      ) : null}

      {!pageLoading && !pageError && tab === 'statements' ? (
        <Card title="Uploaded statements">
          {statements.length === 0 ? (
            <div className="bcre-empty">
              <EmptyState
                icon={<Landmark size={32} />}
                title="No statements yet"
                description="Upload a bank commission CSV to start reconciliation."
                action={
                  canBcre(role, 'uploadStatement') ? (
                    <Button type="button" onClick={() => setTab('upload')}>
                      Upload statement
                    </Button>
                  ) : undefined
                }
              />
            </div>
          ) : (
            <div className="bcre-version-list">
              {statements.map((s) => (
                <div key={s.id} className="bcre-version-item">
                  <strong>
                    {s.fileName} · {s.bankName}
                  </strong>
                  <div className="text-muted" style={{ fontSize: '0.8rem' }}>
                    {s.statementPeriod.month ?? '—'} · {formatDate(s.uploadedAt)} · by{' '}
                    {s.uploadedBy}
                  </div>
                  <div style={{ marginTop: 6 }}>
                    <StatusBadge status={s.status} /> · {s.totalRows} rows ·{' '}
                    {formatCurrency(s.totalAmount)}
                  </div>
                  <div className="bcre-actions">
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      onClick={() => {
                        setActiveStatementId(s.id);
                        setTab('workspace');
                      }}
                    >
                      View matches
                    </Button>
                    {canBcre(role, 'reconcile') && s.status !== 'CLOSED' ? (
                      <Button
                        type="button"
                        size="sm"
                        variant="primary"
                        disabled={reconcileMutation.isPending}
                        onClick={() => reconcileMutation.mutate(s.id)}
                      >
                        {reconcileMutation.isPending && reconcileMutation.variables === s.id
                          ? 'Reconciling…'
                          : 'Run reconcile'}
                      </Button>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      ) : null}

      {!pageLoading && !pageError && tab === 'dashboard' ? (
        <Card title="Finance reconciliation dashboard">
          {!summary ? (
            <div className="bcre-empty">
              <EmptyState
                icon={<Landmark size={32} />}
                title="No reconciliation data"
                description="Summary KPIs appear after statements are uploaded and matched."
              />
            </div>
          ) : (
            <>
              <div className="stat-grid bcre-stat-grid">
                <StatCard label="Total received" value={formatCurrency(summary.totalReceived)} />
                <StatCard label="Total expected" value={formatCurrency(summary.totalExpected)} />
                <StatCard label="Total variance" value={formatCurrency(summary.totalVariance)} />
                <StatCard
                  label="Short payments"
                  value={`${summary.shortPaymentCount} · ${formatCurrency(summary.shortPaymentAmount)}`}
                />
                <StatCard label="Matched %" value={`${summary.matchedPercent}%`} />
                <StatCard label="Open disputes" value={String(summary.openDisputes)} />
                <StatCard label="Statements" value={String(summary.totalStatements)} />
                <StatCard
                  label="Pending review"
                  value={String(summary.pendingReviewCount)}
                />
              </div>
              <p className="text-muted" style={{ marginTop: '1rem' }}>
                Matched % = (exact + probable) / all match rows. Short payments unlock dispute
                workflows for Finance.
              </p>
              {statements.map((s) => {
                const pct =
                  s.status === 'RECONCILED' || s.status === 'CLOSED'
                    ? Math.round(summary.matchedPercent)
                    : s.status === 'PARSED'
                      ? 0
                      : 50;
                return (
                  <div key={s.id} style={{ marginTop: '0.75rem' }}>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: '0.85rem',
                      }}
                    >
                      <span>
                        {s.statementPeriod.month} · {s.fileName}
                      </span>
                      <span>
                        <StatusBadge status={s.status} />
                      </span>
                    </div>
                    <div
                      style={{
                        height: 8,
                        borderRadius: 99,
                        background: '#e2e8f0',
                        overflow: 'hidden',
                        marginTop: 4,
                      }}
                    >
                      <div style={{ width: `${pct}%`, height: '100%', background: '#059669' }} />
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </Card>
      ) : null}

      {!pageLoading && !pageError && tab === 'disputes' ? (
        <Card title="Disputes">
          {disputes.length === 0 ? (
            <div className="bcre-empty">
              <EmptyState
                icon={<Landmark size={32} />}
                title="No open disputes"
                description="Disputes appear when Finance flags a short payment or unmatched variance."
              />
            </div>
          ) : (
            <div className="bcre-table-wrap">
              <table className="bcre-table">
                <thead>
                  <tr>
                    <th>Bank</th>
                    <th>Amount</th>
                    <th>Reason</th>
                    <th>Raised</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {disputes.map((d) => (
                    <tr key={d.id}>
                      <td>{d.bankName}</td>
                      <td>{formatCurrency(d.amount)}</td>
                      <td>{d.reason}</td>
                      <td>
                        {d.raisedBy}
                        <div className="text-muted">{formatDate(d.raisedAt)}</div>
                      </td>
                      <td>
                        <StatusBadge status={d.status} />
                      </td>
                      <td>
                        {canBcre(role, 'resolveDispute') &&
                        (d.status === 'OPEN' || d.status === 'IN_PROGRESS') ? (
                          <div className="bcre-actions" style={{ marginTop: 0 }}>
                            <Button
                              type="button"
                              size="sm"
                              variant="secondary"
                              disabled={mutating}
                              onClick={() =>
                                disputeUpdateMutation.mutate({
                                  id: d.id,
                                  status: 'IN_PROGRESS',
                                })
                              }
                            >
                              In progress
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="primary"
                              disabled={mutating}
                              onClick={() =>
                                disputeUpdateMutation.mutate({
                                  id: d.id,
                                  status: 'RESOLVED',
                                  resolutionNotes: 'Resolved by finance',
                                })
                              }
                            >
                              Resolve
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              disabled={mutating}
                              onClick={() =>
                                disputeUpdateMutation.mutate({
                                  id: d.id,
                                  status: 'REJECTED',
                                  resolutionNotes: 'Rejected',
                                })
                              }
                            >
                              Reject
                            </Button>
                          </div>
                        ) : null}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      ) : null}

      {!pageLoading && !pageError && tab === 'audit' ? (
        <Card title="Audit log">
          {!canBcre(role, 'fullAudit') && role === 'PARTNER' ? (
            <p className="text-muted">Partners see limited reconciliation history.</p>
          ) : null}
          {audit.length === 0 ? (
            <div className="bcre-empty">
              <EmptyState
                icon={<Landmark size={32} />}
                title="No audit events yet"
                description="Uploads, reconciles, and review actions are recorded here."
              />
            </div>
          ) : (
            <div className="bcre-table-wrap">
              <table className="bcre-table">
                <thead>
                  <tr>
                    <th>When</th>
                    <th>Actor</th>
                    <th>Entity</th>
                    <th>Action</th>
                    <th>IP</th>
                  </tr>
                </thead>
                <tbody>
                  {audit.map((ev) => (
                    <tr key={ev.id}>
                      <td>{formatDate(ev.createdAt)}</td>
                      <td>{ev.actorName}</td>
                      <td>
                        {ev.entityType}
                        <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                          {ev.entityId.slice(0, 8)}…
                        </div>
                      </td>
                      <td>{ev.action}</td>
                      <td>{ev.ipAddress ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      ) : null}
    </div>
  );
}
