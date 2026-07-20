import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  Button,
  DataTable,
  EmptyState,
  PageHeader,
  Pagination,
  SearchInput,
  TableSkeleton,
} from '@/components/ui';
import { useDebounce, usePagination } from '@/hooks';
import { formatDate } from '@/lib/utils';
import { websiteVisitorsService } from '@/services/index';

function str(v: unknown): string {
  if (v === null || v === undefined || v === '') return '—';
  return String(v);
}

export function WebsiteVisitorsPage() {
  const navigate = useNavigate();
  const { page, limit, setPage, reset } = usePagination();
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search);

  useEffect(() => {
    reset();
  }, [debouncedSearch, reset]);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['website-visitors', page, limit, debouncedSearch],
    queryFn: () =>
      websiteVisitorsService.list({
        page,
        limit,
        search: debouncedSearch || undefined,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      }),
  });

  return (
    <div className="page-container">
      <PageHeader
        title="Website Visitors"
        subtitle="Cities and optional contacts from the marketing site interest popup"
        actions={
          <Button variant="secondary" onClick={() => navigate('/leads')}>
            Back to Leads
          </Button>
        }
      />

      <div className="filter-bar">
        <SearchInput value={search} onChange={setSearch} placeholder="Search city, phone, email..." />
      </div>

      {isLoading ? (
        <TableSkeleton rows={8} cols={6} />
      ) : isError ? (
        <EmptyState title="Failed to load visitors" description="Please try again later." />
      ) : (data?.items.length ?? 0) === 0 ? (
        <EmptyState
          title="No website visitors yet"
          description={debouncedSearch ? 'Try adjusting your search.' : 'Visitor interest submissions will appear here.'}
        />
      ) : (
        <>
          <DataTable
            columns={[
              { key: 'city', header: 'City', render: (r) => str(r.city) },
              { key: 'name', header: 'Name', render: (r) => str(r.name) },
              { key: 'phone', header: 'Phone', render: (r) => str(r.phone) },
              { key: 'email', header: 'Email', render: (r) => str(r.email) },
              {
                key: 'pageUrl',
                header: 'Page',
                render: (r) => {
                  const url = str(r.pageUrl);
                  if (url === '—') return url;
                  try {
                    return new URL(url).pathname || url;
                  } catch {
                    return url.length > 40 ? `${url.slice(0, 40)}…` : url;
                  }
                },
              },
              { key: 'createdAt', header: 'Captured', render: (r) => formatDate(r.createdAt as string) },
            ]}
            data={data?.items ?? []}
          />
          {data?.meta && <Pagination meta={data.meta} onPageChange={setPage} />}
        </>
      )}
    </div>
  );
}
