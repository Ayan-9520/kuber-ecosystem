import { useQuery } from '@tanstack/react-query';
import { Brain, Cpu, FileText, AlertTriangle, BarChart3, DollarSign } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { Button, Card, LoadingSpinner, PageHeader, StatCard, StatusBadge } from '@/components/ui';
import { aiPlatformService } from '@/services/ai-platform.service';

export function AiPlatformDashboardPage() {
  const navigate = useNavigate();
  const health = useQuery({ queryKey: ['ai-platform-health'], queryFn: () => aiPlatformService.health() });
  const usage = useQuery({ queryKey: ['ai-platform-usage'], queryFn: () => aiPlatformService.usage() });

  if (health.isLoading) return <LoadingSpinner />;

  const stats = usage.data;

  return (
    <div className="page-container">
      <PageHeader
        title="AI Platform"
        subtitle="Centralized OpenAI integration layer for Advisor, Voice AI, Copilot, and RAG"
        actions={<Button onClick={() => navigate('/ai-platform/models')}>Manage Models</Button>}
      />

      <Card title="Platform Health">
        <div className="info-grid">
          <div><div className="info-item-label">Status</div><StatusBadge status={health.data?.status ?? 'unknown'} /></div>
          <div><div className="info-item-label">Version</div><div className="info-item-value">{health.data?.version}</div></div>
          <div><div className="info-item-label">OpenAI</div><div className="info-item-value">{health.data?.openaiConfigured ? 'Configured' : 'Not configured'}</div></div>
          <div><div className="info-item-label">Embedding</div><div className="info-item-value">{health.data?.embeddingProvider}</div></div>
          <div><div className="info-item-label">Active Models</div><div className="info-item-value">{health.data?.activeModels ?? 0}</div></div>
        </div>
      </Card>

      <div className="stat-grid" style={{ marginTop: '1.5rem' }}>
        <StatCard label="Total Requests" value={stats?.totalRequests ?? 0} />
        <StatCard label="Total Tokens" value={stats?.totalTokens ?? 0} />
        <StatCard label="Avg Latency (ms)" value={stats?.avgLatencyMs ?? 0} />
        <StatCard label="Error Rate" value={`${stats?.errorRate ?? 0}%`} />
        <StatCard label="Est. Cost (USD)" value={stats?.totalCost?.toFixed(4) ?? '0'} />
      </div>

      <div className="grid-2" style={{ marginTop: '1.5rem' }}>
        <Card title="Quick Actions">
          <div className="info-grid">
            {[
              { label: 'Model Management', path: '/ai-platform/models', icon: Cpu },
              { label: 'Prompt Templates', path: '/ai-platform/prompts', icon: FileText },
              { label: 'Usage Analytics', path: '/ai-platform/usage', icon: BarChart3 },
              { label: 'Cost Analytics', path: '/ai-platform/costs', icon: DollarSign },
              { label: 'Error Monitoring', path: '/ai-platform/errors', icon: AlertTriangle },
            ].map((item) => (
              <button key={item.path} type="button" className="btn btn-secondary" onClick={() => navigate(item.path)}>
                <item.icon size={16} style={{ marginRight: 6 }} />
                {item.label}
              </button>
            ))}
          </div>
        </Card>

        <Card title="Supported Features">
          <div className="info-grid">
            {(health.data?.features ?? []).map((f) => (
              <div key={f}><Brain size={14} style={{ marginRight: 6 }} />{f}</div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
