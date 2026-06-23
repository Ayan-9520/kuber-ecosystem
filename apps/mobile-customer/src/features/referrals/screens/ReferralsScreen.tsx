import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { Pressable, Share, StyleSheet, Text, View } from 'react-native';

import { Button, Card, EmptyState, Screen, StatCard, StatusBadge } from '@/components/ui';
import { useAuth } from '@/hooks';
import { formatCurrency, formatDate, getApiErrorMessage, str } from '@/lib/utils';
import { referralsService } from '@/services';
import { type AppColors, useAppTheme } from '@/theme/ThemeProvider';
import { radius, spacing, typography } from '@/theme';

interface LeaderboardEntry {
  name: string;
  count: number;
  earnings: number;
}

function buildLeaderboard(items: Record<string, unknown>[]): LeaderboardEntry[] {
  const map = new Map<string, LeaderboardEntry>();

  for (const item of items) {
    const name = str(item.refereeName);
    const existing = map.get(name) ?? { name, count: 0, earnings: 0 };
    existing.count += 1;
    existing.earnings += Number(item.rewardAmount ?? 0);
    map.set(name, existing);
  }

  return [...map.values()].sort((a, b) => b.earnings - a.earnings || b.count - a.count).slice(0, 5);
}

export function ReferralsScreen() {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { customerId } = useAuth();
  const queryClient = useQueryClient();
  const [shareError, setShareError] = useState('');

  const referrals = useQuery({
    queryKey: ['referrals', customerId],
    queryFn: () =>
      referralsService.list({
        referrerCustomerId: customerId,
        limit: 50,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      }),
    enabled: !!customerId,
  });

  const referralCode = useMemo(() => {
    const fromList = referrals.data?.items.find((r) => r.referralCode)?.referralCode;
    if (fromList) return String(fromList);
    if (customerId) return `KUBER${customerId.replace(/-/g, '').slice(0, 8).toUpperCase()}`;
    return '—';
  }, [referrals.data?.items, customerId]);

  const stats = useMemo(() => {
    const items = referrals.data?.items ?? [];
    const converted = items.filter((r) => r.status === 'CONVERTED' || r.convertedAt);
    const pending = items.filter((r) => r.status === 'PENDING' || r.status === 'IN_PROGRESS');
    const totalEarnings = items.reduce((s, r) => s + Number(r.rewardAmount ?? 0), 0);
    return {
      total: items.length,
      converted: converted.length,
      pending: pending.length,
      earnings: totalEarnings,
    };
  }, [referrals.data?.items]);

  const leaderboard = useMemo(
    () => buildLeaderboard(referrals.data?.items ?? []),
    [referrals.data?.items],
  );

  const shareMutation = useMutation({
    mutationFn: async () => {
      const message = `Join KuberOne with my referral code ${referralCode} and get started on your loan journey! Download the app and apply today.`;
      await Share.share({ message, title: 'KuberOne Referral' });
    },
    onError: (e) => setShareError(getApiErrorMessage(e)),
    onSuccess: () => setShareError(''),
  });

  const refresh = () => queryClient.invalidateQueries({ queryKey: ['referrals', customerId] });

  return (
    <Screen title="Referrals" subtitle="Invite friends & earn rewards" loading={referrals.isLoading}>
      <Card title="Your Referral Code">
        <View style={styles.codeBox}>
          <Text style={styles.code}>{referralCode}</Text>
          <Pressable style={styles.copyHint} onPress={() => shareMutation.mutate()}>
            <Ionicons name="share-social" size={18} color={colors.primary} />
            <Text style={styles.shareLabel}>Share</Text>
          </Pressable>
        </View>
        {shareError ? <Text style={styles.error}>{shareError}</Text> : null}
        <Button
          title="Share Referral Code"
          fullWidth
          loading={shareMutation.isPending}
          onPress={() => shareMutation.mutate()}
          icon={<Ionicons name="share-outline" size={18} color={colors.background} />}
        />
      </Card>

      <View style={styles.statRow}>
        <StatCard label="Total Referrals" value={stats.total} icon="people" />
        <StatCard label="Converted" value={stats.converted} icon="checkmark-done" />
      </View>
      <View style={styles.statRow}>
        <StatCard label="Pending" value={stats.pending} icon="time" />
        <StatCard label="Earnings" value={formatCurrency(stats.earnings)} icon="wallet" />
      </View>

      <Card title="Leaderboard" subtitle="Top referrals by rewards">
        {leaderboard.length === 0 ? (
          <Text style={styles.muted}>Share your code to climb the board</Text>
        ) : (
          leaderboard.map((entry, index) => (
            <View key={entry.name} style={styles.leaderRow}>
              <View style={styles.rank}>
                <Text style={styles.rankText}>{index + 1}</Text>
              </View>
              <View style={styles.leaderInfo}>
                <Text style={styles.leaderName}>{entry.name}</Text>
                <Text style={styles.leaderSub}>
                  {entry.count} referral{entry.count !== 1 ? 's' : ''} · {formatCurrency(entry.earnings)}
                </Text>
              </View>
              {index === 0 ? <Ionicons name="trophy" size={18} color={colors.warning} /> : null}
            </View>
          ))
        )}
      </Card>

      <Card
        title="Your Referrals"
        action={
          <Pressable onPress={refresh}>
            <Ionicons name="refresh" size={18} color={colors.primary} />
          </Pressable>
        }
      >
        {(referrals.data?.items.length ?? 0) === 0 ? (
          <EmptyState
            title="No referrals yet"
            description="Share your code with friends and family to start earning"
            action={<Button title="Share Now" onPress={() => shareMutation.mutate()} />}
          />
        ) : (
          referrals.data?.items.map((ref) => (
            <View key={String(ref.id)} style={styles.refRow}>
              <View style={styles.refInfo}>
                <Text style={styles.refName}>{str(ref.refereeName)}</Text>
                <Text style={styles.refSub}>
                  {str(ref.refereePhone)} · {formatDate(ref.createdAt as string)}
                </Text>
                {ref.requestedAmount ? (
                  <Text style={styles.refSub}>Amount: {formatCurrency(ref.requestedAmount as number)}</Text>
                ) : null}
              </View>
              <View style={styles.refBadges}>
                <StatusBadge status={str(ref.status)} />
                {ref.rewardAmount ? (
                  <Text style={styles.reward}>{formatCurrency(ref.rewardAmount as number)}</Text>
                ) : null}
              </View>
            </View>
          ))
        )}
      </Card>
    </Screen>
  );
}

function createStyles(colors: AppColors) {
  return StyleSheet.create({
  codeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  code: { ...typography.h2, color: colors.primary, letterSpacing: 2 },
  copyHint: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  shareLabel: { ...typography.label, color: colors.primary },
  error: { color: colors.danger, marginBottom: spacing.sm },
  statRow: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.md },
  leaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  rank: {
    width: 28,
    height: 28,
    borderRadius: radius.full,
    backgroundColor: 'rgba(34,211,166,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankText: { ...typography.label, color: colors.primary, fontSize: 12 },
  leaderInfo: { flex: 1 },
  leaderName: { ...typography.label, color: colors.text },
  leaderSub: { ...typography.bodySm, color: colors.textMuted, marginTop: 2 },
  muted: { ...typography.bodySm, color: colors.textMuted },
  refRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.sm,
  },
  refInfo: { flex: 1 },
  refName: { ...typography.label, color: colors.text },
  refSub: { ...typography.bodySm, color: colors.textMuted, marginTop: 2 },
  refBadges: { alignItems: 'flex-end', gap: spacing.xs },
  reward: { ...typography.bodySm, color: colors.primary },
});
}
