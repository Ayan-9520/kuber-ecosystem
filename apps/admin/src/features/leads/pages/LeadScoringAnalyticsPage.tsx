import { useQuery } from '@tanstack/react-query';

import { Card, EmptyState, LoadingSpinner, PageHeader, StatCard } from '@/components/ui';
import { formatPercent } from '@/lib/utils';
import { leadScoringService } from '@/services/leadScoring.service';

export function LeadScoringAnalyticsPage() {
  const analytics = useQuery({
    queryKey: ['lead-scoring-analytics'],
    queryFn: () => leadScoringService.analytics(),
  });

  if (analytics.isLoading) return <LoadingSpinner />;

  const stats = analytics.data;

  return (
    <div className="page-container">
      <PageHeader
        title="Lead Scoring Analytics"
        subtitle="Grade distribution, risk profiles, and prediction accuracy"
      />

      <div className="stat-grid">
        <StatCard label="Total Scored" value={stats?.totalScored ?? 0} />
        <StatCard label="Avg Score" value={stats?.averageScore ?? 0} />
        <StatCard label="Avg Approval %" value={formatPercent(stats?.averageApprovalProbability ?? 0)} />
        <StatCard label="Avg Disbursal %" value={formatPercent(stats?.averageDisbursalProbability ?? 0)} />
        <StatCard label="Conversion Rate" value={formatPercent(stats?.conversionRate ?? 0)} />
        <StatCard label="Prediction Accuracy" value={formatPercent(stats?.predictionAccuracy ?? 0)} />
      </div>

      <div className="grid-2" style={{ marginTop: '1.5rem' }}>
        <Card title="Grade Distribution">
          {!stats?.gradeDistribution || Object.keys(stats.gradeDistribution).length === 0 ? (
            <EmptyState title="No scored leads yet" />
          ) : (
            <div className="info-grid">
              {Object.entries(stats.gradeDistribution).map(([grade, count]) => (
                <div key={grade}>
                  <div className="info-item-label">{grade.replace('_', '+')}</div>
                  <div className="info-item-value">{count}</div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card title="Risk Distribution">
          {!stats?.riskDistribution || Object.keys(stats.riskDistribution).length === 0 ? (
            <EmptyState title="No risk data" />
          ) : (
            <div className="info-grid">
              {Object.entries(stats.riskDistribution).map(([risk, count]) => (
                <div key={risk}>
                  <div className="info-item-label">{risk}</div>
                  <div className="info-item-value">{count}</div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card title="Priority Distribution">
          {!stats?.priorityDistribution || Object.keys(stats.priorityDistribution).length === 0 ? (
            <EmptyState title="No priority data" />
          ) : (
            <div className="info-grid">
              {Object.entries(stats.priorityDistribution).map(([priority, count]) => (
                <div key={priority}>
                  <div className="info-item-label">{priority}</div>
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
