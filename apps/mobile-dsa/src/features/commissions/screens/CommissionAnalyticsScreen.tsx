import { useQuery } from '@tanstack/react-query';
import { StyleSheet, Text, View } from 'react-native';

import { Card, EmptyState, Screen, StatCard } from '@/components/ui';
import { useAuth } from '@/hooks';
import { formatCurrency, getApiErrorMessage, str } from '@/lib/utils';
import { commissionsService } from '@/services';
import { colors, spacing, typography } from '@/theme';

export function CommissionAnalyticsScreen() {
  const { partnerId } = useAuth();

  const analytics = useQuery({
    queryKey: ['commission-analytics-detail', partnerId],
    queryFn: () => commissionsService.analytics({ partnerId, groupBy: 'commissionType' }),
    enabled: !!partnerId,
  });

  const data = analytics.data ?? {};

  return (
    <Screen scroll title="Commission Analytics">
      {analytics.isError ? (
        <EmptyState title="Analytics unavailable" description={getApiErrorMessage(analytics.error)} />
      ) : (
        <>
          <View style={styles.row}>
            <StatCard label="Earned" value={formatCurrency(Number(data.totalEarned ?? 0))} icon="trending-up" />
            <StatCard label="Paid" value={formatCurrency(Number(data.totalPaid ?? 0))} icon="wallet" />
          </View>
          <Card title="Summary">
            <Text style={styles.line}>Pending: {formatCurrency(Number(data.pendingAmount ?? 0))}</Text>
            <Text style={styles.line}>Recoveries: {formatCurrency(Number(data.totalRecoveries ?? 0))}</Text>
            <Text style={styles.line}>Avg per deal: {formatCurrency(Number(data.averageCommission ?? 0))}</Text>
          </Card>
          {Array.isArray(data.breakdown) && (
            <Card title="By Type">
              {(data.breakdown as Record<string, unknown>[]).map((row, i) => (
                <View key={i} style={styles.breakdownRow}>
                  <Text style={styles.label}>{str(row.commissionType ?? row.label)}</Text>
                  <Text style={styles.value}>{formatCurrency(Number(row.amount ?? row.total ?? 0))}</Text>
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
  row: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.sm },
  line: { ...typography.bodySm, color: colors.textSecondary, marginBottom: spacing.xs },
  breakdownRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.xs },
  label: { ...typography.bodySm, color: colors.textMuted },
  value: { ...typography.bodySm, color: colors.text, fontWeight: '600' },
});
