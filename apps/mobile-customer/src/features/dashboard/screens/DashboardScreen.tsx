import { useNavigation } from '@react-navigation/native';
import { type NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Card, DashboardHeader, EmptyState, QuickAction, Screen, StatCard, StatusBadge } from '@/components/ui';
import { useAuth } from '@/hooks';
import { formatCurrency, formatDateTime, str } from '@/lib/utils';
import type { HomeStackParamList } from '@/navigation/types';
import {
  applicationsService,
  documentsService,
  notificationsService,
  referralsService,
} from '@/services';
import { radius, spacing, typography } from '@/theme';
import { useAppTheme } from '@/theme/ThemeProvider';

export function DashboardScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<HomeStackParamList>>();
  const { user, customerId } = useAuth();
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const rawName = user?.email?.split('@')[0] ?? user?.phone?.slice(-4) ?? 'Guest';
  const name = rawName.charAt(0).toUpperCase() + rawName.slice(1);

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

  const goProfile = () => {
    navigation.getParent()?.navigate('Profile');
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
      <DashboardHeader
        name={name}
        unreadCount={notifications.data?.meta.total ?? 0}
        onNotificationsPress={() => navigation.navigate('Notifications')}
        onProfilePress={goProfile}
      />

      <View style={styles.sectionHead}>
        <Text style={styles.sectionTitle}>Quick actions</Text>
        <Text style={styles.sectionSub}>Tools & services</Text>
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
        <View style={styles.sectionHead}>
          <Text style={styles.sectionTitle}>Overview</Text>
          <Text style={styles.sectionSub}>Your numbers at a glance</Text>
        </View>
        <View style={styles.statRow}>
          <StatCard label="Active Apps" value={applications.data?.meta.total ?? 0} icon="document-text" accent />
          <StatCard label="Referral ₹" value={formatCurrency(referralEarnings)} icon="wallet" />
        </View>
        <View style={styles.statRow}>
          <StatCard label="Pending Docs" value={pendingDocs.data?.meta.total ?? 0} icon="folder-open" />
          <StatCard label="Unread" value={notifications.data?.meta.total ?? 0} icon="mail-unread" />
        </View>
      </View>

      <View style={styles.section}>
        <Card title="Active Applications" subtitle="Track your loan pipeline" elevated>
          {applications.isLoading ? (
            <Text style={styles.muted}>Loading...</Text>
          ) : (applications.data?.items.length ?? 0) === 0 ? (
            <EmptyState title="No applications yet" description="Browse products to apply for a loan" />
          ) : (
            applications.data?.items.map((app, index, arr) => (
              <Pressable
                key={String(app.id)}
                style={[styles.row, index === arr.length - 1 && styles.rowLast]}
                onPress={() => openApplication(String(app.id))}
              >
                <View style={styles.rowIcon}>
                  <Text style={styles.rowIconText}>₹</Text>
                </View>
                <View style={styles.rowBody}>
                  <Text style={styles.rowTitle}>{str(app.applicationNumber ?? app.id)}</Text>
                  <Text style={styles.rowSub}>
                    {str(app.productName)} · {formatCurrency(app.requestedAmount as number)}
                  </Text>
                </View>
                <StatusBadge status={str(app.status)} />
              </Pressable>
            ))
          )}
        </Card>

        <Card title="Recent Notifications" subtitle="Stay updated on your applications" elevated>
          {(notifications.data?.items.length ?? 0) === 0 ? (
            <Text style={styles.muted}>No new notifications</Text>
          ) : (
            notifications.data?.items.map((n, index, arr) => (
              <View key={String(n.id)} style={[styles.row, index === arr.length - 1 && styles.rowLast]}>
                <View style={[styles.rowIcon, styles.rowIconInfo]}>
                  <Text style={styles.rowIconText}>!</Text>
                </View>
                <View style={styles.rowBody}>
                  <Text style={styles.rowTitle}>{str(n.title)}</Text>
                  <Text style={styles.rowSub} numberOfLines={2}>
                    {str(n.message)}
                  </Text>
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

function createStyles(colors: ReturnType<typeof useAppTheme>['colors']) {
  return StyleSheet.create({
    section: { paddingHorizontal: spacing.md, paddingBottom: spacing.sm },
    sectionHead: { paddingHorizontal: spacing.md, marginBottom: spacing.sm },
    sectionTitle: { ...typography.h3, color: colors.text, fontSize: 17 },
    sectionSub: { ...typography.bodySm, color: colors.textSecondary, marginTop: 2 },
    actions: {
      paddingHorizontal: spacing.md,
      gap: spacing.md,
      paddingBottom: spacing.lg,
    },
    statRow: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.md },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      paddingVertical: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    rowLast: { borderBottomWidth: 0 },
    rowIcon: {
      width: 40,
      height: 40,
      borderRadius: radius.md,
      backgroundColor: `${colors.primary}18`,
      alignItems: 'center',
      justifyContent: 'center',
    },
    rowIconInfo: { backgroundColor: `${colors.info}22` },
    rowIconText: { ...typography.label, color: colors.primary, fontSize: 16 },
    rowBody: { flex: 1 },
    rowTitle: { ...typography.label, color: colors.text, fontSize: 14 },
    rowSub: { ...typography.bodySm, color: colors.textSecondary, marginTop: 4, lineHeight: 18 },
    time: { ...typography.bodySm, color: colors.textMuted, fontSize: 11, maxWidth: 72, textAlign: 'right' },
    muted: { ...typography.body, color: colors.textSecondary },
  });
}
