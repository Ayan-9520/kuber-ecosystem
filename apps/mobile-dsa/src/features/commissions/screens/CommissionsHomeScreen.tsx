import { useNavigation } from '@react-navigation/native';
import { type NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import {
  Platform,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Card, PageHero, Screen, StatCard } from '@/components/ui';
import { useAuth, useResponsiveLayout } from '@/hooks';
import { formatCurrency } from '@/lib/utils';
import type { CommissionsStackParamList } from '@/navigation/types';
import { commissionsService } from '@/services';
import { radius, spacing, typography } from '@/theme';
import { cardShadow } from '@/theme/elevation';
import { glassSurface, premiumHover } from '@/theme/premium';
import { type AppColors, useAppTheme } from '@/theme/ThemeProvider';

type Nav = NativeStackNavigationProp<CommissionsStackParamList>;
type HubItem = {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  hint?: string;
};

/**
 * Partner Earnings hub — Urban Money / Paisabazaar style.
 * Partner sees: summary, cases, request payout, payouts, tax docs.
 * Never shows DRDE config, bank recon engine, or recoveries tooling.
 */
export function CommissionsHomeScreen() {
  const navigation = useNavigation<Nav>();
  const { partnerId } = useAuth();
  const { colors } = useAppTheme();
  const { isDesktop } = useResponsiveLayout();
  const styles = useMemo(() => createStyles(colors, isDesktop), [colors, isDesktop]);

  const analytics = useQuery({
    queryKey: ['commission-analytics', partnerId],
    queryFn: () => commissionsService.analytics({ partnerId }),
    enabled: !!partnerId,
  });

  const data = (analytics.data ?? {}) as {
    totals?: { totalCommission?: number };
    paidCommissions?: number;
    commissionOutstanding?: number;
  };
  const totalEarned = Number(data.totals?.totalCommission ?? 0);
  const paid = Number(data.paidCommissions ?? 0);
  const outstanding = Number(data.commissionOutstanding ?? 0);
  const statsUnavailable = analytics.isError;
  const money = (value: number) => (statsUnavailable ? '—' : formatCurrency(value));

  const primary: HubItem[] = [
    {
      label: 'My cases',
      icon: 'briefcase',
      hint: 'Loan journey',
      onPress: () => navigation.navigate('PartnerLoanCases'),
    },
    {
      label: 'Request payout',
      icon: 'document-text',
      hint: 'Raise invoice',
      onPress: () => navigation.navigate('RaiseInvoice'),
    },
    {
      label: 'My invoices',
      icon: 'receipt',
      hint: 'Track status',
      onPress: () => navigation.navigate('InvoiceTracker'),
    },
    {
      label: 'Payouts',
      icon: 'card',
      hint: 'Bank credits',
      onPress: () => navigation.navigate('PayoutHistory'),
    },
  ];

  const status: HubItem[] = [
    {
      label: 'Pending',
      icon: 'time',
      onPress: () => navigation.navigate('CommissionByStatus', { status: 'PENDING' }),
    },
    {
      label: 'Ready',
      icon: 'checkmark-done',
      hint: 'Calculated',
      onPress: () => navigation.navigate('CommissionByStatus', { status: 'CALCULATED' }),
    },
    {
      label: 'Approved',
      icon: 'checkmark-circle',
      onPress: () => navigation.navigate('CommissionByStatus', { status: 'APPROVED' }),
    },
    {
      label: 'Paid',
      icon: 'cash',
      onPress: () => navigation.navigate('CommissionByStatus', { status: 'PAID' }),
    },
  ];

  const more: HubItem[] = [
    {
      label: 'Commission tracker',
      icon: 'locate',
      onPress: () => navigation.navigate('CommissionTracker'),
    },
    {
      label: 'Ledger',
      icon: 'list',
      onPress: () => navigation.navigate('CommissionLedger'),
    },
    {
      label: 'Referrals',
      icon: 'people',
      onPress: () => navigation.navigate('ReferralIncome'),
    },
    {
      label: 'Bonuses',
      icon: 'gift',
      onPress: () => navigation.navigate('BonusTracker'),
    },
    {
      label: 'TDS',
      icon: 'calculator',
      onPress: () => navigation.navigate('TdsCentre'),
    },
    {
      label: 'Statements',
      icon: 'download',
      onPress: () => navigation.navigate('DownloadStatements'),
    },
  ];

  return (
    <Screen
      scroll
      padded={false}
      refreshControl={
        <RefreshControl
          refreshing={analytics.isRefetching}
          onRefresh={() => void analytics.refetch()}
          tintColor={colors.primary}
        />
      }
    >
      <PageHero
        eyebrow="Finance"
        title="Your earnings"
        subtitle="Track commissions, request payouts, and grow your financial business"
        icon="wallet"
      />

      <View style={styles.body}>
      {statsUnavailable ? (
        <Text style={[typography.caption, { color: colors.danger, marginBottom: spacing.sm }]}>
          Earnings summary unavailable. Pull down to refresh.
        </Text>
      ) : null}

      <View style={styles.stats}>
        <StatCard
          label="Total earned"
          value={money(totalEarned)}
          icon="wallet"
          accent
          onPress={() => navigation.navigate('EarningsDashboard')}
        />
        <StatCard
          label="Paid to bank"
          value={money(paid)}
          icon="checkmark-circle"
          onPress={() => navigation.navigate('PayoutHistory')}
        />
        <StatCard
          label="Outstanding"
          value={money(outstanding)}
          icon="hourglass"
          onPress={() => navigation.navigate('CommissionByStatus', { status: 'CALCULATED' })}
        />
      </View>

      <Card title="Quick actions" subtitle="Everyday partner workflow" elevated>
        <View style={styles.grid}>{primary.map((item) => tile(item, styles, colors))}</View>
      </Card>

      <Card title="Commission status" subtitle="Filter by live ledger status" elevated>
        <View style={styles.grid}>{status.map((item) => tile(item, styles, colors))}</View>
      </Card>

      <Card title="More" subtitle="History, tax & growth" elevated>
        <View style={styles.grid}>{more.map((item) => tile(item, styles, colors))}</View>
      </Card>
      </View>
    </Screen>
  );
}

function tile(
  item: HubItem,
  styles: ReturnType<typeof createStyles>,
  colors: AppColors,
) {
  return (
    <Pressable
      key={item.label}
      style={({ pressed }) => [styles.tile, pressed && styles.tilePressed]}
      onPress={item.onPress}
      accessibilityRole="button"
      accessibilityLabel={item.label}
    >
      <View style={styles.tileIcon}>
        <Ionicons name={item.icon} size={22} color={colors.primary} />
      </View>
      <Text style={styles.tileLabel} numberOfLines={2}>
        {item.label}
      </Text>
      {item.hint ? (
        <Text style={styles.tileHint} numberOfLines={1}>
          {item.hint}
        </Text>
      ) : null}
    </Pressable>
  );
}

function createStyles(colors: AppColors, isDesktop: boolean) {
  return StyleSheet.create({
    body: { paddingHorizontal: isDesktop ? 32 : 16 },
    stats: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.md,
      marginBottom: spacing.lg,
    },
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.md,
    },
    tile: {
      width: isDesktop ? '23%' : '47%',
      minWidth: isDesktop ? 140 : '45%',
      flexGrow: 1,
      maxWidth: isDesktop ? 220 : '48%',
      borderRadius: radius.xl,
      borderWidth: 1,
      padding: spacing.lg,
      ...glassSurface(colors, isDesktop),
      ...cardShadow(false, colors.primary),
      ...premiumHover(),
      ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as const) : null),
    },
    tilePressed: { opacity: 0.88, transform: [{ scale: 0.98 }] },
    tileIcon: {
      width: 44,
      height: 44,
      borderRadius: radius.md,
      backgroundColor: `${colors.primary}18`,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing.sm,
    },
    tileLabel: {
      ...typography.label,
      color: colors.text,
      fontSize: 14,
      fontWeight: '600',
    },
    tileHint: {
      ...typography.caption,
      color: colors.textMuted,
      marginTop: 2,
    },
  });
}
