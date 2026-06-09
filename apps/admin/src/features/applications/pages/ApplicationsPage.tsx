import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  DataTable,
  EmptyState,
  PageHeader,
  Pagination,
  SearchInput,
  Select,
  StatusBadge,
  TableSkeleton,
} from '@/components/ui';
import { useDebounce, usePagination } from '@/hooks';
import { formatCurrency, formatDate } from '@/lib/utils';
import { applicationsService } from '@/services/index';

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'DRAFT', label: 'Draft' },
  { value: 'SUBMITTED', label: 'Submitted' },
  { value: 'IN_REVIEW', label: 'In Review' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'SANCTIONED', label: 'Sanctioned' },
  { value: 'DISBURSED', label: 'Disbursed' },
  { value: 'REJECTED', label: 'Rejected' },
];

function str(v: unknown): string {
  if (v === null || v === undefined) return '—';
  return String(v);
}

export function ApplicationsPage() {
  const navigate = useNavigate();
  const { page, limit, setPage, reset } = usePagination();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const debouncedSearch = useDebounce(search);

  useEffect(() => {
    reset();
  }, [debouncedSearch, status, reset]);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['applications', page, limit, debouncedSearch, status],
    queryFn: () =>
      applicationsService.list({
        page,
        limit,
        search: debouncedSearch || undefined,
        status: status || undefined,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      }),
  });

  return (
    <div className="page-container">
      <PageHeader title="Applications" subtitle="Track loan applications through the pipeline" />

      <div className="filter-bar">
        <SearchInput value={search} onChange={setSearch} placeholder="Search applications..." />
        <Select options={STATUS_OPTIONS} value={status} onChange={(e) => setStatus(e.target.value)} />
      </div>

      {isLoading ? (
        <TableSkeleton rows={8} cols={6} />
      ) : isError ? (
        <EmptyState title="Failed to load applications" />
      ) : (data?.items.length ?? 0) === 0 ? (
        <EmptyState
          title="No applications found"
          description={debouncedSearch || status ? 'Try adjusting your filters.' : 'Applications will appear here.'}
        />
      ) : (
        <>
          <DataTable
            columns={[
              { key: 'applicationNumber', header: 'Application #', render: (r) => str(r.applicationNumber ?? r.id) },
              { key: 'customerName', header: 'Customer', render: (r) => str(r.customerName ?? r.customerId) },
              { key: 'productName', header: 'Product', render: (r) => str(r.productName ?? r.productId) },
              { key: 'loanAmount', header: 'Amount', render: (r) => formatCurrency(r.loanAmount as number) },
              {
                key: 'status',
                header: 'Status',
                render: (r) => <StatusBadge status={str(r.status)} />,
              },
              { key: 'createdAt', header: 'Created', render: (r) => formatDate(r.createdAt as string) },
            ]}
            data={data?.items ?? []}
            onRowClick={(row) => navigate(`/applications/${row.id}`)}
          />
          {data?.meta && <Pagination meta={data.meta} onPageChange={setPage} />}
        </>
      )}
    </div>
  );
}
