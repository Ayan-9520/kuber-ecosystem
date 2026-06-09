import { useQuery } from '@tanstack/react-query';

import { Card, DataTable, LoadingSpinner, PageHeader, StatusBadge } from '@/components/ui';
import { formatDateTime } from '@/lib/utils';
import { knowledgeService } from '@/services/knowledge.service';

export function KnowledgeReviewQueuePage() {
  const reviews = useQuery({
    queryKey: ['knowledge-reviews'],
    queryFn: () => knowledgeService.reviews({ status: 'PENDING', limit: 50 }),
  });

  if (reviews.isLoading) return <LoadingSpinner />;

  return (
    <div className="page-container">
      <PageHeader title="Review Queue" subtitle="Pending article reviews from assigned reviewers" />

      <Card>
        <DataTable
          columns={[
            { key: 'articleTitle', label: 'Article' },
            { key: 'reviewerId', label: 'Reviewer' },
            { key: 'status', label: 'Status', render: (r) => <StatusBadge status={String(r.status)} /> },
            { key: 'rating', label: 'Rating', render: (r) => r.rating ? String(r.rating) : '—' },
            { key: 'createdAt', label: 'Submitted', render: (r) => formatDateTime(String(r.createdAt)) },
          ]}
          data={reviews.data?.items ?? []}
        />
      </Card>
    </div>
  );
}
