import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Button, Card, DataTable, EmptyState, LoadingSpinner, PageHeader, StatusBadge } from '@/components/ui';
import { formatDateTime } from '@/lib/utils';
import { knowledgeService } from '@/services/knowledge.service';

export function KnowledgeArticlesPage() {
  const navigate = useNavigate();
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');

  const articles = useQuery({
    queryKey: ['knowledge-articles', status, search],
    queryFn: () => knowledgeService.articles({
      page: 1,
      limit: 50,
      ...(status ? { status } : {}),
      ...(search ? { search } : {}),
    }),
  });

  if (articles.isLoading) return <LoadingSpinner />;

  const items = articles.data?.items ?? [];

  return (
    <div className="page-container">
      <PageHeader
        title="Article Management"
        subtitle="Create, edit, and manage knowledge articles"
        actions={<Button onClick={() => navigate('/knowledge/articles/new')}>New Article</Button>}
      />

      <Card>
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
          <input
            className="input"
            placeholder="Search articles..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ flex: 1, minWidth: 200 }}
          />
          <select className="input" value={status} onChange={(e) => setStatus(e.target.value)} style={{ width: 160 }}>
            <option value="">All Status</option>
            <option value="DRAFT">Draft</option>
            <option value="REVIEW">Review</option>
            <option value="APPROVED">Approved</option>
            <option value="PUBLISHED">Published</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </div>

        {items.length === 0 ? (
          <EmptyState title="No articles found" description="Create your first knowledge article" />
        ) : (
          <DataTable
            columns={[
              { key: 'title', label: 'Title', render: (r) => String(r.title) },
              { key: 'contentType', label: 'Type', render: (r) => String(r.contentType).replace(/_/g, ' ') },
              { key: 'categoryName', label: 'Category', render: (r) => String(r.categoryName ?? '—') },
              { key: 'status', label: 'Status', render: (r) => <StatusBadge status={String(r.status)} /> },
              { key: 'viewCount', label: 'Views', render: (r) => String(r.viewCount) },
              { key: 'publishedAt', label: 'Published', render: (r) => r.publishedAt ? formatDateTime(String(r.publishedAt)) : '—' },
            ]}
            data={items as unknown as Record<string, unknown>[]}
            onRowClick={(r) => navigate(`/knowledge/articles/${r.id}`)}
          />
        )}
      </Card>
    </div>
  );
}
