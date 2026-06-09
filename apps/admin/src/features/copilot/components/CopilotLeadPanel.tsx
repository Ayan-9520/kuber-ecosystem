import { useMutation, useQuery } from '@tanstack/react-query';
import { Sparkles } from 'lucide-react';

import { Button, Card, EmptyState, LoadingSpinner, StatCard } from '@/components/ui';
import { formatPercent } from '@/lib/utils';
import { copilotService, type CopilotLeadAnalysis } from '@/services/copilot.service';

interface CopilotLeadPanelProps {
  leadId: string;
}

export function CopilotLeadPanel({ leadId }: CopilotLeadPanelProps) {
  const analysis = useQuery({
    queryKey: ['copilot-lead', leadId],
    queryFn: () => copilotService.analyzeLead(leadId),
    enabled: false,
  });

  const feedback = useMutation({
    mutationFn: (rating: 'HELPFUL' | 'PARTIAL' | 'NOT_HELPFUL') =>
      copilotService.feedback({
        sessionId: analysis.data?.sessionId,
        entityType: 'LEAD',
        entityId: leadId,
        rating,
      }),
  });

  const data = analysis.data;

  return (
    <Card
      title="AI Sales Copilot"
      subtitle="Lead analysis, recommendations, and next best actions"
      actions={
        <Button variant="secondary" onClick={() => void analysis.refetch()} disabled={analysis.isFetching}>
          <Sparkles size={16} />
          {analysis.isFetching ? 'Analyzing...' : 'Run Analysis'}
        </Button>
      }
    >
      {analysis.isFetching && <LoadingSpinner />}

      {!data && !analysis.isFetching && (
        <EmptyState
          title="No copilot analysis yet"
          description="Run AI analysis to get lead grade, approval probability, lender recommendations, and next best actions."
        />
      )}

      {data && <CopilotLeadResults data={data} onFeedback={(r) => feedback.mutate(r)} />}
    </Card>
  );
}

function CopilotLeadResults({
  data,
  onFeedback,
}: {
  data: CopilotLeadAnalysis;
  onFeedback: (rating: 'HELPFUL' | 'PARTIAL' | 'NOT_HELPFUL') => void;
}) {
  return (
    <div>
      <div className="stat-grid" style={{ marginBottom: '1rem' }}>
        <StatCard label="Lead Grade" value={data.leadGrade ?? '—'} />
        <StatCard label="Approval %" value={formatPercent(data.approvalProbability)} />
        <StatCard label="Disbursal %" value={formatPercent(data.disbursalProbability)} />
        <StatCard label="Conversion %" value={formatPercent(data.conversionProbability)} />
        {data.riskRating && <StatCard label="Risk" value={data.riskRating} />}
        {data.priorityLevel && <StatCard label="Priority" value={data.priorityLevel} />}
      </div>

      {data.riskFlags.length > 0 && (
        <div style={{ marginBottom: '1rem' }}>
          <h4 className="info-item-label">Risk Flags</h4>
          <ul style={{ margin: '0.5rem 0 0', paddingLeft: '1.25rem' }}>
            {data.riskFlags.map((f) => (
              <li key={f.code} style={{ color: 'var(--color-text-secondary)', marginBottom: 4 }}>
                <strong>{f.label}</strong> ({f.severity}) — {f.description}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid-2" style={{ marginBottom: '1rem' }}>
        {data.recommendedProduct && (
          <div className="info-item">
            <div className="info-item-label">Recommended Product</div>
            <div className="info-item-value">{data.recommendedProduct.title}</div>
            <p className="page-subtitle">{data.recommendedProduct.description}</p>
          </div>
        )}
        {data.recommendedLender && (
          <div className="info-item">
            <div className="info-item-label">Recommended Lender</div>
            <div className="info-item-value">{data.recommendedLender.title}</div>
            <p className="page-subtitle">{data.recommendedLender.description}</p>
          </div>
        )}
      </div>

      {data.nextBestActions.length > 0 && (
        <div style={{ marginBottom: '1rem' }}>
          <h4 className="info-item-label">Next Best Actions</h4>
          {data.nextBestActions.map((a) => (
            <div key={a.actionType} style={{ padding: '0.5rem 0', borderBottom: '1px solid var(--color-border)' }}>
              <strong>{a.title}</strong>
              <p className="page-subtitle" style={{ margin: '0.25rem 0 0' }}>{a.description}</p>
            </div>
          ))}
        </div>
      )}

      {data.crossSellOpportunities.length > 0 && (
        <div style={{ marginBottom: '1rem' }}>
          <h4 className="info-item-label">Cross-Sell Opportunities</h4>
          {data.crossSellOpportunities.map((c) => (
            <div key={c.code} style={{ padding: '0.35rem 0' }}>
              {c.label} — {c.score}% match
            </div>
          ))}
        </div>
      )}

      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
        <Button variant="ghost" onClick={() => onFeedback('HELPFUL')}>Helpful</Button>
        <Button variant="ghost" onClick={() => onFeedback('PARTIAL')}>Partial</Button>
        <Button variant="ghost" onClick={() => onFeedback('NOT_HELPFUL')}>Not helpful</Button>
      </div>
    </div>
  );
}
