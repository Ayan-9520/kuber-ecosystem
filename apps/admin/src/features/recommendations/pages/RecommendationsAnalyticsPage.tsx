import { useQuery } from '@tanstack/react-query';

import { Card, EmptyState, LoadingSpinner, PageHeader, StatCard } from '@/components/ui';
import { formatPercent } from '@/lib/utils';
import { recommendationsService } from '@/services/recommendations.service';

export function RecommendationsAnalyticsPage() {
  const analytics = useQuery({
    queryKey: ['recommendations-analytics'],
    queryFn: () => recommendationsService.analytics(),
  });

  if (analytics.isLoading) return <LoadingSpinner />;
  if (analytics.isError) return <EmptyState title="Failed to load analytics" description="Please retry or check API connectivity." />;

  const stats = analytics.data as {
    totalGenerated?: number;
    acceptanceRate?: number;
    lenderSuccessRate?: number;
    approvalAccuracy?: number;
    disbursalAccuracy?: number;
    crossSellConversionRate?: number;
    effectivenessScore?: number;
    byType?: Record<string, number>;
  };

  return (
    <div className="page-container">
      <PageHeader
        title="Recommendation Analytics"
        subtitle="Acceptance rates, lender success, and cross-sell effectiveness"
      />

      <div className="stat-grid">
        <StatCard label="Total Generated" value={stats?.totalGenerated ?? 0} />
        <StatCard label="Acceptance Rate" value={formatPercent(stats?.acceptanceRate ?? 0)} />
        <StatCard label="Lender Success" value={formatPercent(stats?.lenderSuccessRate ?? 0)} />
        <StatCard label="Approval Accuracy" value={formatPercent(stats?.approvalAccuracy ?? 0)} />
        <StatCard label="Disbursal Accuracy" value={formatPercent(stats?.disbursalAccuracy ?? 0)} />
        <StatCard label="Cross-Sell Conversion" value={formatPercent(stats?.crossSellConversionRate ?? 0)} />
        <StatCard label="Effectiveness Score" value={formatPercent(stats?.effectivenessScore ?? 0)} />
      </div>

      <Card title="Recommendations by Type" className="detail-section">
        {!stats?.byType || Object.keys(stats.byType).length === 0 ? (
          <EmptyState title="No recommendation data yet" />
        ) : (
          <div className="info-grid">
            {Object.entries(stats.byType).map(([type, count]) => (
              <div key={type}>
                <div className="info-item-label">{type.replace(/_/g, ' ')}</div>
                <div className="info-item-value">{count}</div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
