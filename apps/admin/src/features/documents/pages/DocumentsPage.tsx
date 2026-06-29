import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

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
import { formatDateTime } from '@/lib/utils';
import { customerDisplayName, documentNumberDisplay, documentTypeDisplay } from '@/lib/entity-display';
import { documentsService } from '@/services/index';

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'UPLOADED', label: 'Uploaded' },
  { value: 'PENDING_VERIFICATION', label: 'Pending Verification' },
  { value: 'VERIFIED', label: 'Verified' },
  { value: 'REJECTED', label: 'Rejected' },
  { value: 'DEFICIENT', label: 'Deficient' },
  { value: 'EXPIRED', label: 'Expired' },
];

function str(v: unknown): string {
  if (v === null || v === undefined) return '—';
  return String(v);
}

export function DocumentsPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { page, limit, setPage, reset } = usePagination();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState(searchParams.get('status') ?? '');
  const debouncedSearch = useDebounce(search);

  useEffect(() => {
    setStatus(searchParams.get('status') ?? '');
    reset();
  }, [searchParams, reset]);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['documents', page, limit, debouncedSearch, status],
    queryFn: () =>
      documentsService.list({
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
      <PageHeader title="Documents" subtitle="Review and verify customer documents" />

      <div className="filter-bar">
        <SearchInput value={search} onChange={setSearch} placeholder="Search documents..." />
        <Select options={STATUS_OPTIONS} value={status} onChange={(e) => setStatus(e.target.value)} />
      </div>

      {isLoading ? (
        <TableSkeleton rows={8} cols={6} />
      ) : isError ? (
        <EmptyState title="Failed to load documents" />
      ) : (data?.items.length ?? 0) === 0 ? (
        <EmptyState
          title="No documents found"
          description={debouncedSearch || status ? 'Try adjusting your filters.' : 'Uploaded documents will appear here.'}
        />
      ) : (
        <>
          <DataTable
            columns={[
              { key: 'documentNumber', header: 'Doc #', render: (r) => documentNumberDisplay(r) },
              { key: 'documentType', header: 'Type', render: (r) => documentTypeDisplay(r) },
              { key: 'customerName', header: 'Customer', render: (r) => customerDisplayName(r) },
              {
                key: 'status',
                header: 'Verification',
                render: (r) => <StatusBadge status={str(r.status)} />,
              },
              {
                key: 'verificationStatus',
                header: 'OCR/Verify',
                render: (r) => <StatusBadge status={str(r.verificationStatus ?? 'PENDING')} />,
              },
              { key: 'uploadedAt', header: 'Uploaded', render: (r) => formatDateTime((r.uploadedAt ?? r.createdAt) as string) },
            ]}
            data={data?.items ?? []}
            onRowClick={(row) => navigate(`/documents/${row.id}`)}
          />
          {data?.meta && <Pagination meta={data.meta} onPageChange={setPage} />}
        </>
      )}
    </div>
  );
}
