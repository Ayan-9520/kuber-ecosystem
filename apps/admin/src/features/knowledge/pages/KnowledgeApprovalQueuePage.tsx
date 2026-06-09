import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { Button, Card, DataTable, LoadingSpinner, PageHeader, StatusBadge } from '@/components/ui';
import { formatDateTime } from '@/lib/utils';
import { knowledgeService } from '@/services/knowledge.service';

export function KnowledgeApprovalQueuePage() {
  const queryClient = useQueryClient();

  const queue = useQuery({
    queryKey: ['knowledge-approvals'],
    queryFn: () => knowledgeService.approvals({ limit: 50 }),
  });

  const approveMutation = useMutation({
    mutationFn: (articleId: string) => knowledgeService.submitApproval({ articleId, action: 'APPROVED' }),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['knowledge-approvals'] }),
  });

  const publishMutation = useMutation({
    mutationFn: (articleId: string) => knowledgeService.submitApproval({ articleId, action: 'PUBLISHED' }),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['knowledge-approvals'] }),
  });

  if (queue.isLoading) return <LoadingSpinner />;

  const items = queue.data?.items ?? [];

  return (
    <div className="page-container">
      <PageHeader title="Approval Queue" subtitle="Review and approve knowledge articles for publication" />

      <Card>
        <DataTable
          columns={[
            { key: 'articleTitle', label: 'Article' },
            { key: 'articleStatus', label: 'Status', render: (r) => <StatusBadge status={String(r.articleStatus)} /> },
            { key: 'action', label: 'Last Action' },
            { key: 'actorRole', label: 'Actor Role' },
            { key: 'createdAt', label: 'Date', render: (r) => formatDateTime(String(r.createdAt)) },
            {
              key: 'actions',
              label: 'Actions',
              render: (r) => (
                <div style={{ display: 'flex', gap: '0.25rem' }}>
                  {r.articleStatus === 'REVIEW' && (
                    <Button variant="secondary" onClick={() => approveMutation.mutate(String(r.articleId))}>Approve</Button>
                  )}
                  {r.articleStatus === 'APPROVED' && (
                    <Button onClick={() => publishMutation.mutate(String(r.articleId))}>Publish</Button>
                  )}
                </div>
              ),
            },
          ]}
          data={items}
        />
      </Card>
    </div>
  );
}
