import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Card, EmptyState, Screen, StatCard } from '@/components/ui';
import { useAuth } from '@/hooks';
import { formatCurrency, getApiErrorMessage, str } from '@/lib/utils';
import { referralsService } from '@/services';
import { type AppColors, useAppTheme } from '@/theme/ThemeProvider';
import { spacing, typography } from '@/theme';

export function ReferralAnalyticsScreen() {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { partnerId } = useAuth();

  const analytics = useQuery({
    queryKey: ['referral-analytics', partnerId],
    queryFn: () => referralsService.analytics({ partnerId }),
    enabled: !!partnerId,
    retry: false,
  });

  const data = analytics.data ?? {};

  return (
    <Screen scroll title="Referral Analytics">
      {analytics.isError ? (
        <EmptyState title="Analytics unavailable" description={getApiErrorMessage(analytics.error)} />
      ) : (
        <>
          <View style={styles.row}>
            <StatCard label="Total Referrals" value={Number(data.total ?? data.totalReferrals ?? 0)} icon="people" />
            <StatCard label="Converted" value={Number(data.converted ?? 0)} icon="checkmark-circle" />
          </View>
          <Card title="Rewards">
            <Text style={styles.big}>{formatCurrency(Number(data.totalRewards ?? data.rewardAmount ?? 0))}</Text>
            <Text style={styles.sub}>Conversion rate: {str(data.conversionRate ?? `${Number(data.conversionPct ?? 0).toFixed(1)}%`)}</Text>
          </Card>
        </>
      )}
    </Screen>
  );
}

function createStyles(colors: AppColors) {
  return StyleSheet.create({
  row: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.sm },
  big: { ...typography.h2, color: colors.primary },
  sub: { ...typography.bodySm, color: colors.textMuted, marginTop: spacing.sm },
});
}
