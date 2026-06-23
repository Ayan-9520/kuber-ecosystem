import { useNavigation } from '@react-navigation/native';
import { type NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { Share, Text, View } from 'react-native';

import { Button, Card, EmptyState, ListRow, Screen, StatCard } from '@/components/ui';
import { useAuth } from '@/hooks';
import { formatCurrency, formatDate, getApiErrorMessage, str } from '@/lib/utils';
import type { ProfileStackParamList } from '@/navigation/types';
import { partnersService, referralsService } from '@/services';
import { spacing } from '@/theme';
import { useAppTheme } from '@/theme/ThemeProvider';

export function ReferralsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ProfileStackParamList>>();
  const { partnerId, user } = useAuth();
  const { colors } = useAppTheme();
  const [error, setError] = useState('');

  const partner = useQuery({
    queryKey: ['partner-profile', partnerId],
    queryFn: () => partnersService.getById(partnerId!),
    enabled: !!partnerId,
  });

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

  const referralCode = String(
    partner.data?.partnerCode ?? (partnerId ? `DSA${partnerId.replace(/-/g, '').slice(0, 8).toUpperCase()}` : 'KUBERONE'),
  );
  const partnerName = String(partner.data?.contactName ?? partner.data?.businessName ?? 'DSA Partner');

  const shareCode = async () => {
    try {
      await Share.share({
        message: `Apply for loans with ${partnerName} on KuberOne.\nReferral code: ${referralCode}\nContact: ${user?.phone ?? ''}`,
        title: 'KuberOne DSA Referral',
      });
    } catch (e) {
      setError(getApiErrorMessage(e));
    }
  };

  return (
    <Screen scroll>
      {error ? <Text style={{ color: colors.danger, marginBottom: spacing.md }}>{error}</Text> : null}

      <Card title="Your Referral Code" elevated>
        <Text style={{ fontSize: 22, fontWeight: '700', color: colors.primary, letterSpacing: 1 }}>{referralCode}</Text>
        <Text style={{ color: colors.textMuted, marginTop: spacing.sm }}>{partnerName}</Text>
      </Card>

      <Button title="Create Referral" fullWidth onPress={() => navigation.navigate('CreateReferral')} />
      <Button title="Share Referral Code" variant="secondary" fullWidth onPress={() => void shareCode()} />

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.md }}>
        <StatCard label="Total" value={stats.total} icon="people" />
        <StatCard label="Converted" value={stats.converted} icon="checkmark" />
        <StatCard label="Rewards" value={formatCurrency(stats.earnings)} icon="gift" />
      </View>

      <Card title="Referral Tracking">
        {(referrals.data?.items.length ?? 0) === 0 ? (
          <EmptyState title="No referrals yet" description="Create referrals to track rewards" />
        ) : (
          referrals.data?.items.map((r) => (
            <ListRow
              key={String(r.id)}
              title={str(r.refereeName)}
              subtitle={`${str(r.referralNumber)} · ${formatCurrency(r.requestedAmount as number)} · ${formatDate(r.createdAt as string)}`}
              status={str(r.status)}
              icon="person-add"
            />
          ))
        )}
      </Card>
    </Screen>
  );
}
