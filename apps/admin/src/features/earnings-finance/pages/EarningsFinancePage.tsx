import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  BadgeCheck,
  Banknote,
  BarChart3,
  BookOpen,
  ClipboardCheck,
  Download,
  FilePlus,
  FileSpreadsheet,
  Gift,
  History,
  Hourglass,
  LayoutDashboard,
  Loader,
  Percent,
  Receipt,
  RefreshCw,
  Shield,
  Target,
  Trophy,
  Users,
  Wallet,
  XCircle,
} from 'lucide-react';

import { CommissionTimeline } from '../components/CommissionTimeline';
import { mapApprovalRow, mapLedgerRow, mapPaymentRow, mergeLedgerTimeline } from '../data/mappers';
import {
  canFinanceAction,
  modulesForRole,
  resolveFinanceRole,
  type FinanceAction,
} from '../data/permissions';
import type {
  ApprovalRow,
  EarningsModuleId,
  LedgerRow,
  LedgerStatus,
  PaymentRow,
} from '../data/types';

import { Button, Card, EmptyState, PageHeader, StatCard, TableSkeleton } from '@/components/ui';
import { StatusBadge } from '@/components/ui/Badge';
import { usePermissions } from '@/hooks/usePermissions';
import { formatCurrency, formatDate } from '@/lib/utils';
import { commissionsService } from '@/services';

import '../earnings-finance.css';

const ICON_MAP = {
  LayoutDashboard,
  Target,
  FilePlus,
  ClipboardCheck,
  History,
  Wallet,
  Hourglass,
  BadgeCheck,
  Loader,
  Banknote,
  XCircle,
  Receipt,
  BookOpen,
  Percent,
  FileSpreadsheet,
  Download,
  Trophy,
  Gift,
  Users,
  BarChart3,
} as const;

const PAGE_LIMIT = 50;

const STATUS_MODULE: Partial<Record<EarningsModuleId, LedgerStatus>> = {
  pending: 'PENDING',
  approved: 'APPROVED',
  paid: 'PAID',
  rejected: 'REJECTED',
};

const ANALYTICS_MODULES: EarningsModuleId[] = [
  'earnings-dashboard',
  'wallet',
  'incentives',
  'analytics',
];

const LEDGER_MODULES: EarningsModuleId[] = [
  'commission-tracker',
  'invoice-timeline',
  'pending',
  'approved',
  'paid',
  'rejected',
  'ledger',
  'bonuses',
];

const APPROVAL_MODULES: EarningsModuleId[] = ['invoice-approval', 'invoice-timeline'];

const PAYMENT_MODULES: EarningsModuleId[] = ['processing', 'payout-history'];

function ActionBar({
  role,
  actions,
  onAction,
  disabled,
}: {
  role: ReturnType<typeof resolveFinanceRole>;
  actions: { action: FinanceAction; label: string; variant?: 'primary' | 'secondary' | 'danger' }[];
  onAction: (action: FinanceAction) => void;
  disabled?: boolean;
}) {
  const visible = actions.filter((a) => canFinanceAction(role, a.action));
  if (!visible.length) return null;
  return (
    <div className="earnings-finance__actions">
      {visible.map((a) => (
        <Button
          key={a.action}
          type="button"
          size="sm"
          variant={a.variant ?? 'secondary'}
          disabled={disabled}
          onClick={() => onAction(a.action)}
        >
          {a.label}
        </Button>
      ))}
    </div>
  );
}

function QueryError({ message, onRetry, isFetching }: { message: string; onRetry: () => void; isFetching?: boolean }) {
  return (
    <EmptyState
      icon={<AlertTriangle size={36} />}
      title="Couldn’t load finance data"
      description={message}
      action={
        <Button type="button" onClick={onRetry} disabled={isFetching}>
          <RefreshCw size={14} style={{ marginRight: 6 }} />
          {isFetching ? 'Retrying…' : 'Retry'}
        </Button>
      }
    />
  );
}

