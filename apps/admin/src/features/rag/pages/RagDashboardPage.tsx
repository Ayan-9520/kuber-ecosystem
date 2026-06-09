import { useQuery } from '@tanstack/react-query';
import { Database, FileUp, Search, BarChart3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { Button, Card, LoadingSpinner, PageHeader, StatCard } from '@/components/ui';
import { ragService } from '@/services/rag.service';

export function RagDashboardPage() {
  const navigate = useNavigate();

  const analytics = useQuery({ queryKey: ['rag-dashboard'], queryFn: () => ragService.analytics() });
  const documents = useQuery({ queryKey: ['rag-documents'], queryFn: () => ragService.documents({ limit: 5 }) });

  if (analytics.isLoading) return <LoadingSpinner />;

  const stats = analytics.data;

  return (
    <div className="page-container">
      <PageHeader
        title="RAG Pipeline"
        subtitle="Retrieval Augmented Generation for AI Advisor, Voice AI, and Copilot"
        actions={
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Button onClick={() => navigate('/rag/ingestion')}>Ingest Documents</Button>
            <Button variant="secondary" onClick={() => navigate('/rag/search')}>Search</Button>
          </div>
        }
      />

      <div className="stat-grid">
        <StatCard label="Total Queries" value={stats?.totalQueries ?? 0} />
        <StatCard label="Retrievals" value={stats?.totalRetrievals ?? 0} />
        <StatCard label="Avg Latency (ms)" value={stats?.avgLatencyMs ?? 0} />
        <StatCard label="Retrieval Accuracy" value={`${stats?.retrievalAccuracy ?? 0}%`} />
        <StatCard label="Search Effectiveness" value={`${stats?.searchEffectiveness ?? 0}%`} />
        <StatCard label="Avg Feedback" value={stats?.avgFeedbackRating ?? 0} />
      </div>

      <div className="grid-2" style={{ marginTop: '1.5rem' }}>
        <Card title="Quick Actions">
          <div className="info-grid">
            {[
              { label: 'Document Ingestion', path: '/rag/ingestion', icon: FileUp },
              { label: 'Semantic Search', path: '/rag/search', icon: Search },
              { label: 'Analytics', path: '/rag/analytics', icon: BarChart3 },
            ].map((item) => (
              <button key={item.path} type="button" className="btn btn-secondary" onClick={() => navigate(item.path)}>
                <item.icon size={16} style={{ marginRight: 6 }} />
                {item.label}
              </button>
            ))}
          </div>
        </Card>

        <Card title="Indexed Documents">
          {(documents.data?.items ?? []).length === 0 ? (
            <p className="text-muted">No documents indexed yet</p>
          ) : (
            documents.data?.items.map((d) => (
              <div key={d.id} className="list-row" style={{ cursor: 'pointer' }} onClick={() => navigate(`/rag/documents/${d.id}`)}>
                <div>
                  <div className="info-item-value">{d.title}</div>
                  <div className="info-item-label">{d.sourceType} · {d.chunkCount} chunks · {d.status}</div>
                </div>
                <Database size={16} />
              </div>
            ))
          )}
        </Card>
      </div>
    </div>
  );
}
