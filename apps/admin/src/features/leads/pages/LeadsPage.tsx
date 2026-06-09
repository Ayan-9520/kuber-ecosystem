import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import {
  Button,
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
import { formatDate, formatCurrency } from '@/lib/utils';
import { leadsService } from '@/services/index';

const GRADE_OPTIONS = [
  { value: '', label: 'All Grades' },
  { value: 'A_PLUS', label: 'A+ (Premium)' },
  { value: 'A', label: 'A (High Quality)' },
  { value: 'B', label: 'B (Moderate)' },
  { value: 'C', label: 'C (Low Quality)' },
  { value: 'REJECTED', label: 'Rejected' },
];

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'OPEN', label: 'Open' },
  { value: 'ASSIGNED', label: 'Assigned' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'QUALIFIED', label: 'Qualified' },
  { value: 'CONVERTED', label: 'Converted' },
  { value: 'LOST', label: 'Lost' },
];

function str(v: unknown): string {
  if (v === null || v === undefined) return '—';
  return String(v);
}

export function LeadsPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { page, limit, setPage, reset } = usePagination();
  const [search, setSearch] = useState(searchParams.get('search') ?? '');
  const [status, setStatus] = useState('');
  const [grade, setGrade] = useState('');
  const debouncedSearch = useDebounce(search);

  useEffect(() => {
    reset();
  }, [debouncedSearch, status, grade, reset]);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['leads', page, limit, debouncedSearch, status, grade],
    queryFn: () =>
      leadsService.list({
        page,
        limit,
        search: debouncedSearch || undefined,
        status: status || undefined,
        grade: grade || undefined,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      }),
  });

  return (
    <div className="page-container">
      <PageHeader
        title="Leads"
        subtitle="Manage and track sales leads across branches"
        actions={
          <>
            <Button variant="secondary" onClick={() => navigate('/leads/scoring-analytics')}>
              Scoring Analytics
            </Button>
            <Button variant="secondary" onClick={() => navigate('/leads/analytics')}>
              View Analytics
            </Button>
          </>
        }
      />

      <div className="filter-bar">
        <SearchInput value={search} onChange={setSearch} placeholder="Search leads..." />
        <Select
          options={STATUS_OPTIONS}
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          aria-label="Filter by status"
        />
        <Select
          options={GRADE_OPTIONS}
          value={grade}
          onChange={(e) => setGrade(e.target.value)}
          aria-label="Filter by grade"
        />
      </div>

      {isLoading ? (
        <TableSkeleton rows={8} cols={6} />
      ) : isError ? (
        <EmptyState title="Failed to load leads" description="Please try again later." />
      ) : (data?.items.length ?? 0) === 0 ? (
        <EmptyState
          title="No leads found"
          description={debouncedSearch || status ? 'Try adjusting your filters.' : 'New leads will appear here.'}
        />
      ) : (
        <>
          <DataTable
            columns={[
              { key: 'leadNumber', header: 'Lead #', render: (r) => str(r.leadNumber ?? r.id) },
              { key: 'fullName', header: 'Name', render: (r) => str(r.fullName ?? r.name) },
              { key: 'phone', header: 'Phone', render: (r) => str(r.phone) },
              { key: 'loanAmount', header: 'Amount', render: (r) => formatCurrency(r.loanAmount as number) },
              {
                key: 'status',
                header: 'Status',
                render: (r) => <StatusBadge status={str(r.status)} />,
              },
              { key: 'grade', header: 'Grade', render: (r) => str(r.grade) },
              { key: 'score', header: 'Score', render: (r) => str(r.score) },
              { key: 'priority', header: 'Priority', render: (r) => str(r.priority) },
              { key: 'createdAt', header: 'Created', render: (r) => formatDate(r.createdAt as string) },
            ]}
            data={data?.items ?? []}
            onRowClick={(row) => navigate(`/leads/${row.id}`)}
          />
          {data?.meta && <Pagination meta={data.meta} onPageChange={setPage} />}
        </>
      )}
    </div>
  );
}
