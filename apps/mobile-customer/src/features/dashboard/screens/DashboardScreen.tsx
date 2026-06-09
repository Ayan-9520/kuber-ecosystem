import { useNavigation } from '@react-navigation/native';
import { type NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Card, EmptyState, QuickAction, Screen, StatCard, StatusBadge } from '@/components/ui';
import { useAuth } from '@/hooks';
import { formatCurrency, formatDateTime, str } from '@/lib/utils';
import type { HomeStackParamList } from '@/navigation/types';
import {
  applicationsService,
  documentsService,
  notificationsService,
  referralsService,
} from '@/services';
import { colors, spacing, typography } from '@/theme';

export function DashboardScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<HomeStackParamList>>();
  const { user, customerId } = useAuth();
  const name = user?.email?.split('@')[0] ?? user?.phone?.slice(-4) ?? 'there';

  const applications = useQuery({
    queryKey: ['dashboard', 'applications', customerId],
    queryFn: () => applicationsService.list({ customerId, limit: 5, sortBy: 'createdAt', sortOrder: 'desc' }),
    enabled: !!customerId,
  });

  const notifications = useQuery({
    queryKey: ['dashboard', 'notifications', user?.id],
    queryFn: () => notificationsService.list({ userId: user?.id, unreadOnly: true, limit: 5 }),
    enabled: !!user?.id,
  });

  const referrals = useQuery({
    queryKey: ['dashboard', 'referrals', customerId],
    queryFn: () => referralsService.list({ referrerCustomerId: customerId, limit: 5 }),
    enabled: !!customerId,
  });

  const pendingDocs = useQuery({
    queryKey: ['dashboard', 'docs', customerId],
    queryFn: () => documentsService.list({ customerId, status: 'PENDING_VERIFICATION', limit: 5 }),
    enabled: !!customerId,
  });

  const referralEarnings = referrals.data?.items.reduce(
    (s, r) => s + Number(r.rewardAmount ?? 0),
    0,
  ) ?? 0;

  const openApplication = (id: string) => {
    navigation.getParent()?.navigate('Applications', {
      screen: 'ApplicationDetail',
      params: { id },
    });
  };

  if (applications.isError || notifications.isError) {
    return (
      <Screen title="Dashboard" subtitle="Your premium fintech dashboard">
        <EmptyState
          title="Failed to load dashboard"
          description="Check network and API URL in Settings."
          action={
            <Pressable onPress={() => { void applications.refetch(); void notifications.refetch(); }}>
              <Text style={{ color: colors.primary, fontWeight: '600' }}>Retry</Text>
            </Pressable>
          }
        />
      </Screen>
    );
  }

  return (
    <Screen scroll padded={false}>
      <View style={styles.hero}>
        <Text style={styles.greeting}>Welcome back,</Text>
        <Text style={styles.name}>{name} 👋</Text>
        <Text style={styles.heroSub}>Your premium fintech dashboard</Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.actions}>
        <QuickAction label="Eligibility" icon="checkmark-circle" onPress={() => navigation.navigate('Eligibility')} />
        <QuickAction label="EMI Calc" icon="calculator" onPress={() => navigation.navigate('EmiCalculator')} />
        <QuickAction label="Offers" icon="sparkles" onPress={() => navigation.navigate('Recommendations')} />
        <QuickAction label="AI Advisor" icon="chatbubble-ellipses" onPress={() => navigation.navigate('AiAdvisor')} />
        <QuickAction label="Voice AI" icon="mic" onPress={() => navigation.navigate('VoiceAi')} />
        <QuickAction label="Referrals" icon="gift" onPress={() => navigation.navigate('Referrals')} />
        <QuickAction label="Alerts" icon="notifications" onPress={() => navigation.navigate('Notifications')} />
      </ScrollView>

      <View style={styles.section}>
        <View style={styles.statRow}>
          <StatCard label="Active Apps" value={applications.data?.meta.total ?? 0} icon="document-text" />
          <StatCard label="Referral ₹" value={formatCurrency(referralEarnings)} icon="wallet" />
        </View>
        <View style={styles.statRow}>
          <StatCard label="Pending Docs" value={pendingDocs.data?.meta.total ?? 0} icon="folder-open" />
          <StatCard label="Unread" value={notifications.data?.meta.total ?? 0} icon="mail-unread" />
        </View>
      </View>

      <View style={styles.section}>
        <Card title="Active Applications" subtitle="Track your loan pipeline">
          {applications.isLoading ? (
            <Text style={styles.muted}>Loading...</Text>
          ) : (applications.data?.items.length ?? 0) === 0 ? (
            <EmptyState title="No applications yet" description="Browse products to apply for a loan" />
          ) : (
            applications.data?.items.map((app) => (
              <Pressable key={String(app.id)} style={styles.row} onPress={() => openApplication(String(app.id))}>
                <View>
                  <Text style={styles.rowTitle}>{str(app.applicationNumber ?? app.id)}</Text>
                  <Text style={styles.rowSub}>{str(app.productName)} · {formatCurrency(app.requestedAmount as number)}</Text>
                </View>
                <StatusBadge status={str(app.status)} />
              </Pressable>
            ))
          )}
        </Card>

        <Card title="Recent Notifications">
          {(notifications.data?.items.length ?? 0) === 0 ? (
            <Text style={styles.muted}>No new notifications</Text>
          ) : (
            notifications.data?.items.map((n) => (
              <View key={String(n.id)} style={styles.row}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.rowTitle}>{str(n.title)}</Text>
                  <Text style={styles.rowSub} numberOfLines={1}>{str(n.message)}</Text>
                </View>
                <Text style={styles.time}>{formatDateTime(n.createdAt as string)}</Text>
              </View>
            ))
          )}
        </Card>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { padding: spacing.lg, paddingTop: spacing.md },
  greeting: { ...typography.bodySm, color: colors.textMuted },
  name: { ...typography.h1, color: colors.text, fontSize: 26 },
  heroSub: { ...typography.bodySm, color: colors.primary, marginTop: 4 },
  actions: { paddingHorizontal: spacing.md, gap: spacing.md, paddingBottom: spacing.md },
  section: { paddingHorizontal: spacing.md },
  statRow: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.md },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  rowTitle: { ...typography.label, color: colors.text },
  rowSub: { ...typography.bodySm, color: colors.textMuted, marginTop: 2 },
  time: { ...typography.bodySm, color: colors.textMuted, fontSize: 10 },
  muted: { ...typography.bodySm, color: colors.textMuted },
});
