import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { Button, Card, EmptyState, LoadingSpinner, PageHeader, StatusBadge } from '@/components/ui';
import { formatDateTime } from '@/lib/utils';
import { knowledgeService } from '@/services/knowledge.service';

export function KnowledgeArticleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isNew = id === 'new';

  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [contentType, setContentType] = useState('ARTICLE');
  const [categoryId, setCategoryId] = useState('');

  const article = useQuery({
    queryKey: ['knowledge-article', id],
    queryFn: () => knowledgeService.getArticle(id!),
    enabled: !!id && !isNew,
  });

  const categories = useQuery({
    queryKey: ['knowledge-categories'],
    queryFn: () => knowledgeService.categories(),
  });

  const createMutation = useMutation({
    mutationFn: () => knowledgeService.createArticle({ title, summary, content, contentType, categoryId }),
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: ['knowledge-articles'] });
      navigate(`/knowledge/articles/${(data as { id: string }).id}`);
    },
  });

  const approvalMutation = useMutation({
    mutationFn: (action: string) => knowledgeService.submitApproval({ articleId: id, action }),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['knowledge-article', id] }),
  });

  const data = article.data;

  useEffect(() => {
    if (data && !isNew) {
      setTitle(data.title);
      setSummary(data.summary ?? '');
      setContent(data.content ?? '');
      setContentType(data.contentType);
      setCategoryId(data.categoryId);
    }
  }, [data, isNew]);

  if (!isNew && article.isLoading) return <LoadingSpinner />;
  if (!isNew && article.isError) return <EmptyState title="Article not found" />;

  return (
    <div className="page-container">
      <PageHeader
        title={isNew ? 'New Article' : data?.title ?? 'Article'}
        subtitle={isNew ? 'Create a new knowledge article' : `${data?.contentType} · v${data?.currentVersion}`}
        actions={
          !isNew && data ? (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <StatusBadge status={data.status} />
              {data.status === 'DRAFT' && (
                <Button variant="secondary" onClick={() => approvalMutation.mutate('SUBMITTED')}>Submit for Review</Button>
              )}
              {data.status === 'REVIEW' && (
                <Button variant="secondary" onClick={() => approvalMutation.mutate('APPROVED')}>Approve</Button>
              )}
              {data.status === 'APPROVED' && (
                <Button onClick={() => approvalMutation.mutate('PUBLISHED')}>Publish</Button>
              )}
            </div>
          ) : null
        }
      />

      <Card title={isNew ? 'Article Details' : 'Content'}>
        <div className="form-grid">
          <div className="form-group">
            <label className="info-item-label">Title</label>
            <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} disabled={!isNew && data?.status === 'PUBLISHED'} />
          </div>
          <div className="form-group">
            <label className="info-item-label">Content Type</label>
            <select className="input" value={contentType} onChange={(e) => setContentType(e.target.value)} disabled={!isNew}>
              {['ARTICLE', 'POLICY', 'FAQ', 'SOP', 'TRAINING_MATERIAL', 'SCRIPT', 'VIDEO_METADATA', 'DOCUMENT_METADATA'].map((t) => (
                <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="info-item-label">Category</label>
            <select className="input" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
              <option value="">Select category</option>
              {(categories.data?.items ?? []).map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label className="info-item-label">Summary</label>
            <textarea className="input" rows={2} value={summary} onChange={(e) => setSummary(e.target.value)} />
          </div>
          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label className="info-item-label">Content</label>
            <textarea className="input" rows={12} value={content} onChange={(e) => setContent(e.target.value)} />
          </div>
        </div>

        {isNew && (
          <Button onClick={() => createMutation.mutate()} disabled={!title || !content || !categoryId}>
            Create Article
          </Button>
        )}
      </Card>

      {!isNew && data && (
        <div className="grid-2" style={{ marginTop: '1.5rem' }}>
          <Card title="Metadata">
            <div className="info-grid">
              <div><div className="info-item-label">Views</div><div className="info-item-value">{data.viewCount}</div></div>
              <div><div className="info-item-label">Version</div><div className="info-item-value">{data.currentVersion}</div></div>
              <div><div className="info-item-label">Published</div><div className="info-item-value">{data.publishedAt ? formatDateTime(data.publishedAt) : '—'}</div></div>
              <div><div className="info-item-label">Tags</div><div className="info-item-value">{(data.tags ?? []).map((t) => t.name).join(', ') || '—'}</div></div>
            </div>
          </Card>
          <Card title="Version History">
            {(data as { versions?: Array<{ version: number; changeNotes: string | null; createdAt: string }> }).versions?.length ? (
              (data as unknown as { versions: Array<{ version: number; changeNotes: string | null; createdAt: string }> }).versions.map((v) => (
                <div key={v.version} className="list-row">
                  <div>
                    <div className="info-item-value">v{v.version}</div>
                    <div className="info-item-label">{v.changeNotes ?? 'No notes'} · {formatDateTime(v.createdAt)}</div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-muted">No version history</p>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}
