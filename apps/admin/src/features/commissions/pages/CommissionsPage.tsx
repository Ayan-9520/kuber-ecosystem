import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { PaginatedListView } from '@/components/common/PaginatedListView';
import { Button, PageHeader, StatCard, Tabs } from '@/components/ui';
import { StatusBadge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { useDebounce, usePagination } from '@/hooks';
import { fieldStr, formatCurrency, formatDate } from '@/lib/utils';
import { commissionsService } from '@/services';

type TabId = 'dashboard' | 'ledger' | 'approvals' | 'payments' | 'recoveries' | 'adjustments' | 'rules' | 'cycles' | 'tds';

const TABS: { id: TabId; label: string }[] = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'ledger', label: 'Ledger' },
  { id: 'approvals', label: 'Approvals' },
  { id: 'payments', label: 'Payments' },
  { id: 'recoveries', label: 'Recoveries' },
  { id: 'adjustments', label: 'Adjustments' },
  { id: 'rules', label: 'Rules' },
  { id: 'cycles', label: 'Payout Cycles' },
  { id: 'tds', label: 'TDS' },
];

const FETCHERS: Record<
  Exclude<TabId, 'dashboard' | 'cycles' | 'tds'>,
  (params: Record<string, unknown>) => ReturnType<typeof commissionsService.ledger>
> = {
  ledger: commissionsService.ledger,
  approvals: commissionsService.approvals,
  payments: commissionsService.payments,
  recoveries: commissionsService.recoveries,
  adjustments: commissionsService.adjustments,
  rules: commissionsService.rules,
};

