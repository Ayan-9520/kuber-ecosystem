import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Card, EmptyState, LoadingSpinner, PageHeader, StatCard, Tabs } from '@/components/ui';
import { formatPercent } from '@/lib/utils';
import { copilotService } from '@/services/copilot.service';

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'management', label: 'Management' },
];

export function CopilotDashboardPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('overview');

  const analytics = useQuery({
    queryKey: ['copilot-analytics'],
    queryFn: () => copilotService.analytics(),
  });

  const insights = useQuery({
    queryKey: ['copilot-insights-recent'],
    queryFn: () => copilotService.insights({ limit: 10 }),
  });

  if (analytics.isLoading) return <LoadingSpinner />;

  const stats = analytics.data;

  return (
    <div className="page-container">
      <PageHeader
        title="AI Sales Copilot"
        subtitle="Lead & application intelligence for sales, credit, and management teams"
      />

      <Tabs tabs={TABS} active={tab} onChange={setTab} />

      {tab === 'overview' && (
        <>
          <div className="stat-grid">
            <StatCard label="Copilot Sessions" value={stats?.totalSessions ?? 0} />
            <StatCard label="Insights Generated" value={stats?.totalInsights ?? 0} />
            <StatCard label="Recommendations" value={stats?.totalRecommendations ?? 0} />
            <StatCard label="Acceptance Rate" value={formatPercent(stats?.recommendationAcceptanceRate ?? 0)} />
            <StatCard label="Prediction Accuracy" value={formatPercent(stats?.predictionAccuracyRate ?? 0)} />
            <StatCard label="Approval Accuracy" value={formatPercent(stats?.approvalAccuracyRate ?? 0)} />
          </div>

          <div className="grid-2" style={{ marginTop: '1.5rem' }}>
            <Card title="Quick Actions">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => navigate('/leads')}>
                  Analyze Leads
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => navigate('/applications')}>
                  Analyze Applications
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => navigate('/copilot/executive')}>
                  Executive Insights
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => navigate('/copilot/branch')}>
                  Branch Insights
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => navigate('/copilot/management')}>
                  Management Insights
                </button>
              </div>
            </Card>

            <Card title="Recent Insights">
              {(insights.data?.length ?? 0) === 0 ? (
                <EmptyState title="No insights yet" description="Run analysis on leads or applications to generate insights." />
              ) : (
                <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
                  {(insights.data as Array<{ title?: string; summary?: string }>).slice(0, 5).map((item, i) => (
                    <li key={i} style={{ marginBottom: 8, color: 'var(--color-text-secondary)' }}>
                      <strong>{item.title}</strong> — {item.summary}
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </div>
        </>
      )}

      {tab === 'management' && (
        <Card title="Usage by Entity Type">
          {!stats?.usageByEntityType || Object.keys(stats.usageByEntityType).length === 0 ? (
            <EmptyState title="No usage data" />
          ) : (
            <div className="info-grid">
              {Object.entries(stats.usageByEntityType).map(([type, count]) => (
                <div key={type}>
                  <div className="info-item-label">{type.replace(/_/g, ' ')}</div>
                  <div className="info-item-value">{count}</div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
