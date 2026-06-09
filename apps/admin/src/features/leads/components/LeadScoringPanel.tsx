import { useMutation, useQuery } from '@tanstack/react-query';
import { RefreshCw, Target } from 'lucide-react';

import { Button, Card, EmptyState, LoadingSpinner, StatCard } from '@/components/ui';
import { formatPercent } from '@/lib/utils';
import { leadScoringService, type LeadScoreResult } from '@/services/leadScoring.service';

interface LeadScoringPanelProps {
  leadId: string;
}

export function LeadScoringPanel({ leadId }: LeadScoringPanelProps) {
  const history = useQuery({
    queryKey: ['lead-scoring-history', leadId],
    queryFn: () => leadScoringService.history(leadId),
  });

  const calculate = useMutation({
    mutationFn: () => leadScoringService.calculate(leadId, true),
    onSuccess: () => void history.refetch(),
  });

  const data = history.data?.latestScore ?? (calculate.data as LeadScoreResult | undefined);

  return (
    <Card
      title="AI Lead Scoring"
      subtitle="Score, grade, approval probability, risk & priority"
      actions={
        <Button variant="secondary" onClick={() => calculate.mutate()} disabled={calculate.isPending}>
          <RefreshCw size={16} />
          {calculate.isPending ? 'Scoring...' : 'Recalculate Score'}
        </Button>
      }
    >
      {(history.isLoading || calculate.isPending) && <LoadingSpinner />}

      {!data && !history.isLoading && !calculate.isPending && (
        <EmptyState
          title="No score calculated"
          description="Run lead scoring to generate grade, approval probability, and risk assessment."
          action={
            <Button onClick={() => calculate.mutate()}>
              <Target size={16} />
              Calculate Score
            </Button>
          }
        />
      )}

      {data && <LeadScoreResults data={data} history={history.data?.history ?? []} />}
    </Card>
  );
}

function LeadScoreResults({
  data,
  history,
}: {
  data: LeadScoreResult;
  history: Array<Record<string, unknown>>;
}) {
  return (
    <div>
      <div className="stat-grid" style={{ marginBottom: '1rem' }}>
        <StatCard label="Score" value={data.score} />
        <StatCard label="Grade" value={data.gradeAlias ?? data.grade} />
        <StatCard label="Classification" value={data.classification ?? '—'} />
        <StatCard label="Approval %" value={formatPercent(data.approvalProbability)} />
        <StatCard label="Disbursal %" value={formatPercent(data.disbursalProbability)} />
        <StatCard label="Conversion %" value={formatPercent(data.conversionProbability)} />
        <StatCard label="Risk" value={data.riskRating ?? '—'} />
        <StatCard label="Priority" value={data.priorityLevel ?? '—'} />
      </div>

      {(data.riskIndicators?.length ?? 0) > 0 && (
        <div style={{ marginBottom: '1rem' }}>
          <h4 className="info-item-label">Risk Indicators</h4>
          <ul style={{ margin: '0.5rem 0 0', paddingLeft: '1.25rem' }}>
            {data.riskIndicators!.map((r) => (
              <li key={r} style={{ color: 'var(--color-text-secondary)', marginBottom: 4 }}>{r}</li>
            ))}
          </ul>
        </div>
      )}

      {data.factorBreakdown && Object.keys(data.factorBreakdown).length > 0 && (
        <div style={{ marginBottom: '1rem' }}>
          <h4 className="info-item-label">Factor Breakdown</h4>
          <div className="info-grid">
            {Object.entries(data.factorBreakdown).map(([factor, f]) => (
              <div key={factor}>
                <div className="info-item-label">{factor.replace(/([A-Z])/g, ' $1')}</div>
                <div className="info-item-value">{Math.round(f.score)} / 100</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {history.length > 1 && (
        <div>
          <h4 className="info-item-label">Score History ({history.length})</h4>
          <ul style={{ margin: '0.5rem 0 0', paddingLeft: '1.25rem', fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>
            {history.slice(0, 5).map((h) => (
              <li key={String(h.id)}>
                {String(h.newGrade)} — {String(h.newScore)} pts
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
