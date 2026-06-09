import type { ReactNode } from 'react';

import { Button, EmptyState, LoadingSpinner } from '@/components/ui';

type Props = {
  isLoading?: boolean;
  isError?: boolean;
  error?: Error | null;
  onRetry?: () => void;
  isEmpty?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  children: ReactNode;
};

export function AnalyticsQueryState({
  isLoading,
  isError,
  error,
  onRetry,
  isEmpty,
  emptyTitle = 'No analytics data',
  emptyDescription = 'Try adjusting filters or date range.',
  children,
}: Props) {
  if (isLoading) {
    return (
      <div className="analytics-query-state">
        <LoadingSpinner />
      </div>
    );
  }

  if (isError) {
    return (
      <EmptyState
        title="Unable to load analytics"
        description={error?.message ?? 'Something went wrong while fetching data.'}
        action={onRetry ? <Button onClick={onRetry}>Retry</Button> : undefined}
      />
    );
  }

  if (isEmpty) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }

  return <>{children}</>;
}
