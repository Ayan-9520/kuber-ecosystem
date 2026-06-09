import { useNavigation } from '@react-navigation/native';
import { type NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { Share, StyleSheet, Text, View } from 'react-native';

import { Button, Card, EmptyState, ListRow, Screen, StatCard } from '@/components/ui';
import { useAuth } from '@/hooks';
import { formatCurrency, formatDate, getApiErrorMessage, str } from '@/lib/utils';
import type { ProfileStackParamList } from '@/navigation/types';
import { referralsService } from '@/services';
import { colors, spacing } from '@/theme';

export function ReferralsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ProfileStackParamList>>();
  const { partnerId, user } = useAuth();
  const [error, setError] = useState('');

  const referrals = useQuery({
    queryKey: ['referrals', partnerId],
    queryFn: () =>
      referralsService.list({ referrerPartnerId: partnerId, limit: 50, sortBy: 'createdAt', sortOrder: 'desc' }),
    enabled: !!partnerId,
  });

  const stats = useMemo(() => {
    const items = referrals.data?.items ?? [];
    return {
      total: items.length,
      converted: items.filter((r) => r.status === 'CONVERTED').length,
      earnings: items.reduce((s, r) => s + Number(r.rewardAmount ?? 0), 0),
    };
  }, [referrals.data?.items]);

  const shareCode = async () => {
    try {
      const code = partnerId ? `DSA${partnerId.replace(/-/g, '').slice(0, 8).toUpperCase()}` : 'KUBERONE';
      await Share.share({
        message: `Join KuberOne via DSA partner ${user?.phone ?? ''}. Referral code: ${code}`,
        title: 'KuberOne DSA Referral',
      });
    } catch (e) {
      setError(getApiErrorMessage(e));
    }
  };

  return (
    <Screen scroll>
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Button title="Create Referral" fullWidth onPress={() => navigation.navigate('CreateReferral')} />
      <Button title="Share Referral Code" variant="secondary" fullWidth onPress={() => void shareCode()} />

      <View style={styles.statsRow}>
        <StatCard label="Total" value={stats.total} icon="people" />
        <StatCard label="Converted" value={stats.converted} icon="checkmark" />
        <StatCard label="Rewards" value={formatCurrency(stats.earnings)} icon="gift" />
      </View>

      <Card title="Referral Tracking">
        {(referrals.data?.items.length ?? 0) === 0 ? (
          <EmptyState title="No referrals" description="Create referrals to earn rewards" />
        ) : (
          referrals.data?.items.map((r) => (
            <ListRow
              key={String(r.id)}
              title={str(r.refereeName)}
              subtitle={`${str(r.referralNumber)} · ${formatDate(r.createdAt as string)}`}
              status={str(r.status)}
              icon="person-add"
            />
          ))
        )}
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  error: { color: colors.danger, marginBottom: spacing.md },
  statsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.md },
});
