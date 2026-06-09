import { useQuery } from '@tanstack/react-query';

import { Card, EmptyState, LoadingSpinner, PageHeader, StatCard } from '@/components/ui';
import { formatPercent } from '@/lib/utils';
import { copilotService } from '@/services/copilot.service';
import { recommendationsService } from '@/services/recommendations.service';

export function ManagementInsightsPage() {
  const analytics = useQuery({
    queryKey: ['copilot-management-analytics'],
    queryFn: () => copilotService.analytics(),
  });

  const recAnalytics = useQuery({
    queryKey: ['recommendations-management-analytics'],
    queryFn: () => recommendationsService.analytics(),
  });

  if (analytics.isLoading || recAnalytics.isLoading) return <LoadingSpinner />;

  const stats = analytics.data;
  const recStats = recAnalytics.data as {
    acceptanceRate?: number;
    lenderSuccessRate?: number;
    effectivenessScore?: number;
    crossSellConversionRate?: number;
  };

  return (
    <div className="page-container">
      <PageHeader
        title="Management Copilot Insights"
        subtitle="Prediction accuracy, conversion metrics, and AI usage across the organization"
      />

      <div className="stat-grid">
        <StatCard label="Total Sessions" value={stats?.totalSessions ?? 0} />
        <StatCard label="Recommendation Acceptance" value={formatPercent(stats?.recommendationAcceptanceRate ?? 0)} />
        <StatCard label="Prediction Accuracy" value={formatPercent(stats?.predictionAccuracyRate ?? 0)} />
        <StatCard label="Approval Accuracy" value={formatPercent(stats?.approvalAccuracyRate ?? 0)} />
        <StatCard label="Disbursal Accuracy" value={formatPercent(stats?.disbursalAccuracyRate ?? 0)} />
        <StatCard label="Conversion Rate" value={formatPercent(stats?.conversionRate ?? 0)} />
        <StatCard label="Rec. Acceptance" value={formatPercent(recStats?.acceptanceRate ?? 0)} />
        <StatCard label="Lender Success" value={formatPercent(recStats?.lenderSuccessRate ?? 0)} />
        <StatCard label="Cross-Sell Conv." value={formatPercent(recStats?.crossSellConversionRate ?? 0)} />
      </div>

      <Card title="AI Usage by Entity" className="detail-section">
        {!stats?.usageByEntityType || Object.keys(stats.usageByEntityType).length === 0 ? (
          <EmptyState title="No usage recorded" description="Copilot sessions will appear here as teams use AI analysis." />
        ) : (
          <div className="info-grid">
            {Object.entries(stats.usageByEntityType).map(([entity, count]) => (
              <div key={entity}>
                <div className="info-item-label">{entity}</div>
                <div className="info-item-value">{count} sessions</div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
