import { useQuery } from '@tanstack/react-query';

import { Card, EmptyState, LoadingSpinner, PageHeader, StatCard } from '@/components/ui';
import { aiPlatformService } from '@/services/ai-platform.service';

export function AiUsageAnalyticsPage() {
  const usage = useQuery({ queryKey: ['ai-usage'], queryFn: () => aiPlatformService.usage() });

  if (usage.isLoading) return <LoadingSpinner />;

  const stats = usage.data;

  return (
    <div className="page-container">
      <PageHeader title="Usage Analytics" subtitle="Token usage, latency, and request volume by module" />
      <div className="stat-grid">
        <StatCard label="Total Requests" value={stats?.totalRequests ?? 0} />
        <StatCard label="Total Tokens" value={stats?.totalTokens ?? 0} />
        <StatCard label="Avg Latency (ms)" value={stats?.avgLatencyMs ?? 0} />
        <StatCard label="Error Rate" value={`${stats?.errorRate ?? 0}%`} />
      </div>
      <div className="grid-2" style={{ marginTop: '1.5rem' }}>
        <Card title="By Module">
          {!stats?.byModule || !Object.keys(stats.byModule).length ? <EmptyState title="No data" /> : (
            <div className="info-grid">
              {Object.entries(stats.byModule).map(([k, v]) => (
                <div key={k}><div className="info-item-label">{k}</div><div className="info-item-value">{v}</div></div>
              ))}
            </div>
          )}
        </Card>
        <Card title="Top Models">
          {!stats?.topModels?.length ? <EmptyState title="No data" /> : (
            <div className="info-grid">
              {stats.topModels.map((m) => (
                <div key={m.model}>
                  <div className="info-item-label">{m.model}</div>
                  <div className="info-item-value">{m.count} reqs · {m.tokens} tokens</div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
