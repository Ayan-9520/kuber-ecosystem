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
  { value: 'NEW', label: 'New' },
  { value: 'CONTACTED', label: 'Contacted' },
  { value: 'QUALIFIED', label: 'Qualified' },
  { value: 'DOCUMENT_PENDING', label: 'Document Pending' },
  { value: 'IN_PROCESS', label: 'In Process' },
  { value: 'APPLICATION_CREATED', label: 'Application Created' },
  { value: 'SANCTIONED', label: 'Sanctioned' },
  { value: 'DISBURSED', label: 'Disbursed' },
  { value: 'REJECTED', label: 'Rejected' },
  { value: 'LOST', label: 'Lost' },
];

function startOfTodayIso(): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

function str(v: unknown): string {
  if (v === null || v === undefined) return '—';
  return String(v);
}

export function LeadsPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { page, limit, setPage, reset } = usePagination();
  const [search, setSearch] = useState(searchParams.get('search') ?? '');
  const [status, setStatus] = useState(searchParams.get('status') ?? '');
  const [grade, setGrade] = useState(searchParams.get('grade') ?? '');
  const [fromDate, setFromDate] = useState<string | undefined>(() => {
    if (searchParams.get('preset') === 'today') return startOfTodayIso();
    return searchParams.get('fromDate') ?? undefined;
  });
  const debouncedSearch = useDebounce(search);

  useEffect(() => {
    setSearch(searchParams.get('search') ?? '');
    setStatus(searchParams.get('status') ?? '');
    setGrade(searchParams.get('grade') ?? '');
    if (searchParams.get('preset') === 'today') {
      setFromDate(startOfTodayIso());
    } else {
      setFromDate(searchParams.get('fromDate') ?? undefined);
    }
    reset();
  }, [searchParams, reset]);

  useEffect(() => {
    reset();
  }, [debouncedSearch, status, grade, fromDate, reset]);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['leads', page, limit, debouncedSearch, status, grade, fromDate],
    queryFn: () =>
      leadsService.list({
        page,
        limit,
        search: debouncedSearch || undefined,
        status: status || undefined,
        grade: grade || undefined,
        fromDate: fromDate || undefined,
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
              { key: 'fullName', header: 'Name', render: (r) => str(r.fullName ?? r.prospectName ?? r.name) },
              { key: 'phone', header: 'Phone', render: (r) => str(r.phone ?? r.prospectPhone) },
              { key: 'loanAmount', header: 'Amount', render: (r) => formatCurrency((r.loanAmount ?? r.requestedAmount) as number) },
              {
                key: 'status',
                header: 'Status',
                render: (r) => <StatusBadge status={str(r.status)} />,
              },
              { key: 'grade', header: 'Grade', render: (r) => str(r.grade ?? r.gradeAlias) },
              { key: 'source', header: 'Source', render: (r) => str(r.sourceName ?? r.sourceCode) },
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
