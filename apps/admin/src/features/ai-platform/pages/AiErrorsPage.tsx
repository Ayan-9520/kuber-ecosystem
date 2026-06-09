import { useQuery } from '@tanstack/react-query';

import { Card, DataTable, EmptyState, LoadingSpinner, PageHeader } from '@/components/ui';
import { formatDateTime } from '@/lib/utils';
import { aiPlatformService } from '@/services/ai-platform.service';

export function AiErrorsPage() {
  const errors = useQuery({ queryKey: ['ai-errors'], queryFn: () => aiPlatformService.errors() });

  if (errors.isLoading) return <LoadingSpinner />;

  const items = (errors.data?.items ?? []) as Record<string, unknown>[];

  return (
    <div className="page-container">
      <PageHeader title="Error Monitoring" subtitle="Recent failed AI platform requests" />
      <Card title="Recent Errors">
        {items.length === 0 ? <EmptyState title="No errors" description="All AI requests succeeded recently" /> : (
          <DataTable
            columns={[
              { key: 'module', label: 'Module' },
              { key: 'requestType', label: 'Type' },
              { key: 'modelCode', label: 'Model' },
              { key: 'errorCode', label: 'Code' },
              { key: 'errorMessage', label: 'Message', render: (r) => String(r.errorMessage ?? '').slice(0, 80) },
              { key: 'createdAt', label: 'When', render: (r) => formatDateTime(String(r.createdAt)) },
            ]}
            data={items}
          />
        )}
      </Card>
    </div>
  );
}
