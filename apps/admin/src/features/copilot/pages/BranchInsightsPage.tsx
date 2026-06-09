import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

import { Button, Card, EmptyState, LoadingSpinner, PageHeader } from '@/components/ui';
import { copilotService } from '@/services/copilot.service';

export function BranchInsightsPage() {
  const [branchId, setBranchId] = useState('');
  const [submittedId, setSubmittedId] = useState('');

  const analysis = useQuery({
    queryKey: ['copilot-branch', submittedId],
    queryFn: () => copilotService.analyzeBranch(submittedId),
    enabled: !!submittedId,
  });

  return (
    <div className="page-container">
      <PageHeader title="Branch Performance Insights" subtitle="AI copilot for branch pipeline and conversion analysis" />

      <Card title="Select Branch">
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-end' }}>
          <div style={{ flex: 1 }}>
            <label className="info-item-label">Branch ID (UUID)</label>
            <input
              className="input"
              value={branchId}
              onChange={(e) => setBranchId(e.target.value)}
              placeholder="Enter branch UUID"
            />
          </div>
          <Button onClick={() => setSubmittedId(branchId.trim())} disabled={!branchId.trim()}>
            Analyze
          </Button>
        </div>
      </Card>

      {analysis.isLoading && <LoadingSpinner />}

      {analysis.data && (
        <Card title={String((analysis.data as { title?: string }).title ?? 'Branch Insights')} className="detail-section">
          {(analysis.data as { insights?: Array<{ title: string; summary: string }> }).insights?.map((insight, i) => (
            <div key={i} style={{ marginBottom: '1rem' }}>
              <strong>{insight.title}</strong>
              <p className="page-subtitle">{insight.summary}</p>
            </div>
          ))}
        </Card>
      )}

      {submittedId && !analysis.isLoading && analysis.isError && (
        <EmptyState title="Could not load branch insights" />
      )}
    </div>
  );
}
