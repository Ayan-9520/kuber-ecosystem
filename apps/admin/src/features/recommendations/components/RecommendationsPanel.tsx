import { useQuery } from '@tanstack/react-query';
import { Sparkles } from 'lucide-react';

import { Button, Card, EmptyState, LoadingSpinner, StatCard } from '@/components/ui';
import { formatPercent, formatCurrency } from '@/lib/utils';
import { recommendationsService, type RecommendationBundle } from '@/services/recommendations.service';

interface RecommendationsPanelProps {
  entityType: 'CUSTOMER' | 'LEAD' | 'APPLICATION';
  entityId: string;
}

export function RecommendationsPanel({ entityType, entityId }: RecommendationsPanelProps) {
  const fetcher = {
    CUSTOMER: () => recommendationsService.forCustomer(entityId),
    LEAD: () => recommendationsService.forLead(entityId),
    APPLICATION: () => recommendationsService.forApplication(entityId),
  }[entityType];

  const recommendations = useQuery({
    queryKey: ['recommendations', entityType, entityId],
    queryFn: fetcher,
    enabled: false,
  });

  const data = recommendations.data;

  return (
    <Card
      title="AI Recommendations"
      subtitle="Product, lender, action & cross-sell intelligence"
      actions={
        <Button variant="secondary" onClick={() => void recommendations.refetch()} disabled={recommendations.isFetching}>
          <Sparkles size={16} />
          {recommendations.isFetching ? 'Generating...' : 'Generate Recommendations'}
        </Button>
      }
    >
      {recommendations.isFetching && <LoadingSpinner />}

      {!data && !recommendations.isFetching && (
        <EmptyState
          title="No recommendations yet"
          description="Generate AI recommendations for products, lenders, next best actions, and cross-sell opportunities."
        />
      )}

      {data && <RecommendationResults data={data} />}
    </Card>
  );
}

function RecommendationResults({ data }: { data: RecommendationBundle }) {
  return (
    <div>
      <div className="stat-grid" style={{ marginBottom: '1rem' }}>
        <StatCard label="Approval %" value={formatPercent(data.approvalProbability)} />
        <StatCard label="Disbursal %" value={formatPercent(data.disbursalProbability)} />
        <StatCard label="Risk" value={data.risk.riskLevel} />
        {data.recommendedEmi && <StatCard label="Recommended EMI" value={formatCurrency(data.recommendedEmi)} />}
      </div>

      {data.products.length > 0 && (
        <Section title="Recommended Products">
          {data.products.map((p) => (
            <Item key={p.productName} title={p.productName} subtitle={p.reason} badge={`${p.approvalProbability}%`} />
          ))}
        </Section>
      )}

      {data.lenders.length > 0 && (
        <Section title="Top Lenders">
          {data.lenders.map((l) => (
            <Item key={l.lenderName} title={l.lenderName} subtitle={l.reason} badge={`TAT ${l.expectedTatDays ?? '—'}d`} />
          ))}
        </Section>
      )}

      {data.actions.length > 0 && (
        <Section title="Next Best Actions">
          {data.actions.map((a) => (
            <Item key={a.actionType} title={a.title} subtitle={a.description} badge={`P${a.priority}`} />
          ))}
        </Section>
      )}

      {data.crossSell.length > 0 && (
        <Section title="Cross-Sell Opportunities">
          {data.crossSell.map((c) => (
            <Item key={c.label} title={c.label} subtitle={c.description} badge={`${c.matchScore}%`} />
          ))}
        </Section>
      )}

      {data.documents.missing.length > 0 && (
        <Section title="Document Gaps">
          {data.documents.missing.map((d) => (
            <Item key={d} title={d} subtitle="Required action" />
          ))}
        </Section>
      )}

      {data.risk.mitigations.length > 0 && (
        <Section title="Risk Mitigations">
          {data.risk.mitigations.map((m) => (
            <Item key={m} title={m} />
          ))}
        </Section>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '1rem' }}>
      <h4 className="info-item-label">{title}</h4>
      {children}
    </div>
  );
}

function Item({ title, subtitle, badge }: { title: string; subtitle?: string; badge?: string }) {
  return (
    <div style={{ padding: '0.5rem 0', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
      <div>
        <strong>{title}</strong>
        {subtitle && <p className="page-subtitle" style={{ margin: '0.25rem 0 0' }}>{subtitle}</p>}
      </div>
      {badge && <span style={{ color: 'var(--color-primary)', fontSize: '0.8125rem', whiteSpace: 'nowrap' }}>{badge}</span>}
    </div>
  );
}
