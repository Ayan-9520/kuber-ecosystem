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
  commissionsService,
  documentsService,
  leadsService,
  notificationsService,
  referralsService,
} from '@/services';
import { colors, spacing, typography } from '@/theme';

export function DashboardScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<HomeStackParamList>>();
  const { user, partnerId } = useAuth();
  const name = user?.phone?.slice(-4) ?? user?.email?.split('@')[0] ?? 'Partner';

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const leads = useQuery({
    queryKey: ['dashboard', 'leads', partnerId],
    queryFn: () => leadsService.list({ limit: 100, sortBy: 'createdAt', sortOrder: 'desc' }),
    enabled: !!partnerId,
  });

  const hotLeads = useQuery({
    queryKey: ['dashboard', 'hot-leads', partnerId],
    queryFn: () =>
      leadsService.list({
        priority: 'HIGH',
        limit: 5,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      }),
    enabled: !!partnerId,
  });

  const applications = useQuery({
    queryKey: ['dashboard', 'applications', partnerId],
    queryFn: () => applicationsService.list({ limit: 5, sortBy: 'createdAt', sortOrder: 'desc' }),
    enabled: !!partnerId,
  });

  const sanctions = useQuery({
    queryKey: ['dashboard', 'sanctions', partnerId],
    queryFn: () => applicationsService.list({ status: 'SANCTIONED', limit: 5 }),
    enabled: !!partnerId,
  });

  const disbursements = useQuery({
    queryKey: ['dashboard', 'disbursements', partnerId],
    queryFn: () => applicationsService.list({ status: 'DISBURSED', limit: 5 }),
    enabled: !!partnerId,
  });

  const commissions = useQuery({
    queryKey: ['dashboard', 'commissions', partnerId],
    queryFn: () => commissionsService.analytics({ partnerId }),
    enabled: !!partnerId,
  });

  const referrals = useQuery({
    queryKey: ['dashboard', 'referrals', partnerId],
    queryFn: () =>
      referralsService.list({ referrerPartnerId: partnerId, limit: 5, sortBy: 'createdAt', sortOrder: 'desc' }),
    enabled: !!partnerId,
  });

  const pendingDocs = useQuery({
    queryKey: ['dashboard', 'docs', partnerId],
    queryFn: () => documentsService.list({ partnerId, status: 'PENDING_VERIFICATION', limit: 5 }),
    enabled: !!partnerId,
  });

  const notifications = useQuery({
    queryKey: ['dashboard', 'notifications', user?.id],
    queryFn: () => notificationsService.list({ userId: user?.id, unreadOnly: true, limit: 5 }),
    enabled: !!user?.id,
  });

  const todayLeads =
    leads.data?.items.filter((l) => new Date(String(l.createdAt)).getTime() >= today.getTime()).length ?? 0;

  const referralEarnings =
    referrals.data?.items.reduce((s, r) => s + Number(r.rewardAmount ?? 0), 0) ?? 0;

  const openLead = (id: string) => {
    navigation.getParent()?.navigate('Leads', { screen: 'LeadDetail', params: { id } });
  };

  const openApp = (id: string) => {
    navigation.getParent()?.navigate('Applications', { screen: 'ApplicationDetail', params: { id } });
  };

  if (leads.isError) {
    return (
      <Screen title="Dashboard" subtitle="DSA partner command center">
        <EmptyState
          title="Failed to load dashboard"
          description="Check network and API URL in Settings."
          action={
            <Pressable onPress={() => void leads.refetch()}>
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
        <Text style={styles.name}>Partner {name}</Text>
        <Text style={styles.heroSub}>DSA partner command center</Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.actions}>
        <QuickAction
          label="New Lead"
          icon="person-add"
          onPress={() => navigation.getParent()?.navigate('Leads', { screen: 'CreateLead' })}
        />
        <QuickAction
          label="Analytics"
          icon="bar-chart"
          onPress={() => navigation.getParent()?.navigate('Leads', { screen: 'LeadAnalytics' })}
        />
        <QuickAction
          label="Commissions"
          icon="wallet"
          onPress={() => navigation.getParent()?.navigate('Commissions')}
        />
        <QuickAction label="AI Advisor" icon="sparkles" onPress={() => navigation.navigate('AiAdvisor')} />
        <QuickAction label="Voice AI" icon="mic" onPress={() => navigation.navigate('VoiceAi')} />
        <QuickAction label="Alerts" icon="notifications" onPress={() => navigation.navigate('Notifications')} />
        <QuickAction
          label="Referrals"
          icon="gift"
          onPress={() => navigation.getParent()?.navigate('Profile', { screen: 'Referrals' })}
        />
      </ScrollView>

      <View style={styles.section}>
        <View style={styles.statRow}>
          <StatCard label="Today's Leads" value={todayLeads} icon="today" />
          <StatCard label="Hot Leads" value={hotLeads.data?.meta.total ?? 0} icon="flame" />
        </View>
        <View style={styles.statRow}>
          <StatCard label="Applications" value={applications.data?.meta.total ?? 0} icon="document-text" />
          <StatCard label="Sanctions" value={sanctions.data?.meta.total ?? 0} icon="ribbon" />
        </View>
        <View style={styles.statRow}>
          <StatCard label="Disbursements" value={disbursements.data?.meta.total ?? 0} icon="cash" />
          <StatCard
            label="Commission ₹"
            value={formatCurrency(Number(commissions.data?.totalEarned ?? commissions.data?.totalAmount ?? 0))}
            icon="trending-up"
          />
        </View>
        <View style={styles.statRow}>
          <StatCard label="Referral ₹" value={formatCurrency(referralEarnings)} icon="gift" />
          <StatCard label="Pending Docs" value={pendingDocs.data?.meta.total ?? 0} icon="folder-open" />
        </View>
      </View>

      <View style={styles.section}>
        <Card title="Hot Leads" subtitle="High priority prospects">
          {(hotLeads.data?.items.length ?? 0) === 0 ? (
            <EmptyState title="No hot leads" description="Create leads with HIGH priority to see them here" />
          ) : (
            hotLeads.data?.items.map((lead) => (
              <Pressable key={String(lead.id)} style={styles.row} onPress={() => openLead(String(lead.id))}>
                <View>
                  <Text style={styles.rowTitle}>{str(lead.prospectName)}</Text>
                  <Text style={styles.rowSub}>
                    {str(lead.leadNumber)} · {formatCurrency(lead.requestedAmount as number)}
                  </Text>
                </View>
                <StatusBadge status={str(lead.status)} />
              </Pressable>
            ))
          )}
        </Card>
      </View>

      <View style={styles.section}>
        <Card title="Recent Applications">
          {(applications.data?.items.length ?? 0) === 0 ? (
            <EmptyState title="No applications yet" description="Convert leads to start applications" />
          ) : (
            applications.data?.items.map((app) => (
              <Pressable key={String(app.id)} style={styles.row} onPress={() => openApp(String(app.id))}>
                <View>
                  <Text style={styles.rowTitle}>{str(app.applicationNumber ?? app.id)}</Text>
                  <Text style={styles.rowSub}>{formatDateTime(app.updatedAt as string)}</Text>
                </View>
                <StatusBadge status={str(app.status)} />
              </Pressable>
            ))
          )}
        </Card>
      </View>

      <View style={[styles.section, { paddingBottom: spacing.xxl }]}>
        <Card title="Unread Alerts" subtitle={`${notifications.data?.meta.total ?? 0} unread`}>
          {(notifications.data?.items.length ?? 0) === 0 ? (
            <Text style={styles.muted}>All caught up</Text>
          ) : (
            notifications.data?.items.slice(0, 3).map((n) => (
              <View key={String(n.id)} style={styles.row}>
                <Text style={styles.rowTitle}>{str(n.title ?? n.subject)}</Text>
              </View>
            ))
          )}
        </Card>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { padding: spacing.lg, paddingTop: spacing.xl },
  greeting: { ...typography.bodySm, color: colors.textMuted },
  name: { ...typography.h2, color: colors.text, marginTop: 4 },
  heroSub: { ...typography.caption, color: colors.textSecondary, marginTop: 4 },
  actions: { paddingHorizontal: spacing.lg, gap: spacing.sm, paddingBottom: spacing.md },
  section: { paddingHorizontal: spacing.lg, marginBottom: spacing.md },
  statRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.sm },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  rowTitle: { ...typography.body, color: colors.text, fontWeight: '600' },
  rowSub: { ...typography.caption, color: colors.textMuted, marginTop: 2 },
  muted: { ...typography.bodySm, color: colors.textMuted },
});
