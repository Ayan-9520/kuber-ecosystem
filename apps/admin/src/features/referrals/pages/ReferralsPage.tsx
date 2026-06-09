import { useQuery } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';

import { PaginatedListView } from '@/components/common/PaginatedListView';
import { PageHeader, StatCard } from '@/components/ui';
import { StatusBadge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { useDebounce, usePagination } from '@/hooks';
import { fieldStr, formatCurrency, formatDate } from '@/lib/utils';
import { referralsService } from '@/services';

export function ReferralsPage() {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search);
  const { page, limit, setPage, reset } = usePagination();

  useEffect(() => {
    reset();
  }, [debouncedSearch, reset]);

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

  const { data, isLoading } = useQuery({
    queryKey: ['referrals', params],
    queryFn: () => referralsService.list(params),
  });

  const { data: types } = useQuery({
    queryKey: ['referral-types'],
    queryFn: () => referralsService.types({ limit: 100 }),
  });

  const stats = useMemo(() => {
    const items = data?.items ?? [];
    const converted = items.filter((r) => r.status === 'CONVERTED' || r.status === 'COMPLETED').length;
    const pending = items.filter((r) => r.status === 'PENDING' || r.status === 'IN_PROGRESS').length;
    const totalRewards = items.reduce((sum, r) => {
      const amt = typeof r.rewardAmount === 'number' ? r.rewardAmount : parseFloat(String(r.rewardAmount ?? 0));
      return sum + (Number.isNaN(amt) ? 0 : amt);
    }, 0);
    return { total: data?.meta.total ?? 0, converted, pending, totalRewards };
  }, [data]);

  const columns = [
    {
      key: 'referralNumber',
      header: 'Referral #',
      render: (r: Record<string, unknown>) => fieldStr(r, 'referralNumber'),
    },
    { key: 'referralCode', header: 'Code', render: (r: Record<string, unknown>) => fieldStr(r, 'referralCode') },
    { key: 'referrerName', header: 'Referrer', render: (r: Record<string, unknown>) => fieldStr(r, 'referrerName') },
    { key: 'refereeName', header: 'Referee', render: (r: Record<string, unknown>) => fieldStr(r, 'refereeName') },
    {
      key: 'status',
      header: 'Status',
      render: (r: Record<string, unknown>) => <StatusBadge status={fieldStr(r, 'status')} />,
    },
    {
      key: 'rewardAmount',
      header: 'Reward',
      render: (r: Record<string, unknown>) => formatCurrency(r.rewardAmount as number),
    },
    {
      key: 'createdAt',
      header: 'Created',
      render: (r: Record<string, unknown>) => formatDate(r.createdAt as string),
    },
  ];

  return (
    <div className="page-container">
      <PageHeader title="Referrals" subtitle="Track referral pipeline, rewards, and conversion analytics" />

      <div className="stat-grid">
        <StatCard label="Total Referrals" value={stats.total} />
        <StatCard label="Pending / Active" value={stats.pending} change="Current page snapshot" />
        <StatCard label="Converted" value={stats.converted} change="Current page snapshot" />
        <StatCard label="Rewards (page)" value={formatCurrency(stats.totalRewards)} />
      </div>

      <div className="grid-2" style={{ marginBottom: '1.5rem' }}>
        <Card title="Referral Types">
          {(types?.items ?? []).length === 0 ? (
            <p className="page-subtitle">No referral types configured</p>
          ) : (
            <div className="data-table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>Name</th>
                    <th>Default Reward</th>
                  </tr>
                </thead>
                <tbody>
                  {(types?.items ?? []).map((t) => (
                    <tr key={String(t.id)}>
                      <td>{fieldStr(t, 'code')}</td>
                      <td>{fieldStr(t, 'name')}</td>
                      <td>{formatCurrency(t.defaultRewardPct as number)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
        <Card title="Tracking Overview">
          <p className="page-subtitle" style={{ marginBottom: '1rem' }}>
            Monitor referral codes, referee details, and reward status across the network.
          </p>
          <div className="info-grid">
            <div>
              <div className="info-item-label">Active Types</div>
              <div className="info-item-value">{types?.items?.length ?? 0}</div>
            </div>
            <div>
              <div className="info-item-label">Page Results</div>
              <div className="info-item-value">{data?.items?.length ?? 0}</div>
            </div>
          </div>
        </Card>
      </div>

      <PaginatedListView
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by referral number, code, or name..."
        isLoading={isLoading}
        data={data?.items ?? []}
        meta={data?.meta}
        onPageChange={setPage}
        columns={columns}
        emptyTitle="No referrals found"
        emptyDescription="Referrals will appear here when partners or customers share referral codes."
      />
    </div>
  );
}
