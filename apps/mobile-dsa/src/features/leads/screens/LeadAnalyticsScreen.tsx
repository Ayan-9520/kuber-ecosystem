import { useQuery } from '@tanstack/react-query';
import { StyleSheet, Text, View } from 'react-native';

import { Card, EmptyState, Screen, StatCard } from '@/components/ui';
import { useAuth } from '@/hooks';
import { formatCurrency, getApiErrorMessage, str } from '@/lib/utils';
import { leadsService } from '@/services';
import { colors, spacing, typography } from '@/theme';

export function LeadAnalyticsScreen() {
  const { partnerId } = useAuth();

  const analytics = useQuery({
    queryKey: ['lead-analytics', partnerId],
    queryFn: () => leadsService.analytics({ partnerId }),
    enabled: !!partnerId,
  });

  const data = analytics.data ?? {};

  return (
    <Screen title="Lead Analytics" subtitle="Pipeline performance overview">
      {analytics.isError ? (
        <EmptyState title="Analytics unavailable" description={getApiErrorMessage(analytics.error)} />
      ) : analytics.isLoading ? (
        <Text style={styles.muted}>Loading analytics...</Text>
      ) : (
        <>
          <View style={styles.statRow}>
            <StatCard label="Total Leads" value={Number(data.totalLeads ?? data.total ?? 0)} icon="people" />
            <StatCard label="Converted" value={Number(data.converted ?? data.convertedCount ?? 0)} icon="checkmark-circle" />
          </View>
          <View style={styles.statRow}>
            <StatCard label="In Process" value={Number(data.inProcess ?? data.activeCount ?? 0)} icon="hourglass" />
            <StatCard label="Rejected" value={Number(data.rejected ?? data.rejectedCount ?? 0)} icon="close-circle" />
          </View>

          <Card title="Conversion Rate">
            <Text style={styles.big}>{str(data.conversionRate ?? `${Number(data.conversionPct ?? 0).toFixed(1)}%`)}</Text>
          </Card>

          <Card title="Pipeline Value">
            <Text style={styles.big}>{formatCurrency(Number(data.pipelineValue ?? data.totalRequestedAmount ?? 0))}</Text>
          </Card>

          {Array.isArray(data.byStatus) && (
            <Card title="By Status">
              {(data.byStatus as Record<string, unknown>[]).map((row, i) => (
                <View key={i} style={styles.row}>
                  <Text style={styles.label}>{str(row.status ?? row.label)}</Text>
                  <Text style={styles.value}>{str(row.count ?? row.value)}</Text>
                </View>
              ))}
            </Card>
          )}
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  statRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.sm },
  big: { ...typography.h2, color: colors.primary },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.xs },
  label: { ...typography.bodySm, color: colors.textSecondary },
  value: { ...typography.bodySm, color: colors.text, fontWeight: '600' },
  muted: { color: colors.textMuted },
});
