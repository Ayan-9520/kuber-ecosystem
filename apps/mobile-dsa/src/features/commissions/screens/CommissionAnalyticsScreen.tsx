import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { RefreshControl, StyleSheet, Text, View } from 'react-native';

import { Card, EmptyState, Screen, StatCard } from '@/components/ui';
import { useAuth } from '@/hooks';
import { formatCurrency, getApiErrorMessage, str } from '@/lib/utils';
import { commissionsService } from '@/services';
import { type AppColors, useAppTheme } from '@/theme/ThemeProvider';
import { spacing, typography } from '@/theme';

type AnalyticsPayload = {
  totals?: { totalCommission?: number; entryCount?: number };
  paidCommissions?: number;
  commissionOutstanding?: number;
  recoverySummary?: { totalRecovered?: number };
  commissionTypeBreakdown?: Array<{
    commissionType?: string;
    status?: string;
    _sum?: { commissionAmount?: unknown };
    amount?: unknown;
    total?: unknown;
  }>;
};

export function CommissionAnalyticsScreen() {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { partnerId } = useAuth();

  const analytics = useQuery({
    queryKey: ['commission-analytics-detail', partnerId],
    queryFn: () =>
      commissionsService.analytics({ partnerId, groupBy: 'commissionType' }) as Promise<AnalyticsPayload>,
    enabled: !!partnerId,
  });

  const data = analytics.data ?? {};
  const earned = Number(data.totals?.totalCommission ?? 0);
  const paid = Number(data.paidCommissions ?? 0);
  const outstanding = Number(data.commissionOutstanding ?? 0);
  const entryCount = Number(data.totals?.entryCount ?? 0);
  const avg = entryCount > 0 ? earned / entryCount : 0;
  const breakdown = data.commissionTypeBreakdown ?? [];

  return (
    <Screen
      scroll
      title="Earnings analytics"
      refreshControl={
        <RefreshControl
          refreshing={analytics.isRefetching}
          onRefresh={() => void analytics.refetch()}
          tintColor={colors.primary}
        />
      }
    >
      {analytics.isError ? (
        <EmptyState title="Analytics unavailable" description={getApiErrorMessage(analytics.error)} />
      ) : (
        <>
          <View style={styles.row}>
            <StatCard label="Earned" value={formatCurrency(earned)} icon="trending-up" />
            <StatCard label="Paid" value={formatCurrency(paid)} icon="wallet" />
          </View>
          <Card title="Summary">
            <Text style={styles.line}>Outstanding: {formatCurrency(outstanding)}</Text>
            <Text style={styles.line}>Deals: {entryCount}</Text>
            <Text style={styles.line}>Avg per deal: {formatCurrency(avg)}</Text>
          </Card>
          {breakdown.length > 0 ? (
            <Card title="By type">
              {breakdown.map((row, i) => (
                <View key={i} style={styles.breakdownRow}>
                  <Text style={styles.label}>
                    {str(row.commissionType ?? row.status ?? 'Other').replace(/_/g, ' ')}
                  </Text>
                  <Text style={styles.value}>
                    {formatCurrency(Number(row._sum?.commissionAmount ?? row.amount ?? row.total ?? 0))}
                  </Text>
                </View>
              ))}
            </Card>
          ) : null}
        </>
      )}
    </Screen>
  );
}

function createStyles(colors: AppColors) {
  return StyleSheet.create({
    row: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.sm, flexWrap: 'wrap' },
    line: { ...typography.bodySm, color: colors.textSecondary, marginBottom: spacing.xs },
    breakdownRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: spacing.xs,
    },
    label: { ...typography.bodySm, color: colors.textMuted, flex: 1, paddingRight: spacing.sm },
    value: { ...typography.bodySm, color: colors.text, fontWeight: '600' },
  });
}
