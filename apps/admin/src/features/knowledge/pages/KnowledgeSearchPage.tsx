import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Button, Card, EmptyState, LoadingSpinner, PageHeader, StatusBadge } from '@/components/ui';
import { knowledgeService } from '@/services/knowledge.service';

export function KnowledgeSearchPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [submitted, setSubmitted] = useState('');
  const [searchType, setSearchType] = useState('fulltext');

  const results = useQuery({
    queryKey: ['knowledge-search', submitted, searchType],
    queryFn: () => knowledgeService.search({ q: submitted, searchType, limit: 30 }),
    enabled: !!submitted,
  });

  return (
    <div className="page-container">
      <PageHeader title="Search Console" subtitle="Full-text, keyword, category, and tag search across published articles" />

      <Card title="Search">
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-end' }}>
          <div style={{ flex: 1 }}>
            <label className="info-item-label">Query</label>
            <input
              className="input"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search policies, FAQs, scripts..."
              onKeyDown={(e) => e.key === 'Enter' && setSubmitted(query.trim())}
            />
          </div>
          <select className="input" value={searchType} onChange={(e) => setSearchType(e.target.value)} style={{ width: 140 }}>
            <option value="fulltext">Full Text</option>
            <option value="keyword">Keyword</option>
            <option value="semantic">Semantic Ready</option>
          </select>
          <Button onClick={() => setSubmitted(query.trim())} disabled={!query.trim()}>Search</Button>
        </div>
      </Card>

      {results.isLoading && <LoadingSpinner />}

      {submitted && !results.isLoading && (
        <Card title={`Results (${results.data?.meta.total ?? 0})`} className="detail-section">
          {(results.data?.items ?? []).length === 0 ? (
            <EmptyState title="No results" description={`No articles matched "${submitted}"`} />
          ) : (
            results.data?.items.map((a) => (
              <div
                key={a.id}
                className="list-row"
                style={{ cursor: 'pointer' }}
                onClick={() => navigate(`/knowledge/articles/${a.id}`)}
              >
                <div style={{ flex: 1 }}>
                  <div className="info-item-value">{a.title}</div>
                  <div className="info-item-label">{a.summary}</div>
                </div>
                <StatusBadge status={a.contentType} />
              </div>
            ))
          )}
        </Card>
      )}
    </div>
  );
}
