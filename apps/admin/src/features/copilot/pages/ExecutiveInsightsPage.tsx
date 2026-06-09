import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

import { Button, Card, EmptyState, LoadingSpinner, PageHeader } from '@/components/ui';
import { copilotService } from '@/services/copilot.service';

export function ExecutiveInsightsPage() {
  const [executiveId, setExecutiveId] = useState('');
  const [submittedId, setSubmittedId] = useState('');

  const analysis = useQuery({
    queryKey: ['copilot-executive', submittedId],
    queryFn: () => copilotService.analyzeExecutive(submittedId),
    enabled: !!submittedId,
  });

  return (
    <div className="page-container">
      <PageHeader title="Executive Performance Insights" subtitle="AI copilot for sales executive portfolio analysis" />

      <Card title="Select Executive">
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-end' }}>
          <div style={{ flex: 1 }}>
            <label className="info-item-label">Executive ID (UUID)</label>
            <input
              className="input"
              value={executiveId}
              onChange={(e) => setExecutiveId(e.target.value)}
              placeholder="Enter employee UUID"
            />
          </div>
          <Button onClick={() => setSubmittedId(executiveId.trim())} disabled={!executiveId.trim()}>
            Analyze
          </Button>
        </div>
      </Card>

      {analysis.isLoading && <LoadingSpinner />}

      {analysis.data && (
        <Card title={String((analysis.data as { title?: string }).title ?? 'Executive Insights')} className="detail-section">
          <pre style={{ whiteSpace: 'pre-wrap', fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>
            {JSON.stringify(analysis.data, null, 2)}
          </pre>
        </Card>
      )}

      {submittedId && !analysis.isLoading && !analysis.data && analysis.isError && (
        <EmptyState title="Could not load executive insights" />
      )}
    </div>
  );
}
