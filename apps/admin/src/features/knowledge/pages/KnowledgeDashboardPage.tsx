import { useQuery } from '@tanstack/react-query';
import { BookOpen, FileText, Search, Tag, CheckCircle, BarChart3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { Button, Card, LoadingSpinner, PageHeader, StatCard } from '@/components/ui';
import { knowledgeService } from '@/services/knowledge.service';

export function KnowledgeDashboardPage() {
  const navigate = useNavigate();

  const analytics = useQuery({
    queryKey: ['knowledge-dashboard'],
    queryFn: () => knowledgeService.analytics(),
  });

  const recentArticles = useQuery({
    queryKey: ['knowledge-recent'],
    queryFn: () => knowledgeService.articles({ page: 1, limit: 5, sortBy: 'updatedAt', sortOrder: 'desc' }),
  });

  if (analytics.isLoading) return <LoadingSpinner />;

  const stats = analytics.data;

  return (
    <div className="page-container">
      <PageHeader
        title="Knowledge Base"
        subtitle="Centralized enterprise knowledge for AI Advisor, Copilot, and Voice AI"
        actions={
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Button onClick={() => navigate('/knowledge/articles')}>Manage Articles</Button>
            <Button variant="secondary" onClick={() => navigate('/knowledge/search')}>Search</Button>
          </div>
        }
      />

      <div className="stat-grid">
        <StatCard label="Total Articles" value={stats?.totalArticles ?? 0} icon={<FileText size={20} />} />
        <StatCard label="Published" value={stats?.publishedArticles ?? 0} icon={<CheckCircle size={20} />} />
        <StatCard label="Pending Review" value={stats?.pendingReview ?? 0} />
        <StatCard label="Total Views" value={stats?.totalViews ?? 0} />
        <StatCard label="Total Searches" value={stats?.totalSearches ?? 0} icon={<Search size={20} />} />
        <StatCard label="Avg Rating" value={stats?.averageFeedbackRating ?? 0} />
      </div>

      <div className="grid-2" style={{ marginTop: '1.5rem' }}>
        <Card title="Quick Actions">
          <div className="info-grid">
            {[
              { label: 'Articles', path: '/knowledge/articles', icon: FileText },
              { label: 'Categories', path: '/knowledge/categories', icon: BookOpen },
              { label: 'Tags', path: '/knowledge/tags', icon: Tag },
              { label: 'Approval Queue', path: '/knowledge/approvals', icon: CheckCircle },
              { label: 'Review Queue', path: '/knowledge/reviews', icon: CheckCircle },
              { label: 'Analytics', path: '/knowledge/analytics', icon: BarChart3 },
            ].map((item) => (
              <button
                key={item.path}
                type="button"
                className="btn btn-secondary"
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                onClick={() => navigate(item.path)}
              >
                <item.icon size={16} />
                {item.label}
              </button>
            ))}
          </div>
        </Card>

        <Card title="Recently Updated">
          {(recentArticles.data?.items ?? []).length === 0 ? (
            <p className="text-muted">No articles yet</p>
          ) : (
            recentArticles.data?.items.map((a) => (
              <div
                key={a.id}
                className="list-row"
                style={{ cursor: 'pointer' }}
                onClick={() => navigate(`/knowledge/articles/${a.id}`)}
              >
                <div>
                  <div className="info-item-value">{a.title}</div>
                  <div className="info-item-label">{a.contentType} · {a.status}</div>
                </div>
              </div>
            ))
          )}
        </Card>
      </div>
    </div>
  );
}
