import type { PaginatedMeta } from '@kuberone/shared-types';
import type { ReactNode } from 'react';


import {
  DataTable,
  EmptyState,
  Pagination,
  SearchInput,
  TableSkeleton,
} from '@/components/ui';

type Row = Record<string, unknown>;

interface Column {
  key: string;
  header: string;
  render?: (row: Row) => ReactNode;
}

interface PaginatedListViewProps {
  search: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  isLoading: boolean;
  isError?: boolean;
  onRetry?: () => void;
  data: Row[];
  meta?: PaginatedMeta;
  onPageChange: (page: number) => void;
  columns: Column[];
  onRowClick?: (row: Row) => void;
  emptyTitle: string;
  emptyDescription?: string;
  filters?: ReactNode;
  actions?: ReactNode;
}

export function PaginatedListView({
  search,
  onSearchChange,
  searchPlaceholder = 'Search...',
  isLoading,
  isError,
  onRetry,
  data,
  meta,
  onPageChange,
  columns,
  onRowClick,
  emptyTitle,
  emptyDescription,
  filters,
  actions,
}: PaginatedListViewProps) {
  return (
    <>
      <div className="filter-bar">
        <SearchInput value={search} onChange={onSearchChange} placeholder={searchPlaceholder} />
        {filters}
        {actions}
      </div>

      {isLoading ? (
        <TableSkeleton rows={8} cols={columns.length} />
      ) : isError ? (
        <EmptyState
          title="Failed to load data"
          description="Check your connection or try again."
          action={
            onRetry ? (
              <button type="button" className="btn btn-secondary btn-sm" onClick={onRetry}>
                Retry
              </button>
            ) : undefined
          }
        />
      ) : data.length === 0 ? (
        <EmptyState title={emptyTitle} description={emptyDescription} />
      ) : (
        <>
          <DataTable columns={columns} data={data} onRowClick={onRowClick} />
          {meta && <Pagination meta={meta} onPageChange={onPageChange} />}
        </>
      )}
    </>
  );
}
