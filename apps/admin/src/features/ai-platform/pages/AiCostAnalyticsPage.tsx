import { useQuery } from '@tanstack/react-query';

import { Card, EmptyState, LoadingSpinner, PageHeader, StatCard } from '@/components/ui';
import { aiPlatformService } from '@/services/ai-platform.service';

export function AiCostAnalyticsPage() {
  const costs = useQuery({ queryKey: ['ai-costs'], queryFn: () => aiPlatformService.costs() });

  if (costs.isLoading) return <LoadingSpinner />;

  const stats = costs.data;

  return (
    <div className="page-container">
      <PageHeader title="Cost Analytics" subtitle="Estimated OpenAI API costs by module and model" />
      <StatCard label={`Total Cost (${stats?.currency ?? 'USD'})`} value={stats?.totalCost?.toFixed(4) ?? '0'} />
      <div className="grid-2" style={{ marginTop: '1.5rem' }}>
        <Card title="By Module">
          {!stats?.byModule || !Object.keys(stats.byModule).length ? <EmptyState title="No data" /> : (
            <div className="info-grid">
              {Object.entries(stats.byModule).map(([k, v]) => (
                <div key={k}><div className="info-item-label">{k}</div><div className="info-item-value">${Number(v).toFixed(4)}</div></div>
              ))}
            </div>
          )}
        </Card>
        <Card title="By Model">
          {!stats?.byModel || !Object.keys(stats.byModel).length ? <EmptyState title="No data" /> : (
            <div className="info-grid">
              {Object.entries(stats.byModel).map(([k, v]) => (
                <div key={k}><div className="info-item-label">{k}</div><div className="info-item-value">${Number(v).toFixed(4)}</div></div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
