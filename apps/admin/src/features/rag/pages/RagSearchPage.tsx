import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

import { Button, Card, EmptyState, LoadingSpinner, PageHeader } from '@/components/ui';
import { ragService } from '@/services/rag.service';

export function RagSearchPage() {
  const [query, setQuery] = useState('');
  const [submitted, setSubmitted] = useState('');

  const search = useQuery({
    queryKey: ['rag-search', submitted],
    queryFn: () => ragService.search({ q: submitted, topK: 10 }),
    enabled: !!submitted,
  });

  const ragQuery = useQuery({
    queryKey: ['rag-query', submitted],
    queryFn: () => ragService.query({ q: submitted, generateAnswer: true }),
    enabled: !!submitted,
  });

  return (
    <div className="page-container">
      <PageHeader title="RAG Search & Query" subtitle="Semantic retrieval and augmented generation" />

      <Card title="Search">
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <input className="input" style={{ flex: 1 }} value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Ask about loan policies, eligibility, lenders..." />
          <Button onClick={() => setSubmitted(query.trim())} disabled={!query.trim()}>Search</Button>
        </div>
      </Card>

      {search.isLoading && <LoadingSpinner />}

      {submitted && !search.isLoading && (
        <>
          <Card title={`Retrieved Chunks (${search.data?.chunks.length ?? 0})`} className="detail-section">
            {(search.data?.chunks ?? []).length === 0 ? (
              <EmptyState title="No chunks retrieved" />
            ) : (
              search.data?.chunks.map((c) => (
                <div key={c.chunkId} className="list-row">
                  <div>
                    <div className="info-item-value">{c.documentTitle} <span className="text-muted">(score: {c.score})</span></div>
                    <div className="info-item-label">{c.content}</div>
                  </div>
                </div>
              ))
            )}
          </Card>

          {ragQuery.data && (
            <Card title="RAG Answer" className="detail-section">
              <p style={{ whiteSpace: 'pre-wrap' }}>{ragQuery.data.answer}</p>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
