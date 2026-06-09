import { useQuery } from '@tanstack/react-query';
import { StyleSheet, Text, View } from 'react-native';

import { Card, EmptyState, Screen } from '@/components/ui';
import { formatCurrency, formatPercent, getApiErrorMessage } from '@/lib/utils';
import { recommendationsService } from '@/services/recommendations.service';
import { colors, spacing, typography } from '@/theme';

interface RecommendationsScreenProps {
  customerId: string;
}

export function RecommendationsScreen({ customerId }: RecommendationsScreenProps) {
  const recs = useQuery({
    queryKey: ['recommendations', customerId],
    queryFn: () => recommendationsService.forCustomer(customerId),
    enabled: !!customerId,
  });

  if (recs.isLoading) return <Screen loading><></></Screen>;
  if (recs.isError) {
    return (
      <Screen>
        <EmptyState title="Could not load recommendations" description={getApiErrorMessage(recs.error)} />
      </Screen>
    );
  }

  const data = recs.data as {
    products?: Array<{ productName: string; reason: string; approvalProbability: number; recommendedEmi?: number }>;
    lenders?: Array<{ lenderName: string; reason: string; approvalProbability: number; expectedTatDays?: number }>;
    crossSell?: Array<{ label: string; description: string; matchScore: number }>;
    approvalProbability?: number;
    disbursalProbability?: number;
    recommendedEmi?: number;
  };

  return (
    <Screen title="Recommended For You" subtitle="Personalized loan & lender suggestions">
      <Card>
        <View style={styles.stats}>
          <Text style={styles.stat}>Approval {formatPercent(data.approvalProbability ?? 0)}</Text>
          <Text style={styles.stat}>Disbursal {formatPercent(data.disbursalProbability ?? 0)}</Text>
        </View>
        {data.recommendedEmi ? <Text style={styles.emi}>EMI from {formatCurrency(data.recommendedEmi)}</Text> : null}
      </Card>

      {(data.products ?? []).map((p) => (
        <Card key={p.productName}>
          <Text style={styles.title}>{p.productName}</Text>
          <Text style={styles.sub}>{p.reason}</Text>
          <Text style={styles.badge}>{formatPercent(p.approvalProbability)} match</Text>
        </Card>
      ))}

      {(data.lenders ?? []).slice(0, 3).map((l) => (
        <Card key={l.lenderName}>
          <Text style={styles.title}>{l.lenderName}</Text>
          <Text style={styles.sub}>{l.reason}</Text>
          <Text style={styles.badge}>TAT {l.expectedTatDays ?? '—'} days</Text>
        </Card>
      ))}

      {(data.crossSell ?? []).map((c) => (
        <Card key={c.label}>
          <Text style={styles.title}>{c.label}</Text>
          <Text style={styles.sub}>{c.description}</Text>
        </Card>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  stats: { flexDirection: 'row', gap: spacing.md },
  stat: { ...typography.bodySm, color: colors.primary, fontWeight: '600' },
  emi: { ...typography.bodySm, color: colors.textMuted, marginTop: spacing.sm },
  title: { ...typography.h3, color: colors.text },
  sub: { ...typography.bodySm, color: colors.textMuted, marginTop: 4 },
  badge: { ...typography.bodySm, color: colors.primary, marginTop: spacing.sm },
});
