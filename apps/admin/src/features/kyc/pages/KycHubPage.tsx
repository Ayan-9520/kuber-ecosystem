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

const KYC_STATUS_OPTIONS = [
  { value: '', label: 'All KYC Statuses' },
  { value: 'NOT_STARTED', label: 'Not Started' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'VERIFIED', label: 'Verified' },
  { value: 'REJECTED', label: 'Rejected' },
  { value: 'EXPIRED', label: 'Expired' },
];

function str(v: unknown): string {
  if (v === null || v === undefined) return '—';
  return String(v);
}

export function KycHubPage() {
  const navigate = useNavigate();
  const { page, limit, setPage, reset } = usePagination();
  const [search, setSearch] = useState('');
  const [kycStatus, setKycStatus] = useState('');
  const debouncedSearch = useDebounce(search);

  useEffect(() => {
    reset();
  }, [debouncedSearch, kycStatus, reset]);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['kyc-customers', page, limit, debouncedSearch, kycStatus],
    queryFn: () =>
      customersService.list({
        page,
        limit,
        search: debouncedSearch || undefined,
        kycStatus: kycStatus || undefined,
        sortBy: 'updatedAt',
        sortOrder: 'desc',
      }),
  });

  return (
    <div className="page-container">
      <PageHeader
        title="KYC Center"
        subtitle="Review customer KYC verification status across the platform"
      />

      <div className="filter-bar">
        <SearchInput value={search} onChange={setSearch} placeholder="Search by name, phone, PAN…" />
        <Select options={KYC_STATUS_OPTIONS} value={kycStatus} onChange={(e) => setKycStatus(e.target.value)} />
      </div>

      {isLoading ? (
        <TableSkeleton rows={8} cols={6} />
      ) : isError ? (
        <EmptyState
          title="Failed to load KYC records"
          description="Check API connection or retry."
          action={
            <button type="button" className="btn btn-secondary" onClick={() => refetch()}>
              Retry
            </button>
          }
        />
      ) : (data?.items.length ?? 0) === 0 ? (
        <EmptyState
          title="No KYC records found"
          description={debouncedSearch || kycStatus ? 'Try adjusting your filters.' : 'Customer KYC records will appear here.'}
        />
      ) : (
        <>
          <DataTable
            columns={[
              { key: 'customerNumber', header: 'Customer #', render: (r) => str(r.customerNumber ?? r.id) },
              { key: 'fullName', header: 'Name', render: (r) => str(r.fullName ?? r.name) },
              { key: 'phone', header: 'Phone', render: (r) => str(r.phone) },
              {
                key: 'kycStatus',
                header: 'KYC Status',
                render: (r) => <StatusBadge status={str(r.kycStatus ?? 'NOT_STARTED')} />,
              },
              { key: 'updatedAt', header: 'Last Updated', render: (r) => formatDate(r.updatedAt as string) },
            ]}
            data={data?.items ?? []}
            keyField="id"
            onRowClick={(row) => navigate(`/customers/${row.id}?tab=kyc`)}
          />
          {data?.meta && <Pagination meta={data.meta} onPageChange={setPage} />}
        </>
      )}
    </div>
  );
}
