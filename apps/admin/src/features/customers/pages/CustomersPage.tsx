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
import { formatDate } from '@/lib/utils';
import { customersService } from '@/services/index';

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'INACTIVE', label: 'Inactive' },
  { value: 'BLOCKED', label: 'Blocked' },
  { value: 'PENDING_KYC', label: 'Pending KYC' },
];

function str(v: unknown): string {
  if (v === null || v === undefined) return '—';
  return String(v);
}

export function CustomersPage() {
  const navigate = useNavigate();
  const { page, limit, setPage, reset } = usePagination();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const debouncedSearch = useDebounce(search);

  useEffect(() => {
    reset();
  }, [debouncedSearch, status, reset]);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['customers', page, limit, debouncedSearch, status],
    queryFn: () =>
      customersService.list({
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
      <PageHeader title="Customers" subtitle="Browse and manage customer profiles" />

      <div className="filter-bar">
        <SearchInput value={search} onChange={setSearch} placeholder="Search by name, phone, email..." />
        <Select options={STATUS_OPTIONS} value={status} onChange={(e) => setStatus(e.target.value)} />
      </div>

      {isLoading ? (
        <TableSkeleton rows={8} cols={6} />
      ) : isError ? (
        <EmptyState title="Failed to load customers" />
      ) : (data?.items.length ?? 0) === 0 ? (
        <EmptyState
          title="No customers found"
          description={debouncedSearch || status ? 'Try adjusting your filters.' : 'Customers will appear here.'}
        />
      ) : (
        <>
          <DataTable
            columns={[
              { key: 'customerNumber', header: 'Customer #', render: (r) => str(r.customerNumber ?? r.id) },
              { key: 'fullName', header: 'Name', render: (r) => str(r.fullName ?? r.name) },
              { key: 'phone', header: 'Phone', render: (r) => str(r.phone) },
              { key: 'email', header: 'Email', render: (r) => str(r.email) },
              {
                key: 'status',
                header: 'Status',
                render: (r) => <StatusBadge status={str(r.status)} />,
              },
              { key: 'kycStatus', header: 'KYC', render: (r) => <StatusBadge status={str(r.kycStatus ?? 'PENDING')} /> },
              { key: 'createdAt', header: 'Joined', render: (r) => formatDate(r.createdAt as string) },
            ]}
            data={data?.items ?? []}
            onRowClick={(row) => navigate(`/customers/${row.id}`)}
          />
          {data?.meta && <Pagination meta={data.meta} onPageChange={setPage} />}
        </>
      )}
    </div>
  );
}
