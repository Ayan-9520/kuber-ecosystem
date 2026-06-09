import { useQuery } from '@tanstack/react-query';

import { Card, EmptyState, LoadingSpinner, PageHeader, StatCard } from '@/components/ui';
import { knowledgeService } from '@/services/knowledge.service';

export function KnowledgeAnalyticsPage() {
  const analytics = useQuery({
    queryKey: ['knowledge-analytics'],
    queryFn: () => knowledgeService.analytics(),
  });

  if (analytics.isLoading) return <LoadingSpinner />;

  const stats = analytics.data;

  return (
    <div className="page-container">
      <PageHeader title="Knowledge Analytics" subtitle="Views, search trends, feedback ratings, and content effectiveness" />

      <div className="stat-grid">
        <StatCard label="Total Articles" value={stats?.totalArticles ?? 0} />
        <StatCard label="Published" value={stats?.publishedArticles ?? 0} />
        <StatCard label="Drafts" value={stats?.draftArticles ?? 0} />
        <StatCard label="Pending Review" value={stats?.pendingReview ?? 0} />
        <StatCard label="Total Views" value={stats?.totalViews ?? 0} />
        <StatCard label="Total Searches" value={stats?.totalSearches ?? 0} />
        <StatCard label="Avg Feedback Rating" value={stats?.averageFeedbackRating ?? 0} />
      </div>

      <div className="grid-2" style={{ marginTop: '1.5rem' }}>
        <Card title="Most Viewed Articles">
          {!stats?.mostViewed?.length ? (
            <EmptyState title="No view data" />
          ) : (
            <div className="info-grid">
              {stats.mostViewed.map((a) => (
                <div key={a.id}>
                  <div className="info-item-label">{a.title}</div>
                  <div className="info-item-value">{a.viewCount} views</div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card title="Most Used Policies">
          {!stats?.mostUsedPolicies?.length ? (
            <EmptyState title="No policy data" />
          ) : (
            <div className="info-grid">
              {stats.mostUsedPolicies.map((a) => (
                <div key={a.id}>
                  <div className="info-item-label">{a.title}</div>
                  <div className="info-item-value">{a.viewCount} views</div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card title="Search Trends">
          {!stats?.searchTrends?.length ? (
            <EmptyState title="No search data" />
          ) : (
            <div className="info-grid">
              {stats.searchTrends.map((s) => (
                <div key={s.query}>
                  <div className="info-item-label">{s.query}</div>
                  <div className="info-item-value">{s.count} searches</div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card title="Content Type Distribution">
          {!stats?.contentTypeDistribution || !Object.keys(stats.contentTypeDistribution).length ? (
            <EmptyState title="No content data" />
          ) : (
            <div className="info-grid">
              {Object.entries(stats.contentTypeDistribution).map(([type, count]) => (
                <div key={type}>
                  <div className="info-item-label">{type.replace(/_/g, ' ')}</div>
                  <div className="info-item-value">{count}</div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