function ComingSoon({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return <EmptyState title={title} description={description} action={action} />;
}

export function EarningsFinancePage() {
  const { user, hasPermission } = usePermissions();
  const queryClient = useQueryClient();
  const role = resolveFinanceRole({
    roles: user?.roles,
    permissions: user?.permissions,
  });
  const modules = useMemo(() => modulesForRole(role), [role]);
  const [active, setActive] = useState<EarningsModuleId>('earnings-dashboard');
  const [selectedLedger, setSelectedLedger] = useState<LedgerRow | null>(null);
  const [selectedApproval, setSelectedApproval] = useState<ApprovalRow | null>(null);
  const [selectedForInvoice, setSelectedForInvoice] = useState<Set<string>>(new Set());
  const [toast, setToast] = useState<string | null>(null);

  const notify = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2800);
  };

  const invalidateFinance = () => {
    void queryClient.invalidateQueries({ queryKey: ['earnings-finance'] });
  };

  const analyticsQuery = useQuery({
    queryKey: ['earnings-finance', 'analytics'],
    queryFn: () => commissionsService.analytics(),
    enabled: ANALYTICS_MODULES.includes(active),
    staleTime: 60_000,
  });

  const ledgerStatus = STATUS_MODULE[active];
  const ledgerParams = useMemo(() => {
    const params: Record<string, unknown> = {
      page: 1,
      limit: PAGE_LIMIT,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    };
    if (ledgerStatus) params.status = ledgerStatus;
    if (active === 'bonuses') params.commissionType = 'CAMPAIGN_BONUS';
    return params;
  }, [active, ledgerStatus]);

  const ledgerQuery = useQuery({
    queryKey: ['earnings-finance', 'ledger', ledgerParams],
    queryFn: async () => {
      const res = await commissionsService.ledger(ledgerParams);
      return {
        items: res.items.map((row) => mapLedgerRow(row)),
        meta: res.meta,
      };
    },
    enabled: LEDGER_MODULES.includes(active),
    staleTime: 30_000,
  });

  const raiseEligibleQuery = useQuery({
    queryKey: ['earnings-finance', 'ledger', 'raise-eligible'],
    queryFn: async () => {
      const [calculated, pending] = await Promise.all([
        commissionsService.ledger({
          page: 1,
          limit: PAGE_LIMIT,
          sortBy: 'createdAt',
          sortOrder: 'desc',
          status: 'CALCULATED',
        }),
        commissionsService.ledger({
          page: 1,
          limit: PAGE_LIMIT,
          sortBy: 'createdAt',
          sortOrder: 'desc',
          status: 'PENDING',
        }),
      ]);
      const byId = new Map<string, LedgerRow>();
      for (const row of [...calculated.items, ...pending.items]) {
        const mapped = mapLedgerRow(row);
        byId.set(mapped.id, mapped);
      }
      return Array.from(byId.values());
    },
    enabled: active === 'raise-invoice',
    staleTime: 30_000,
  });

  const approvalsQuery = useQuery({
    queryKey: ['earnings-finance', 'approvals'],
    queryFn: async () => {
      const res = await commissionsService.approvals({
        page: 1,
        limit: PAGE_LIMIT,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      });
      return {
        items: res.items.map((row) => mapApprovalRow(row)),
        meta: res.meta,
      };
    },
    enabled: APPROVAL_MODULES.includes(active),
    staleTime: 30_000,
  });

  const paymentsQuery = useQuery({
    queryKey: ['earnings-finance', 'payments', active],
    queryFn: async () => {
      const params: Record<string, unknown> = {
        page: 1,
        limit: PAGE_LIMIT,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      };
      if (active === 'payout-history') params.status = 'RELEASED';
      const res = await commissionsService.payments(params);
      return {
        items: res.items.map((row) => mapPaymentRow(row)),
        meta: res.meta,
      };
    },
    enabled: PAYMENT_MODULES.includes(active),
    staleTime: 30_000,
  });

  const requestApprovalMutation = useMutation({
    mutationFn: async (ledgerIds: string[]) => {
      for (const ledgerId of ledgerIds) {
        await commissionsService.requestApproval({
          ledgerId,
          notes: 'Submitted from Earnings & Finance',
        });
      }
    },
    onSuccess: (_data, ledgerIds) => {
      setSelectedForInvoice(new Set());
      notify(`Submitted ${ledgerIds.length} commission(s) for approval`);
      invalidateFinance();
    },
    onError: (err: Error) => notify(err.message || 'Failed to submit for approval'),
  });

  const approvalActionMutation = useMutation({
    mutationFn: async ({
      id,
      action,
    }: {
      id: string;
      action: 'approve' | 'reject';
    }) => {
      if (action === 'approve') {
        return commissionsService.approveApproval(id, {});
      }
      return commissionsService.rejectApproval(id, {
        rejectionReason: 'Rejected from Earnings & Finance',
      });
    },
    onSuccess: (_data, vars) => {
      notify(vars.action === 'approve' ? 'Approval granted' : 'Approval rejected');
      invalidateFinance();
    },
    onError: (err: Error) => notify(err.message || 'Approval action failed'),
  });

  const paymentActionMutation = useMutation({
    mutationFn: async ({
      id,
      action,
    }: {
      id: string;
      action: 'approve' | 'release';
    }) => {
      if (action === 'approve') return commissionsService.approvePayment(id);
      return commissionsService.releasePayment(id, {
        paymentReference: `EF-${Date.now()}`,
        notes: 'Released from Earnings & Finance',
      });
    },
    onSuccess: (_data, vars) => {
      notify(vars.action === 'approve' ? 'Payment approved' : 'Payment released');
      invalidateFinance();
    },
    onError: (err: Error) => notify(err.message || 'Payment action failed'),
  });

  const onFinanceAction = (action: FinanceAction) => {
    if (action === 'raiseInvoice') {
      setActive('raise-invoice');
      return;
    }
    if (action === 'viewAuditLogs') {
      notify('Open Audit Logs from Administration for the full trail');
      return;
    }
    if (action === 'trackInvoice') {
      setActive('invoice-approval');
      return;
    }
    if (action === 'approveRejectInvoice' && selectedApproval) {
      approvalActionMutation.mutate({ id: selectedApproval.id, action: 'approve' });
      return;
    }
    if (action === 'schedulePayment') {
      setActive('processing');
      return;
    }
    const labels: Partial<Record<FinanceAction, string>> = {
      downloadReports: 'Statement export is not available from this desk yet — use Commissions exports when enabled',
      verifyInvoice: 'Use Approve on a pending approval to verify',
      holdClarification: 'Hold / clarification is not exposed on the approvals API yet',
      generatePaymentAdvice: 'Payment advice files are not generated by the API yet',
      overrideApprovals: 'Use approve/reject on the Invoice Approval module',
      configurePayoutRules: 'Configure payout rules from the Commissions rules screen',
      manageTds: 'TDS configuration is not available via API yet',
      manageGst: 'GST mapping is not available via API yet',
      bulkPayments: 'Bulk payment batching is not available via API yet',
      exportReports: 'Use Analytics figures on-screen; dedicated export is not wired yet',
      viewEarnings: 'Showing live earnings from commission analytics',
    };
    notify(labels[action] ?? action);
  };

  const ledgerRows = ledgerQuery.data?.items ?? [];
  const approvalRows = approvalsQuery.data?.items ?? [];
  const paymentRows = paymentsQuery.data?.items ?? [];
  const raiseRows = raiseEligibleQuery.data ?? [];

  const processingPayments = paymentRows.filter(
    (p) => p.status === 'PENDING' || p.status === 'APPROVED',
  );

  const openLedgerTimeline = (row: LedgerRow) => {
    setSelectedLedger(row);
    setActive('invoice-timeline');
  };

  const toggleInvoiceSelect = (id: string) => {
    setSelectedForInvoice((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const renderLedgerTable = (
    rows: LedgerRow[],
    opts?: { selectable?: boolean; emptyTitle?: string },
  ) => {
    if (rows.length === 0) {
      return (
        <EmptyState
          title={opts?.emptyTitle ?? 'No commission entries'}
          description="Ledger entries appear when commissions are calculated from leads and applications."
        />
      );
    }
    return (
      <div className="earnings-table-wrap">
        <table className="earnings-table">
          <thead>
            <tr>
              {opts?.selectable ? <th /> : null}
              <th>Reference</th>
              <th>Partner</th>
              <th>Product</th>
              <th>Type</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Updated</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                {opts?.selectable ? (
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedForInvoice.has(row.id)}
                      onChange={() => toggleInvoiceSelect(row.id)}
                      aria-label={`Select ${row.ledgerNumber}`}
                    />
                  </td>
                ) : null}
                <td>
                  {row.ledgerNumber}
                  <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                    {row.caseRef}
                  </div>
                </td>
                <td>
                  {row.partnerName}
                  <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                    {row.partnerCode ?? row.partnerId}
                  </div>
                </td>
                <td>{row.product}</td>
                <td>{row.commissionType}</td>
                <td>{formatCurrency(row.commissionAmount)}</td>
                <td>
                  <StatusBadge status={row.status} />
                </td>
                <td>{formatDate(row.updatedAt)}</td>
                <td>
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={() => openLedgerTimeline(row)}
                  >
                    Timeline
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderPaymentTable = (rows: PaymentRow[], emptyTitle: string) => {
    if (rows.length === 0) {
      return (
        <EmptyState
          title={emptyTitle}
          description="Payments appear after approved commissions are batched for payout."
        />
      );
    }
    return (
      <div className="earnings-table-wrap">
        <table className="earnings-table">
          <thead>
            <tr>
              <th>Payment</th>
              <th>Partner</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Reference</th>
              <th>Date</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td>{row.paymentNumber}</td>
                <td>
                  {row.partnerName}
                  <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                    {row.partnerId}
                  </div>
                </td>
                <td>{formatCurrency(row.totalAmount)}</td>
                <td>
                  <StatusBadge status={row.status} />
                </td>
                <td>{row.paymentReference ?? '—'}</td>
                <td>{formatDate(row.releasedAt ?? row.createdAt)}</td>
                <td>
                  {row.status === 'PENDING' || row.status === 'SUBMITTED' ? (
                    <Button
                      type="button"
                      size="sm"
                      variant="primary"
                      disabled={paymentActionMutation.isPending}
                      onClick={() => paymentActionMutation.mutate({ id: row.id, action: 'approve' })}
                    >
                      Approve
                    </Button>
                  ) : null}
                  {row.status === 'APPROVED' ? (
                    <Button
                      type="button"
                      size="sm"
                      variant="primary"
                      disabled={paymentActionMutation.isPending}
                      onClick={() => paymentActionMutation.mutate({ id: row.id, action: 'release' })}
                    >
                      Release
                    </Button>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const activeModule = modules.find((m) => m.id === active) ?? modules[0];

  const moduleNeedsAnalytics = ANALYTICS_MODULES.includes(active);
  const moduleNeedsLedger = LEDGER_MODULES.includes(active);
  const moduleNeedsRaise = active === 'raise-invoice';
  const moduleNeedsApprovals = APPROVAL_MODULES.includes(active);
  const moduleNeedsPayments = PAYMENT_MODULES.includes(active);

  const isLoading =
    (moduleNeedsAnalytics && analyticsQuery.isLoading) ||
    (moduleNeedsLedger && ledgerQuery.isLoading) ||
    (moduleNeedsRaise && raiseEligibleQuery.isLoading) ||
    (moduleNeedsApprovals && approvalsQuery.isLoading) ||
    (moduleNeedsPayments && paymentsQuery.isLoading);

  const isError =
    (moduleNeedsAnalytics && analyticsQuery.isError) ||
    (moduleNeedsLedger && ledgerQuery.isError) ||
    (moduleNeedsRaise && raiseEligibleQuery.isError) ||
    (moduleNeedsApprovals && approvalsQuery.isError) ||
    (moduleNeedsPayments && paymentsQuery.isError);

  const refetchActive = () => {
    if (moduleNeedsAnalytics) void analyticsQuery.refetch();
    if (moduleNeedsLedger) void ledgerQuery.refetch();
    if (moduleNeedsRaise) void raiseEligibleQuery.refetch();
    if (moduleNeedsApprovals || APPROVAL_MODULES.includes(active)) void approvalsQuery.refetch();
    if (moduleNeedsPayments) void paymentsQuery.refetch();
  };

  const isFetching =
    analyticsQuery.isFetching ||
    ledgerQuery.isFetching ||
    raiseEligibleQuery.isFetching ||
    approvalsQuery.isFetching ||
    paymentsQuery.isFetching;

  const analytics = analyticsQuery.data;

  return (
    <div className="earnings-finance page-container">
      <PageHeader
        title="Earnings & Finance"
        subtitle="Partner earnings, approvals, wallet, TDS/GST and payout workflows — role-based access"
        actions={
          <span className="earnings-finance__role" title="Resolved from your roles & permissions">
            Workspace: {role.replace('_', ' ')}
            {hasPermission(['commissions.read']) ? ' · commissions.read' : ''}
          </span>
        }
      />

      {toast ? (
        <Card>
          <p style={{ margin: 0, fontWeight: 600 }}>{toast}</p>
        </Card>
      ) : null}

      <div className="earnings-finance__grid">
        {modules.map((mod) => {
          const Icon = ICON_MAP[mod.icon as keyof typeof ICON_MAP] ?? LayoutDashboard;
          return (
            <button
              key={mod.id}
              type="button"
              className={`earnings-module-card${active === mod.id ? ' is-active' : ''}`}
              onClick={() => setActive(mod.id)}
            >
              <Icon size={18} style={{ marginBottom: 8, color: 'var(--color-brand-700, #047857)' }} />
              <p className="earnings-module-card__label">{mod.label}</p>
              <p className="earnings-module-card__desc">{mod.description}</p>
            </button>
          );
        })}
      </div>

      <Card title={activeModule?.label ?? 'Module'}>
        {isLoading ? <TableSkeleton rows={5} cols={5} /> : null}

        {!isLoading && isError ? (
          <QueryError
            message="The commissions service did not respond. Check your connection and try again."
            onRetry={refetchActive}
            isFetching={isFetching}
          />
        ) : null}

        {!isLoading && !isError && active === 'earnings-dashboard' && analytics ? (
          <>
            <div className="stat-grid" style={{ marginBottom: '1rem' }}>
              <StatCard label="Total commission" value={formatCurrency(analytics.totals.totalCommission)} />
              <StatCard label="Outstanding" value={formatCurrency(analytics.commissionOutstanding)} />
              <StatCard label="Paid" value={formatCurrency(analytics.paidCommissions)} />
              <StatCard
                label="Recovered"
                value={formatCurrency(analytics.recoverySummary.totalRecovered)}
              />
            </div>
            <ActionBar
              role={role}
              actions={[
                { action: 'raiseInvoice', label: 'Raise invoice', variant: 'primary' },
                { action: 'downloadReports', label: 'Download statement' },
                { action: 'schedulePayment', label: 'Schedule payments', variant: 'primary' },
                { action: 'bulkPayments', label: 'Bulk payments' },
                { action: 'viewAuditLogs', label: 'Audit logs' },
              ]}
              onAction={onFinanceAction}
            />
            {canFinanceAction(role, 'viewAuditLogs') ? (
              <div style={{ marginTop: '1rem' }}>
                <ComingSoon
                  title="Audit trail lives in Audit Logs"
                  description="Commission mutations are recorded in the platform audit log. Open Administration → Audit Logs for the full history."
                  action={
                    <Link to="/audit" className="btn btn-secondary">
                      <Shield size={14} style={{ marginRight: 6 }} />
                      Open Audit Logs
                    </Link>
                  }
                />
              </div>
            ) : null}
          </>
        ) : null}

        {!isLoading && !isError && active === 'commission-tracker' && renderLedgerTable(ledgerRows)}

        {!isLoading && !isError && active === 'raise-invoice' ? (
          <>
            <p className="text-muted">
              Select calculated or pending commissions, then submit them for finance approval (commission
              approvals API).
            </p>
            {renderLedgerTable(raiseRows, {
              selectable: true,
              emptyTitle: 'No commissions ready to submit',
            })}
            <div style={{ marginTop: '1rem' }}>
              <ActionBar
                role={role}
                disabled={selectedForInvoice.size === 0 || requestApprovalMutation.isPending}
                actions={[{ action: 'raiseInvoice', label: 'Submit for approval', variant: 'primary' }]}
                onAction={() => {
                  if (selectedForInvoice.size === 0) {
                    notify('Select at least one commission');
                    return;
                  }
                  requestApprovalMutation.mutate(Array.from(selectedForInvoice));
                }}
              />
            </div>
          </>
        ) : null}

        {!isLoading && !isError && active === 'invoice-approval' ? (
          <div className="earnings-detail-grid">
            {approvalRows.length === 0 ? (
              <EmptyState
                title="No approval requests"
                description="When partners submit commissions for approval, they appear here for verify / approve / reject."
              />
            ) : (
              <>
                <div className="earnings-table-wrap">
                  <table className="earnings-table">
                    <thead>
                      <tr>
                        <th>Approval</th>
                        <th>Partner</th>
                        <th>Requested</th>
                        <th>Status</th>
                        <th />
                      </tr>
                    </thead>
                    <tbody>
                      {approvalRows.map((inv: ApprovalRow) => (
                        <tr key={inv.id}>
                          <td>
                            {inv.approvalNumber}
                            <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                              {inv.ledgerNumber ?? inv.ledgerId}
                            </div>
                          </td>
                          <td>{inv.partnerName}</td>
                          <td>{formatCurrency(inv.requestedAmount)}</td>
                          <td>
                            <StatusBadge status={inv.status} />
                          </td>
                          <td>
                            <Button
                              type="button"
                              size="sm"
                              variant="secondary"
                              onClick={() => setSelectedApproval(inv)}
                            >
                              Open
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div>
                  {selectedApproval ? (
                    <>
                      <h4 style={{ marginTop: 0 }}>{selectedApproval.approvalNumber}</h4>
                      <p className="text-muted">
                        {selectedApproval.partnerName} ·{' '}
                        {formatCurrency(
                          selectedApproval.approvedAmount ?? selectedApproval.requestedAmount,
                        )}
                      </p>
                      {selectedApproval.status === 'PENDING' ? (
                        <div className="earnings-finance__actions" style={{ marginBottom: '0.75rem' }}>
                          {canFinanceAction(role, 'approveRejectInvoice') ? (
                            <>
                              <Button
                                type="button"
                                size="sm"
                                variant="primary"
                                disabled={approvalActionMutation.isPending}
                                onClick={() =>
                                  approvalActionMutation.mutate({
                                    id: selectedApproval.id,
                                    action: 'approve',
                                  })
                                }
                              >
                                Approve
                              </Button>
                              <Button
                                type="button"
                                size="sm"
                                variant="danger"
                                disabled={approvalActionMutation.isPending}
                                onClick={() =>
                                  approvalActionMutation.mutate({
                                    id: selectedApproval.id,
                                    action: 'reject',
                                  })
                                }
                              >
                                Reject
                              </Button>
                            </>
                          ) : null}
                        </div>
                      ) : null}
                      <ActionBar
                        role={role}
                        actions={[
                          { action: 'schedulePayment', label: 'Go to payments' },
                          { action: 'overrideApprovals', label: 'Override (Admin)' },
                        ]}
                        onAction={onFinanceAction}
                      />
                      <div style={{ marginTop: '1rem' }}>
                        <CommissionTimeline events={selectedApproval.timeline} title="Approval timeline" />
                      </div>
                    </>
                  ) : (
                    <p className="text-muted">Select an approval to review.</p>
                  )}
                </div>
              </>
            )}
          </div>
        ) : null}

        {!isLoading && !isError && active === 'invoice-timeline' ? (
          <div className="earnings-detail-grid">
            <div>
              {selectedLedger ? (
                <>
                  <p>
                    <strong>{selectedLedger.ledgerNumber}</strong> · {selectedLedger.product}
                  </p>
                  <p className="text-muted">
                    Base {formatCurrency(selectedLedger.baseAmount)} · Commission{' '}
                    {formatCurrency(selectedLedger.commissionAmount)}
                  </p>
                </>
              ) : (
                <p className="text-muted">Select a commission from Tracker to view its timeline.</p>
              )}
              <div className="earnings-table-wrap" style={{ marginTop: '0.75rem' }}>
                {(ledgerRows.length === 0 && !selectedLedger) ? (
                  <EmptyState
                    title="No ledger entries"
                    description="Open Commission Tracker and choose Timeline on a row."
                  />
                ) : (
                  <table className="earnings-table">
                    <thead>
                      <tr>
                        <th>Commission</th>
                        <th>Status</th>
                        <th />
                      </tr>
                    </thead>
                    <tbody>
                      {(ledgerRows.length ? ledgerRows : selectedLedger ? [selectedLedger] : []).map(
                        (c) => (
                          <tr key={c.id}>
                            <td>{c.ledgerNumber}</td>
                            <td>
                              <StatusBadge status={c.status} />
                            </td>
                            <td>
                              <Button
                                type="button"
                                size="sm"
                                variant="secondary"
                                onClick={() => setSelectedLedger(c)}
                              >
                                View
                              </Button>
                            </td>
                          </tr>
                        ),
                      )}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
            {selectedLedger ? (
              <CommissionTimeline
                events={mergeLedgerTimeline(selectedLedger, approvalRows)}
              />
            ) : (
              <EmptyState title="No timeline selected" description="Pick a commission on the left." />
            )}
          </div>
        ) : null}

        {!isLoading && !isError && active === 'wallet' && analytics ? (
          <div className="stat-grid">
            <StatCard label="Outstanding" value={formatCurrency(analytics.commissionOutstanding)} />
            <StatCard label="Total commission" value={formatCurrency(analytics.totals.totalCommission)} />
            <StatCard label="Paid" value={formatCurrency(analytics.paidCommissions)} />
            <StatCard
              label="Recovered"
              value={formatCurrency(analytics.recoverySummary.totalRecovered)}
            />
          </div>
        ) : null}

        {!isLoading &&
          !isError &&
          STATUS_MODULE[active] &&
          renderLedgerTable(ledgerRows, {
            emptyTitle: `No ${STATUS_MODULE[active]!.toLowerCase()} commissions`,
          })}

        {!isLoading && !isError && active === 'processing'
          ? renderPaymentTable(processingPayments, 'No payments in pipeline')
          : null}

        {!isLoading && !isError && active === 'payout-history' ? (
          <>
            {renderPaymentTable(paymentRows, 'No released payouts yet')}
            <div style={{ marginTop: '1rem' }}>
              <ActionBar
                role={role}
                actions={[
                  { action: 'generatePaymentAdvice', label: 'Generate payment advice' },
                  { action: 'downloadReports', label: 'Download payout CSV' },
                ]}
                onAction={onFinanceAction}
              />
            </div>
          </>
        ) : null}

        {!isLoading && !isError && active === 'ledger' && renderLedgerTable(ledgerRows)}

        {!isLoading && !isError && active === 'tds-centre' ? (
          <ComingSoon
            title="TDS Centre coming soon"
            description="TDS deductions and Form 16A packs are not exposed by the commissions API yet. Figures will appear here once TDS is modelled on ledger entries."
          />
        ) : null}

        {!isLoading && !isError && active === 'gst-reports' ? (
          <ComingSoon
            title="GST reports coming soon"
            description="GST mapping and GSTR packs are not available from the commissions API. This module will light up when GST fields are persisted on commissions."
          />
        ) : null}

        {!isLoading && !isError && active === 'statements' ? (
          <ComingSoon
            title="Statements export coming soon"
            description="Monthly / custom partner statements are not wired to an export endpoint from this desk yet."
          />
        ) : null}

        {!isLoading && !isError && active === 'incentives' && analytics ? (
          analytics.commissionTypeBreakdown.length === 0 &&
          analytics.productPerformance.length === 0 ? (
            <EmptyState
              title="No incentive breakdown yet"
              description="Incentive-style earnings are derived from commission type and product analytics once ledger activity exists."
            />
          ) : (
            <div className="earnings-analytics-grid">
              <div className="earnings-table-wrap">
                <table className="earnings-table">
                  <thead>
                    <tr>
                      <th>Commission type</th>
                      <th>Entries</th>
                      <th>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.commissionTypeBreakdown.map((row, i) => (
                      <tr key={row.commissionType ?? i}>
                        <td>{row.commissionType ?? '—'}</td>
                        <td>{row._count ?? '—'}</td>
                        <td>{formatCurrency(row._sum?.commissionAmount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="earnings-table-wrap">
                <table className="earnings-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Entries</th>
                      <th>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.productPerformance.map((row, i) => (
                      <tr key={row.productId ?? row.productName ?? i}>
                        <td>{row.productName || row.productId || '—'}</td>
                        <td>{row._count ?? '—'}</td>
                        <td>{formatCurrency(row._sum?.commissionAmount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )
        ) : null}

        {!isLoading &&
          !isError &&
          active === 'bonuses' &&
          renderLedgerTable(ledgerRows, { emptyTitle: 'No campaign bonus entries' })}

        {!isLoading && !isError && active === 'referral-income' ? (
          <ComingSoon
            title="Referral income not available yet"
            description="There is no commissions API filter for referral-linked ledger entries. Referral payouts will appear here once referral commissions can be queried."
          />
        ) : null}

        {!isLoading && !isError && active === 'analytics' && analytics ? (
          <>
            <div className="stat-grid" style={{ marginBottom: '1rem' }}>
              <StatCard
                label="Total commission"
                value={formatCurrency(analytics.totals.totalCommission)}
              />
              <StatCard label="Outstanding" value={formatCurrency(analytics.commissionOutstanding)} />
              <StatCard label="Paid" value={formatCurrency(analytics.paidCommissions)} />
              <StatCard
                label="Entries"
                value={String(analytics.totals.entryCount ?? analytics.partnerEarnings.length)}
              />
            </div>
            <div className="earnings-analytics-grid">
              <div className="earnings-table-wrap">
                <h4 style={{ marginTop: 0 }}>Partner earnings</h4>
                {analytics.partnerEarnings.length === 0 ? (
                  <EmptyState title="No partner earnings yet" />
                ) : (
                  <table className="earnings-table">
                    <thead>
                      <tr>
                        <th>Partner</th>
                        <th>Status</th>
                        <th>Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analytics.partnerEarnings.slice(0, 12).map((row, i) => (
                        <tr key={`${row.partnerCode ?? row.partnerName ?? 'p'}-${row.status ?? i}`}>
                          <td>{row.partnerName || row.partnerCode || '—'}</td>
                          <td>
                            <StatusBadge status={row.status ?? 'UNKNOWN'} />
                          </td>
                          <td>{formatCurrency(row.commissionAmount)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
              <div className="earnings-table-wrap">
                <h4 style={{ marginTop: 0 }}>Branch performance</h4>
                {analytics.branchPerformance.length === 0 ? (
                  <EmptyState title="No branch data yet" />
                ) : (
                  <table className="earnings-table">
                    <thead>
                      <tr>
                        <th>Branch</th>
                        <th>Entries</th>
                        <th>Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analytics.branchPerformance.slice(0, 12).map((row, i) => (
                        <tr key={row.branchId ?? row.branchName ?? i}>
                          <td>{row.branchName || row.branchId || '—'}</td>
                          <td>{row._count ?? '—'}</td>
                          <td>{formatCurrency(row._sum?.commissionAmount)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
            <div style={{ marginTop: '1rem' }}>
              <ActionBar
                role={role}
                actions={[
                  { action: 'exportReports', label: 'Export analytics' },
                  { action: 'configurePayoutRules', label: 'Payout rules' },
                  { action: 'viewAuditLogs', label: 'View audit logs' },
                ]}
                onAction={onFinanceAction}
              />
            </div>
            {canFinanceAction(role, 'viewAuditLogs') ? (
              <div style={{ marginTop: '1rem' }}>
                <ComingSoon
                  title="Audit logs"
                  description="This feature does not call a dedicated finance audit endpoint. Use the platform Audit Logs page for commission mutation history."
                  action={
                    <Link to="/audit" className="btn btn-secondary">
                      <Shield size={14} style={{ marginRight: 6 }} />
                      Open Audit Logs
                    </Link>
                  }
                />
              </div>
            ) : null}
          </>
        ) : null}
      </Card>
    </div>
  );
}
