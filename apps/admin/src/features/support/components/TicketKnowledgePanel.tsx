import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import { Card, LoadingSpinner } from '@/components/ui';
import { knowledgeService } from '@/services/knowledge.service';

const SUGGESTED_RESPONSES = [
  'Thank you for reaching out. We are reviewing your request and will respond shortly.',
  'We need additional documents to proceed. Please upload the requested files in the Documents section.',
  'Your application status has been updated. Please check your dashboard for the latest information.',
  'We have escalated your ticket to our specialist team for faster resolution.',
];

type Props = {
  subject: string;
  description: string;
  categoryName?: string;
  onInsertResponse?: (text: string) => void;
};

export function TicketKnowledgePanel({ subject, description, categoryName, onInsertResponse }: Props) {
  const query = useMemo(() => `${subject} ${description} ${categoryName ?? ''}`.trim().slice(0, 200), [subject, description, categoryName]);

  const articles = useQuery({
    queryKey: ['knowledge-search', query],
    queryFn: () => knowledgeService.search({ q: query, limit: 5 }),
    enabled: query.length > 3,
  });

  return (
    <div className="support-knowledge-stack">
      <Card title="AI Suggested Responses">
        <ul className="simple-list">
          {SUGGESTED_RESPONSES.map((text) => (
            <li key={text}>
              <button type="button" className="support-suggestion-btn" onClick={() => onInsertResponse?.(text)}>
                {text}
              </button>
            </li>
          ))}
        </ul>
      </Card>
      <Card title="Knowledge Base">
        {articles.isLoading ? (
          <LoadingSpinner />
        ) : (articles.data?.items?.length ?? 0) === 0 ? (
          <p className="page-subtitle">No related articles found.</p>
        ) : (
          <ul className="simple-list">
            {articles.data?.items.map((article) => (
              <li key={article.id}>
                <a href={`/knowledge/articles/${article.id}`} className="support-kb-link">
                  {article.title}
                </a>
                {article.summary && <p className="page-subtitle">{article.summary}</p>}
              </li>
            ))}
          </ul>
        )}
      </Card>
      <Card title="Auto Insights">
        <div className="info-grid">
          <div>
            <div className="info-item-label">Suggested Category</div>
            <div className="info-item-value">{categoryName || 'General Inquiry'}</div>
          </div>
          <div>
            <div className="info-item-label">Priority Recommendation</div>
            <div className="info-item-value">
              {subject.toLowerCase().includes('urgent') || description.toLowerCase().includes('urgent') ? 'HIGH' : 'MEDIUM'}
            </div>
          </div>
          <div>
            <div className="info-item-label">Escalation Hint</div>
            <div className="info-item-value">
              {description.length > 500 ? 'Consider L2 if unresolved in 4h' : 'Standard L1 queue'}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
