import { useQuery } from '@tanstack/react-query';

import { Card, EmptyState, LoadingSpinner, PageHeader, StatCard } from '@/components/ui';
import { ragService } from '@/services/rag.service';

export function RagAnalyticsPage() {
  const analytics = useQuery({ queryKey: ['rag-analytics'], queryFn: () => ragService.analytics() });

  if (analytics.isLoading) return <LoadingSpinner />;

  const stats = analytics.data;

  return (
    <div className="page-container">
      <PageHeader title="RAG Analytics" subtitle="Query volume, retrieval accuracy, and feedback ratings" />

      <div className="stat-grid">
        <StatCard label="Total Queries" value={stats?.totalQueries ?? 0} />
        <StatCard label="Retrievals" value={stats?.totalRetrievals ?? 0} />
        <StatCard label="Avg Latency (ms)" value={stats?.avgLatencyMs ?? 0} />
        <StatCard label="Retrieval Accuracy" value={`${stats?.retrievalAccuracy ?? 0}%`} />
        <StatCard label="Search Effectiveness" value={`${stats?.searchEffectiveness ?? 0}%`} />
        <StatCard label="Avg Feedback Rating" value={stats?.avgFeedbackRating ?? 0} />
      </div>

      <div className="grid-2" style={{ marginTop: '1.5rem' }}>
        <Card title="Top Documents">
          {!stats?.topDocuments?.length ? <EmptyState title="No data" /> : (
            <div className="info-grid">
              {stats.topDocuments.map((d) => (
                <div key={d.id}>
                  <div className="info-item-label">{d.title}</div>
                  <div className="info-item-value">{d.retrievalCount} chunks</div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card title="Queries by Source">
          {!stats?.queriesBySource || !Object.keys(stats.queriesBySource).length ? <EmptyState title="No data" /> : (
            <div className="info-grid">
              {Object.entries(stats.queriesBySource).map(([source, count]) => (
                <div key={source}>
                  <div className="info-item-label">{source}</div>
                  <div className="info-item-value">{count}</div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card title="Top Categories">
          {!stats?.topCategories?.length ? <EmptyState title="No data" /> : (
            <div className="info-grid">
              {stats.topCategories.map((c) => (
                <div key={c.code}>
                  <div className="info-item-label">{c.code}</div>
                  <div className="info-item-value">{c.count}</div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
