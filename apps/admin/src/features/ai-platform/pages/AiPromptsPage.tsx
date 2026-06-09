import { useQuery } from '@tanstack/react-query';

import { Card, EmptyState, LoadingSpinner, PageHeader } from '@/components/ui';
import { aiPlatformService } from '@/services/ai-platform.service';

export function AiPromptsPage() {
  const prompts = useQuery({ queryKey: ['ai-prompts'], queryFn: () => aiPlatformService.prompts() });

  if (prompts.isLoading) return <LoadingSpinner />;

  const items = (prompts.data ?? []) as Array<Record<string, unknown>>;

  return (
    <div className="page-container">
      <PageHeader title="Prompt Management" subtitle="Versioned system prompts for AI modules" />
      <Card title="Prompt Templates">
        {items.length === 0 ? <EmptyState title="No prompts" /> : (
          items.map((p) => (
            <div key={String(p.id)} className="list-row">
              <div>
                <div className="info-item-value">{String(p.name)}</div>
                <div className="info-item-label">{String(p.code)} · {String(p.module)} · {String(p.role)}</div>
                <div className="info-item-label" style={{ whiteSpace: 'pre-wrap', marginTop: 4 }}>
                  {String((p.versions as Array<{ content: string }>)?.[0]?.content ?? '').slice(0, 300)}
                </div>
              </div>
            </div>
          ))
        )}
      </Card>
    </div>
  );
}
