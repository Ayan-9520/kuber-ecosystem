import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { PaginatedListView } from '@/components/common/PaginatedListView';
import { Button, PageHeader, StatCard, Tabs } from '@/components/ui';
import { StatusBadge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { useDebounce, usePagination } from '@/hooks';
import { fieldStr, formatCurrency, formatDate } from '@/lib/utils';
import { commissionsService } from '@/services';

type TabId = 'dashboard' | 'ledger' | 'approvals' | 'payments' | 'recoveries' | 'adjustments';

const TABS: { id: TabId; label: string }[] = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'ledger', label: 'Ledger' },
  { id: 'approvals', label: 'Approvals' },
  { id: 'payments', label: 'Payments' },
  { id: 'recoveries', label: 'Recoveries' },
  { id: 'adjustments', label: 'Adjustments' },
];

const FETCHERS: Record<
  Exclude<TabId, 'dashboard'>,
  (params: Record<string, unknown>) => ReturnType<typeof commissionsService.ledger>
> = {
  ledger: commissionsService.ledger,
  approvals: commissionsService.approvals,
  payments: commissionsService.payments,
  recoveries: commissionsService.recoveries,
  adjustments: commissionsService.adjustments,
};

export function CommissionsPage() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<TabId>('dashboard');
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search);
  const { page, limit, setPage, reset } = usePagination();

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
    enabled: tab === 'dashboard',
  });

  const { data, isLoading } = useQuery({
    queryKey: ['commissions', tab, params],
    queryFn: () => FETCHERS[tab as Exclude<TabId, 'dashboard'>](params),
    enabled: tab !== 'dashboard',
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
          { key: 'partnerId', header: 'Partner', render: (r: Record<string, unknown>) => fieldStr(r, 'partnerId') },
          {
            key: 'adjustmentAmount',
            header: 'Amount',
            render: (r: Record<string, unknown>) => formatCurrency(r.adjustmentAmount as number),
          },
          statusCol,
          { key: 'createdAt', header: 'Date', render: (r: Record<string, unknown>) => formatDate(r.createdAt as string) },
        ];
      default:
        return [];
    }
  }, [tab, renderActions]);

  const emptyTitles: Record<Exclude<TabId, 'dashboard'>, string> = {
    ledger: 'No ledger entries',
    approvals: 'No pending approvals',
    payments: 'No payments recorded',
    recoveries: 'No recoveries found',
    adjustments: 'No adjustments found',
  };

  return (
    <div className="page-container">
      <PageHeader title="Commissions" subtitle="Commission analytics, ledger, approvals, and payouts" />

      <Tabs tabs={TABS} active={tab} onChange={(id) => setTab(id as TabId)} />

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
          emptyTitle={emptyTitles[tab as Exclude<TabId, 'dashboard'>]}
          emptyDescription="Commission records will appear as leads convert and payouts are processed."
        />
      )}
    </div>
  );
}