const CUSTOM_TABS: TabId[] = ['dashboard', 'cycles', 'tds'];

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export function CommissionsPage() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<TabId>('dashboard');
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search);
  const { page, limit, setPage, reset } = usePagination();
  const [selectedRule, setSelectedRule] = useState<Record<string, unknown> | null>(null);

  const [cycleMonth, setCycleMonth] = useState(new Date().getMonth() + 1);
  const [cycleYear, setCycleYear] = useState(new Date().getFullYear());

  useEffect(() => {
    reset();
  }, [tab, debouncedSearch, reset]);

  const params = useMemo(
    () => ({
      page,
      limit,
      search: debouncedSearch || undefined,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    }),
    [page, limit, debouncedSearch],
  );

  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ['commission-analytics'],
    queryFn: () => commissionsService.analytics(),
    enabled: tab === 'dashboard' || tab === 'tds',
  });

  const { data, isLoading } = useQuery({
    queryKey: ['commissions', tab, params],
    queryFn: () => FETCHERS[tab as Exclude<TabId, 'dashboard' | 'cycles' | 'tds'>](params),
    enabled: !CUSTOM_TABS.includes(tab),
  });

  const { data: cyclesData, isLoading: cyclesLoading } = useQuery({
    queryKey: ['commission-payout-cycles', params],
    queryFn: () => commissionsService.payoutCycles(params),
    enabled: tab === 'cycles',
  });

  const { data: cyclePreview, refetch: refetchPreview, isFetching: previewLoading } = useQuery({
    queryKey: ['commission-cycle-preview'],
    queryFn: () => commissionsService.previewCycle(),
    enabled: false,
  });

  const generateMutation = useMutation({
    mutationFn: (data: { month: number; year: number }) => commissionsService.generateCycle(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['commission-payout-cycles'] });
    },
  });

  const executeMutation = useMutation({
    mutationFn: (cycleId: string) => commissionsService.executeCycle(cycleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['commission-payout-cycles'] });
    },
  });

  const actionMutation = useMutation({
    mutationFn: async ({ action, id }: { action: 'approve' | 'reject' | 'pay' | 'release'; id: string }) => {
      if (tab === 'approvals') {
        if (action === 'approve') return commissionsService.approveApproval(id, { approvedAmount: 5000 });
        return commissionsService.rejectApproval(id);
      }
      if (action === 'approve') return commissionsService.approvePayment(id);
      return commissionsService.releasePayment(id, { paymentReference: `ADM-${Date.now()}` });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['commissions'] });
      queryClient.invalidateQueries({ queryKey: ['commission-analytics'] });
    },
  });

  const renderActions = useCallback(
    (r: Record<string, unknown>) => {
      const status = fieldStr(r, 'status');
      if (tab === 'approvals' && (status === 'PENDING' || status === 'SUBMITTED')) {
        return (
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Button variant="primary" size="sm" onClick={() => actionMutation.mutate({ action: 'approve', id: String(r.id) })}>
              Approve
            </Button>
            <Button variant="secondary" size="sm" onClick={() => actionMutation.mutate({ action: 'reject', id: String(r.id) })}>
              Reject
            </Button>
          </div>
        );
      }
      if (tab === 'payments') {
        if (status === 'PENDING' || status === 'SUBMITTED') {
          return (
            <Button variant="primary" size="sm" onClick={() => actionMutation.mutate({ action: 'approve', id: String(r.id) })}>
              Approve
            </Button>
          );
        }
        if (status === 'APPROVED') {
          return (
            <Button variant="primary" size="sm" onClick={() => actionMutation.mutate({ action: 'release', id: String(r.id) })}>
              Pay
            </Button>
          );
        }
      }
      return null;
    },
    [tab, actionMutation],
  );

  const listColumns = useMemo(() => {
    const statusCol = {
      key: 'status',
      header: 'Status',
      render: (r: Record<string, unknown>) => <StatusBadge status={fieldStr(r, 'status')} />,
    };

    switch (tab) {
      case 'ledger':
        return [
          { key: 'ledgerNumber', header: 'Ledger #', render: (r: Record<string, unknown>) => fieldStr(r, 'ledgerNumber') },
          { key: 'partnerId', header: 'Partner', render: (r: Record<string, unknown>) => fieldStr(r, 'partnerId') },
          { key: 'commissionType', header: 'Type', render: (r: Record<string, unknown>) => fieldStr(r, 'commissionType') },
          {
            key: 'commissionAmount',
            header: 'Amount',
            render: (r: Record<string, unknown>) => formatCurrency(r.commissionAmount as number),
          },
          statusCol,
          { key: 'createdAt', header: 'Date', render: (r: Record<string, unknown>) => formatDate(r.createdAt as string) },
        ];
      case 'approvals':
        return [
          {
            key: 'approvalNumber',
            header: 'Approval #',
            render: (r: Record<string, unknown>) => fieldStr(r, 'approvalNumber'),
          },
          { key: 'ledgerId', header: 'Ledger', render: (r: Record<string, unknown>) => fieldStr(r, 'ledgerId') },
          statusCol,
          { key: 'createdAt', header: 'Date', render: (r: Record<string, unknown>) => formatDate(r.createdAt as string) },
          { key: 'actions', header: 'Actions', render: renderActions },
        ];
      case 'payments':
        return [
          { key: 'paymentNumber', header: 'Payment #', render: (r: Record<string, unknown>) => fieldStr(r, 'paymentNumber') },
          { key: 'partnerId', header: 'Partner', render: (r: Record<string, unknown>) => fieldStr(r, 'partnerId') },
          {
            key: 'totalAmount',
            header: 'Amount',
            render: (r: Record<string, unknown>) => formatCurrency(r.totalAmount as number),
          },
          statusCol,
          { key: 'createdAt', header: 'Date', render: (r: Record<string, unknown>) => formatDate(r.createdAt as string) },
          { key: 'actions', header: 'Actions', render: renderActions },
        ];
      case 'recoveries':
        return [
          {
            key: 'recoveryNumber',
            header: 'Recovery #',
            render: (r: Record<string, unknown>) => fieldStr(r, 'recoveryNumber'),
          },
          { key: 'partnerId', header: 'Partner', render: (r: Record<string, unknown>) => fieldStr(r, 'partnerId') },
          {
            key: 'recoveryAmount',
            header: 'Amount',
            render: (r: Record<string, unknown>) => formatCurrency(r.recoveryAmount as number),
          },
          statusCol,
          { key: 'createdAt', header: 'Date', render: (r: Record<string, unknown>) => formatDate(r.createdAt as string) },
        ];
      case 'adjustments':
        return [
          {
            key: 'adjustmentNumber',
            header: 'Adjustment #',
            render: (r: Record<string, unknown>) => fieldStr(r, 'adjustmentNumber'),
          },
          { key: 'partnerId', header: 'Partner', render: (r: Record<string, unknown>) => fieldStr(r, 'adjustmentNumber') },
          {
            key: 'adjustmentAmount',
            header: 'Amount',
            render: (r: Record<string, unknown>) => formatCurrency(r.adjustmentAmount as number),
          },
          statusCol,
          { key: 'createdAt', header: 'Date', render: (r: Record<string, unknown>) => formatDate(r.createdAt as string) },
        ];
      case 'rules':
        return [
          { key: 'ruleCode', header: 'Rule Code', render: (r: Record<string, unknown>) => fieldStr(r, 'ruleCode') },
          { key: 'name', header: 'Name', render: (r: Record<string, unknown>) => fieldStr(r, 'name') },
          { key: 'commissionType', header: 'Type', render: (r: Record<string, unknown>) => fieldStr(r, 'commissionType') },
          { key: 'calculationMethod', header: 'Method', render: (r: Record<string, unknown>) => fieldStr(r, 'calculationMethod') },
          {
            key: 'amount',
            header: 'Rate / Amount',
            render: (r: Record<string, unknown>) =>
              r.percentage ? `${r.percentage}%` : formatCurrency(r.fixedAmount as number),
          },
          statusCol,
          { key: 'createdAt', header: 'Created', render: (r: Record<string, unknown>) => formatDate(r.createdAt as string) },
        ];
      default:
        return [];
    }
  }, [tab, renderActions]);

  const emptyTitles: Record<Exclude<TabId, 'dashboard' | 'cycles' | 'tds'>, string> = {
    ledger: 'No ledger entries',
    approvals: 'No pending approvals',
    payments: 'No payments recorded',
    recoveries: 'No recoveries found',
    adjustments: 'No adjustments found',
    rules: 'No commission rules found',
  };

  const renderCyclesTab = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="grid-2">
        <Card title="Current Cycle Preview">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => refetchPreview()}
            disabled={previewLoading}
          >
            {previewLoading ? 'Loading...' : 'Preview Current Cycle'}
          </Button>
          {cyclePreview && (
            <div className="data-table-wrapper" style={{ marginTop: '1rem' }}>
              <table className="data-table">
                <tbody>
                  <tr><td>Total Partners</td><td>{String(cyclePreview.totalPartners ?? '—')}</td></tr>
                  <tr><td>Total Gross</td><td>{formatCurrency(cyclePreview.totalGross as number)}</td></tr>
                  <tr><td>Total TDS</td><td>{formatCurrency(cyclePreview.totalTds as number)}</td></tr>
                  <tr><td>Total Net</td><td>{formatCurrency(cyclePreview.totalNet as number)}</td></tr>
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <Card title="Generate Payout Cycle">
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <div>
              <label className="form-label">Month</label>
              <select
                className="form-input"
                value={cycleMonth}
                onChange={(e) => setCycleMonth(Number(e.target.value))}
              >
                {MONTHS.map((m, i) => (
                  <option key={i} value={i + 1}>{m}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="form-label">Year</label>
              <select
                className="form-input"
                value={cycleYear}
                onChange={(e) => setCycleYear(Number(e.target.value))}
              >
                {[cycleYear - 1, cycleYear, cycleYear + 1].map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={() => generateMutation.mutate({ month: cycleMonth, year: cycleYear })}
              disabled={generateMutation.isPending}
            >
              {generateMutation.isPending ? 'Generating...' : 'Generate Cycle'}
            </Button>
          </div>
        </Card>
      </div>

      <Card title="Past Payout Cycles">
        {cyclesLoading ? (
          <div className="skeleton skeleton-stat" />
        ) : (cyclesData?.items ?? []).length ? (
          <div className="data-table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Cycle ID</th>
                  <th>Month</th>
                  <th>Year</th>
                  <th>Partners</th>
                  <th>Gross</th>
                  <th>Net</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {(cyclesData?.items ?? []).map((row, i) => (
                  <tr key={i}>
                    <td>{fieldStr(row, 'cycleId') || fieldStr(row, 'id')}</td>
                    <td>{MONTHS[(row.month as number) - 1] ?? String(row.month ?? '—')}</td>
                    <td>{String(row.year ?? '—')}</td>
                    <td>{String(row.totalPartners ?? '—')}</td>
                    <td>{formatCurrency(row.totalGross as number)}</td>
                    <td>{formatCurrency(row.totalNet as number)}</td>
                    <td><StatusBadge status={fieldStr(row, 'status')} /></td>
                    <td>
                      {fieldStr(row, 'status') === 'GENERATED' && (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => executeMutation.mutate(String(row.id))}
                          disabled={executeMutation.isPending}
                        >
                          Execute
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="page-subtitle">No payout cycles yet</p>
        )}
      </Card>
    </div>
  );

  const renderTdsTab = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <Card title="TDS Configuration">
        <div className="stat-grid">
          <StatCard label="TDS Rate" value="5%" />
          <StatCard label="Threshold" value="₹15,000" />
          <StatCard label="Section" value="194H" />
        </div>
      </Card>

      <Card title="Partner TDS Summary">
        {analyticsLoading ? (
          <div className="skeleton skeleton-stat" />
        ) : (analytics?.partnerEarnings ?? []).length ? (
          <div className="data-table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Partner</th>
                  <th>Annual Commission</th>
                  <th>TDS Applicable</th>
                  <th>TDS Amount (5%)</th>
                  <th>Net Payable</th>
                </tr>
              </thead>
              <tbody>
                {(analytics?.partnerEarnings ?? []).map((row, i) => {
                  const amount = Number(row.commissionAmount ?? 0);
                  const tdsApplicable = amount > 15000;
                  const tds = tdsApplicable ? amount * 0.05 : 0;
                  return (
                    <tr key={i}>
                      <td>{row.partnerName || row.partnerCode || '—'}</td>
                      <td>{formatCurrency(amount)}</td>
                      <td>{tdsApplicable ? 'Yes' : 'No'}</td>
                      <td>{formatCurrency(tds)}</td>
                      <td>{formatCurrency(amount - tds)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="page-subtitle">No partner earnings data yet</p>
        )}
      </Card>
    </div>
  );

  const renderRuleDetail = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <Button variant="secondary" size="sm" onClick={() => setSelectedRule(null)}>
        ← Back to Rules
      </Button>
      <Card title={fieldStr(selectedRule!, 'name') || 'Rule Details'}>
        <div className="data-table-wrapper">
          <table className="data-table">
            <tbody>
              {['ruleCode', 'name', 'commissionType', 'calculationMethod', 'percentage', 'fixedAmount', 'status', 'description', 'createdAt', 'updatedAt'].map((key) => {
                const val = selectedRule![key];
                if (val == null || val === '') return null;
                const display = key.endsWith('At') ? formatDate(val as string) : key === 'fixedAmount' ? formatCurrency(val as number) : key === 'percentage' ? `${val}%` : String(val);
                return (
                  <tr key={key}>
                    <td style={{ fontWeight: 600, textTransform: 'capitalize' }}>{key.replace(/([A-Z])/g, ' $1')}</td>
                    <td>{display}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );

  return (
    <div className="page-container">
      <PageHeader title="Commissions" subtitle="Commission analytics, ledger, approvals, and payouts" />

      <Tabs tabs={TABS} active={tab} onChange={(id) => { setTab(id as TabId); setSelectedRule(null); }} />

      {tab === 'dashboard' ? (
        analyticsLoading ? (
          <div className="stat-grid">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="skeleton skeleton-stat" />
            ))}
          </div>
        ) : (
          <>
            <div className="stat-grid">
              <StatCard
                label="Total Commission"
                value={formatCurrency(analytics?.totals.totalCommission)}
              />
              <StatCard label="Outstanding" value={formatCurrency(analytics?.commissionOutstanding)} />
              <StatCard label="Paid" value={formatCurrency(analytics?.paidCommissions)} />
              <StatCard
                label="Recovered"
                value={formatCurrency(analytics?.recoverySummary.totalRecovered)}
              />
            </div>

            <div className="grid-2">
              <Card title="Partner Earnings">
                {(analytics?.partnerEarnings ?? []).length ? (
                  <div className="data-table-wrapper">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Partner</th>
                          <th>Status</th>
                          <th>Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(analytics?.partnerEarnings ?? []).slice(0, 8).map((row, i) => (
                          <tr key={i}>
                            <td>{row.partnerName || row.partnerCode || '—'}</td>
                            <td>
                              <StatusBadge status={row.status ?? 'UNKNOWN'} />
                            </td>
                            <td>{formatCurrency(row.commissionAmount)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="page-subtitle">No partner earnings data yet</p>
                )}
              </Card>
              <Card title="Branch Performance">
                {(analytics?.branchPerformance ?? []).length ? (
                  <div className="data-table-wrapper">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Branch</th>
                          <th>Entries</th>
                          <th>Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(analytics?.branchPerformance ?? []).slice(0, 8).map((row, i) => (
                          <tr key={i}>
                            <td>{row.branchName || row.branchId || '—'}</td>
                            <td>{row._count ?? '—'}</td>
                            <td>{formatCurrency(row._sum?.commissionAmount)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="page-subtitle">No branch performance data yet</p>
                )}
              </Card>
            </div>
          </>
        )
      ) : tab === 'cycles' ? (
        renderCyclesTab()
      ) : tab === 'tds' ? (
        renderTdsTab()
      ) : tab === 'rules' && selectedRule ? (
        renderRuleDetail()
      ) : (
        <PaginatedListView
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder={`Search ${tab}...`}
          isLoading={isLoading}
          data={data?.items ?? []}
          meta={data?.meta}
          onPageChange={setPage}
          columns={listColumns}
          onRowClick={tab === 'rules' ? (row) => setSelectedRule(row) : undefined}
          emptyTitle={emptyTitles[tab as Exclude<TabId, 'dashboard' | 'cycles' | 'tds'>]}
          emptyDescription="Commission records will appear as leads convert and payouts are processed."
        />
      )}
    </div>
  );
}
