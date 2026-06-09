import { useNavigation } from '@react-navigation/native';
import { type NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import { StyleSheet, View } from 'react-native';

import { Card, QuickAction, Screen, StatCard } from '@/components/ui';
import { useAuth } from '@/hooks';
import { formatCurrency } from '@/lib/utils';
import type { CommissionsStackParamList } from '@/navigation/types';
import { commissionsService } from '@/services';
import { spacing } from '@/theme';

export function CommissionsHomeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<CommissionsStackParamList>>();
  const { partnerId } = useAuth();

  const analytics = useQuery({
    queryKey: ['commission-analytics', partnerId],
    queryFn: () => commissionsService.analytics({ partnerId }),
    enabled: !!partnerId,
  });

  const pending = useQuery({
    queryKey: ['commission-pending', partnerId],
    queryFn: () => commissionsService.ledger({ partnerId, status: 'PENDING', limit: 1 }),
    enabled: !!partnerId,
  });

  const data = analytics.data ?? {};

  return (
    <Screen scroll>
      <View style={styles.stats}>
        <StatCard
          label="Total Earned"
          value={formatCurrency(Number(data.totalEarned ?? data.totalAmount ?? 0))}
          icon="wallet"
        />
        <StatCard
          label="Paid Out"
          value={formatCurrency(Number(data.totalPaid ?? data.paidAmount ?? 0))}
          icon="checkmark-circle"
        />
      </View>
      <View style={styles.stats}>
        <StatCard label="Pending" value={pending.data?.meta.total ?? 0} icon="hourglass" />
        <StatCard
          label="Recoveries"
          value={formatCurrency(Number(data.totalRecoveries ?? data.recoveryAmount ?? 0))}
          icon="arrow-undo"
        />
      </View>

      <Card title="Quick Access">
        <View style={styles.actions}>
          <QuickAction label="Ledger" icon="list" onPress={() => navigation.navigate('CommissionLedger')} />
          <QuickAction label="Payments" icon="cash" onPress={() => navigation.navigate('CommissionPayments')} />
          <QuickAction label="Pending" icon="time" onPress={() => navigation.navigate('PendingCommissions')} />
          <QuickAction label="Recoveries" icon="refresh" onPress={() => navigation.navigate('CommissionRecoveries')} />
          <QuickAction label="Analytics" icon="bar-chart" onPress={() => navigation.navigate('CommissionAnalytics')} />
        </View>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  stats: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.sm },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
});
