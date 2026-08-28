import { useNavigation } from '@react-navigation/native';
import { type NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Card, DashboardHeader, EmptyState, QuickAction, Screen, SectionHeader, StatCard, StatusBadge } from '@/components/ui';
import { ACADEMY_LEVELS } from '@/features/academy/data/academy';
import { useAuth, useResponsiveLayout } from '@/hooks';
import { formatCurrency, str } from '@/lib/utils';
import type { HomeStackParamList } from '@/navigation/types';
import {
  applicationsService,
  commissionsService,
  leadsService,
  notificationsService,
  partnersService,
} from '@/services';
import { radius, spacing, typography } from '@/theme';
import { useAppTheme } from '@/theme/ThemeProvider';

export function DashboardScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<HomeStackParamList>>();
  const { user, partnerId } = useAuth();
  const { colors } = useAppTheme();
  const { isDesktop, isWide, pagePad, statColumns, actionColumns, listColumns } = useResponsiveLayout();
  const styles = useMemo(
    () => createStyles(colors, isDesktop, pagePad, statColumns, actionColumns, listColumns),
    [colors, isDesktop, pagePad, statColumns, actionColumns, listColumns],
  );

  const partner = useQuery({
    queryKey: ['partner-profile', partnerId],
    queryFn: () => partnersService.getById(partnerId!),
    enabled: !!partnerId,
    retry: false,
  });

  const name = String(
    partner.data?.contactName ?? partner.data?.businessName ?? user?.phone ?? 'Partner',
  );

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Lean mount: 5 queries instead of 14 — rest of pipeline opens on demand via tabs.
  const leads = useQuery({
    queryKey: ['dashboard', 'leads', partnerId],
    queryFn: () => leadsService.list({ limit: 30, sortBy: 'createdAt', sortOrder: 'desc' }),
    enabled: !!partnerId,
  });

  const applications = useQuery({
    queryKey: ['dashboard', 'applications', partnerId],
    queryFn: () => applicationsService.list({ limit: 8, sortBy: 'createdAt', sortOrder: 'desc' }),
    enabled: !!partnerId,
  });

  const commissions = useQuery({
    queryKey: ['dashboard', 'commissions', partnerId],
    queryFn: () => commissionsService.analytics({ partnerId }),
    enabled: !!partnerId,
  });

  const notifications = useQuery({
    queryKey: ['dashboard', 'notifications', user?.id],
    queryFn: () => notificationsService.list({ userId: user?.id, unreadOnly: true, limit: 5 }),
    enabled: !!user?.id,
  });

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const mtdCommissions = useQuery({
    queryKey: ['dashboard', 'mtd-commissions', partnerId],
    queryFn: () =>
      commissionsService.analytics({
        partnerId,
        fromDate: monthStart.toISOString(),
        toDate: now.toISOString(),
      }),
    enabled: !!partnerId,
  });

  const todayLeads =
    leads.data?.items.filter((l) => new Date(String(l.createdAt)).getTime() >= today.getTime()).length ?? 0;

  const hotLeadItems =
    leads.data?.items.filter((l) => String(l.priority ?? '').toUpperCase() === 'HIGH').slice(0, 5) ?? [];
  const hotLeadCount = hotLeadItems.length;

  /** Backend commissionAnalyticsService.getSummary() shape. */
  const commissionTotals = commissions.data as
    | { totals?: { totalCommission?: number }; paidCommissions?: number }
    | undefined;
  const commissionEarned = Number(commissionTotals?.totals?.totalCommission ?? 0);

  const mtdData = mtdCommissions.data as { totals?: { totalCommission?: number } } | undefined;
  const mtdEarned = Number(mtdData?.totals?.totalCommission ?? 0);
  const MONTHLY_TARGET = 50_000;
  const mtdProgress = Math.min(mtdEarned / MONTHLY_TARGET, 1);
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const daysRemaining = daysInMonth - now.getDate();
  const targetProgress = Math.min(mtdEarned / MONTHLY_TARGET, 1);

  const refreshing =
    leads.isRefetching ||
    applications.isRefetching ||
    commissions.isRefetching ||
    notifications.isRefetching ||
    mtdCommissions.isRefetching;

  const refreshAll = () => {
    void leads.refetch();
    void applications.refetch();
    void commissions.refetch();
    void notifications.refetch();
    void mtdCommissions.refetch();
  };

  const tabNav = navigation.getParent();

  const openLead = (id: string) => {
    tabNav?.navigate('Leads', { screen: 'LeadDetail', params: { id } });
  };

  const openApp = (id: string) => {
    tabNav?.navigate('Applications', { screen: 'ApplicationDetail', params: { id } });
  };

  const goProfile = () => {
    tabNav?.navigate('Profile');
  };

  const goLeads = () => {
    tabNav?.navigate('Leads', { screen: 'LeadsList' });
  };

  const goLeadAnalytics = () => {
    tabNav?.navigate('Leads', { screen: 'LeadAnalytics' });
  };

  const goApplications = () => {
    tabNav?.navigate('Applications', { screen: 'ApplicationsList' });
  };

  const goCommissions = () => {
    tabNav?.navigate('Commissions', { screen: 'CommissionsHome' });
  };

  const goCommissionAnalytics = () => {
    tabNav?.navigate('Commissions', { screen: 'CommissionAnalytics' });
  };

  const goReferrals = () => {
    tabNav?.navigate('Profile', { screen: 'Referrals' });
  };

  const goNotifications = () => {
    navigation.navigate('Notifications');
  };

  if (leads.isError) {
    return (
      <Screen title="Dashboard" subtitle="Grow your financial business today">
        <EmptyState
          title="Couldn't load your business dashboard"
          description="Check network and API URL in Settings, then try again."
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
    <Screen
      scroll
      padded={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={refreshAll} tintColor={colors.primary} />
      }
    >
      <DashboardHeader
        name={name}
        unreadCount={notifications.data?.meta.total ?? 0}
        onNotificationsPress={() => navigation.navigate('Notifications')}
        onProfilePress={goProfile}
      />

      <View style={styles.sectionHead}>
        <SectionHeader
          eyebrow="Today"
          title="What should I do today?"
          subtitle="Quick actions to grow your business"
        />
      </View>

      {isWide ? (
        <View style={styles.actionsGrid}>
          <QuickAction
            style={styles.actionItem}
            label="New Customer"
            icon="person-add"
            onPress={() => tabNav?.navigate('Leads', { screen: 'CreateLead' })}
          />
          <QuickAction
            style={styles.actionItem}
            label="Academy"
            icon="school"
            onPress={() => tabNav?.navigate('Academy', { screen: 'AcademyHome' })}
          />
          <QuickAction style={styles.actionItem} label="Analytics" icon="bar-chart" onPress={goLeadAnalytics} />
          <QuickAction style={styles.actionItem} label="Earnings" icon="wallet" onPress={goCommissions} />
          <QuickAction
            style={styles.actionItem}
            label="AI Coach"
            icon="sparkles"
            onPress={() => navigation.navigate('AiAdvisor')}
          />
          <QuickAction style={styles.actionItem} label="Alerts" icon="notifications" onPress={goNotifications} />
          <QuickAction style={styles.actionItem} label="Referrals" icon="gift" onPress={goReferrals} />
        </View>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.actions}>
          <QuickAction
            label="New Customer"
            icon="person-add"
            onPress={() => tabNav?.navigate('Leads', { screen: 'CreateLead' })}
          />
          <QuickAction
            label="Academy"
            icon="school"
            onPress={() => tabNav?.navigate('Academy', { screen: 'AcademyHome' })}
          />
          <QuickAction label="Analytics" icon="bar-chart" onPress={goLeadAnalytics} />
          <QuickAction label="Earnings" icon="wallet" onPress={goCommissions} />
          <QuickAction label="AI Coach" icon="sparkles" onPress={() => navigation.navigate('AiAdvisor')} />
          <QuickAction label="Alerts" icon="notifications" onPress={goNotifications} />
          <QuickAction label="Referrals" icon="gift" onPress={goReferrals} />
        </ScrollView>
      )}

      <View style={styles.section}>
        <View style={styles.sectionHeadInset}>
          <SectionHeader
            eyebrow="Learning"
            title="Kuber Academy"
            subtitle="Learn · Certify · Rank — grow as a financial entrepreneur"
          />
        </View>
        <View style={styles.academyRow}>
          <StatCard
            style={styles.statHalf}
            label="Learning tracks"
            value={ACADEMY_LEVELS.length}
            icon="school"
            accent
            onPress={() => tabNav?.navigate('Academy', { screen: 'AcademyHome' })}
          />
          <StatCard
            style={styles.statHalf}
            label="Certifications"
            value="Bronze → Diamond"
            icon="ribbon"
            onPress={() =>
              tabNav?.navigate('Academy', {
                screen: 'AcademyModule',
                params: { moduleId: 'certifications' },
              })
            }
          />
          {isDesktop ? (
            <Card
              style={styles.academyCta}
              title="Start learning"
              subtitle="Product training, compliance and business growth paths"
              elevated
              onPress={() => tabNav?.navigate('Academy', { screen: 'AcademyHome' })}
            >
              <Text style={{ color: colors.primary, fontWeight: '700' }}>Open Academy →</Text>
            </Card>
          ) : null}
        </View>
        {!isDesktop ? (
          <Card
            title="Start learning"
            subtitle="Product training, compliance and business growth paths"
            elevated
            onPress={() => tabNav?.navigate('Academy', { screen: 'AcademyHome' })}
          >
            <Text style={{ color: colors.primary, fontWeight: '700' }}>Open Academy →</Text>
          </Card>
        ) : null}
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeadInset}>
          <SectionHeader eyebrow="Metrics" title="Pipeline overview" subtitle="Today's numbers at a glance" />
        </View>
        <View style={styles.statGrid}>
          <StatCard style={styles.statCell} label="Today's Leads" value={todayLeads} icon="today" accent onPress={goLeads} />
          <StatCard
            style={styles.statCell}
            label="Hot Leads"
            value={hotLeadCount}
            icon="flame"
            onPress={goLeadAnalytics}
          />
          <StatCard
            style={styles.statCell}
            label="Applications"
            value={applications.data?.meta.total ?? 0}
            icon="document-text"
            onPress={goApplications}
          />
          <StatCard
            style={styles.statCell}
            label="Commission ₹"
            value={commissions.isError ? '—' : formatCurrency(commissionEarned)}
            icon="trending-up"
            onPress={goCommissionAnalytics}
          />
        </View>
      </View>

      {/* ── MTD Earnings Widget ── */}
      <View style={styles.section}>
        <View style={styles.sectionHeadInset}>
          <SectionHeader
            eyebrow="Finance"
            title="MTD Earnings"
            subtitle={`Month-to-date · ${daysRemaining} days left · target ${formatCurrency(MONTHLY_TARGET)}`}
          />
        </View>
        <Card elevated>
          <View style={styles.widgetRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.widgetValue}>{formatCurrency(mtdEarned)}</Text>
              <Text style={styles.widgetMini}>
                {(mtdProgress * 100).toFixed(0)}% of monthly target
              </Text>
            </View>
          </View>
          <View style={styles.progressBarBg}>
            <View
              style={[
                styles.progressBarFill,
                {
                  width: `${(mtdProgress * 100).toFixed(0)}%` as `${number}%`,
                  backgroundColor:
                    targetProgress >= 1
                      ? colors.success
                      : targetProgress >= 0.5
                        ? colors.warning
                        : colors.primary,
                },
              ]}
            />
          </View>
        </Card>
      </View>

      <View style={[styles.section, styles.listsSection]}>
        <View style={styles.listCol}>
          <Card title="Hot Leads" subtitle="High priority prospects" elevated onPress={goLeads}>
            {hotLeadItems.length === 0 ? (
              <EmptyState title="No hot leads" description="Create leads with HIGH priority to see them here" />
            ) : (
              hotLeadItems.map((lead, index, arr) => (
                <Pressable
                  key={String(lead.id)}
                  style={[styles.row, index === arr.length - 1 && styles.rowLast]}
                  onPress={() => openLead(String(lead.id))}
                >
                  <View style={styles.rowIcon}>
                    <Text style={styles.rowIconText}>L</Text>
                  </View>
                  <View style={styles.rowBody}>
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

        <View style={styles.listCol}>
          <Card title="Recent Applications" subtitle="Latest in your pipeline" elevated onPress={goApplications}>
            {(applications.data?.items.length ?? 0) === 0 ? (
              <EmptyState title="No applications yet" description="Convert leads to start applications" />
            ) : (
              applications.data?.items.map((app, index, arr) => (
                <Pressable
                  key={String(app.id)}
                  style={[styles.row, index === arr.length - 1 && styles.rowLast]}
                  onPress={() => openApp(String(app.id))}
                >
                  <View style={[styles.rowIcon, styles.rowIconApp]}>
                    <Text style={styles.rowIconText}>₹</Text>
                  </View>
                  <View style={styles.rowBody}>
                    <Text style={styles.rowTitle}>{str(app.customerName ?? app.applicationNumber ?? app.id)}</Text>
                    <Text style={styles.rowSub}>
                      {str(app.productName)} · {formatCurrency((app.loanAmount ?? app.requestedAmount) as number)}
                    </Text>
                  </View>
                  <StatusBadge status={str(app.status)} />
                </Pressable>
              ))
            )}
          </Card>
        </View>

        <View style={styles.listFull}>
          <Card
            title="Unread Alerts"
            subtitle={`${notifications.data?.meta.total ?? 0} unread`}
            elevated
            onPress={goNotifications}
          >
            {(notifications.data?.items.length ?? 0) === 0 ? (
              <Text style={styles.muted}>All caught up — no new alerts</Text>
            ) : (
              notifications.data?.items.slice(0, 3).map((n, index, arr) => (
                <View key={String(n.id)} style={[styles.row, index === arr.length - 1 && styles.rowLast]}>
                  <View style={[styles.rowIcon, styles.rowIconInfo]}>
                    <Text style={styles.rowIconText}>!</Text>
                  </View>
                  <View style={styles.rowBody}>
                    <Text style={styles.rowTitle}>{str(n.title ?? n.subject)}</Text>
                    {n.message ? (
                      <Text style={styles.rowSub} numberOfLines={2}>
                        {str(n.message)}
                      </Text>
                    ) : null}
                  </View>
                </View>
              ))
            )}
          </Card>
        </View>
      </View>
    </Screen>
  );
}


function createStyles(
  colors: ReturnType<typeof useAppTheme>['colors'],
  isDesktop: boolean,
  pagePad: number,
  statColumns: number,
  actionColumns: number,
  listColumns: number,
) {
  const statBasis = `${100 / statColumns - 1.5}%` as `${number}%`;
  const actionBasis = `${100 / actionColumns - 0.8}%` as `${number}%`;
  const listBasis = listColumns > 1 ? ('48.5%' as const) : ('100%' as const);

  return StyleSheet.create({
    section: { paddingHorizontal: pagePad, paddingBottom: spacing.sm },
    sectionHead: { paddingHorizontal: pagePad, marginBottom: spacing.sm },
    sectionHeadInset: { marginBottom: spacing.sm },
    sectionTitle: {
      ...typography.h3,
      color: colors.text,
      fontSize: isDesktop ? 20 : 17,
      fontWeight: '800',
    },
    sectionSub: {
      ...typography.bodySm,
      color: colors.textSecondary,
      marginTop: 2,
      fontSize: isDesktop ? 14 : 13,
    },
    actions: {
      paddingHorizontal: pagePad,
      gap: spacing.md,
      paddingBottom: spacing.lg,
    },
    actionsGrid: {
      paddingHorizontal: pagePad,
      paddingBottom: spacing.md,
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: isDesktop ? spacing.sm : spacing.md,
    },
    actionItem: {
      flexBasis: isDesktop ? 'auto' : actionBasis,
      maxWidth: isDesktop ? undefined : actionBasis,
      minWidth: isDesktop ? undefined : 88,
    },
    academyRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.md,
      marginBottom: spacing.md,
      alignItems: 'stretch',
    },
    statHalf: {
      flexBasis: isDesktop ? '24%' : '47%',
      minWidth: isDesktop ? 160 : 140,
    },
    academyCta: {
      flex: 1,
      minWidth: 240,
      marginBottom: 0,
    },
    statGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.md,
    },
    statCell: {
      flexBasis: statBasis,
      minWidth: isDesktop ? 160 : 140,
      maxWidth: isDesktop && statColumns === 4 ? '24%' : undefined,
    },
    listsSection: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.md,
      alignItems: 'flex-start',
    },
    listCol: {
      flexBasis: listBasis,
      minWidth: listColumns > 1 ? 320 : undefined,
      flexGrow: 1,
    },
    listFull: {
      flexBasis: '100%',
      width: '100%',
    },
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
    rowIconApp: { backgroundColor: `${colors.success}18` },
    rowIconInfo: { backgroundColor: `${colors.info}22` },
    rowIconText: { ...typography.label, color: colors.primary, fontSize: 16, fontWeight: '700' },
    rowBody: { flex: 1 },
    rowTitle: { ...typography.label, color: colors.text, fontSize: 14 },
    rowSub: { ...typography.bodySm, color: colors.textSecondary, marginTop: 4, lineHeight: 18 },
    muted: { ...typography.body, color: colors.textSecondary },
    widgetRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: spacing.sm,
    },
    widgetValue: {
      ...typography.h3,
      color: colors.text,
      fontSize: isDesktop ? 24 : 20,
      fontWeight: '800',
    },
    widgetLabel: {
      ...typography.bodySm,
      color: colors.textSecondary,
      fontSize: 13,
    },
    widgetChangeRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      marginTop: 4,
    },
    widgetChangeText: {
      ...typography.bodySm,
      fontSize: 13,
      fontWeight: '600',
    },
    widgetMini: {
      ...typography.bodySm,
      color: colors.textSecondary,
      fontSize: 12,
      marginTop: 4,
    },
    widgetStatNum: {
      ...typography.label,
      color: colors.text,
      fontSize: 16,
      fontWeight: '700',
    },
    progressBarBg: {
      height: 8,
      backgroundColor: `${colors.primary}15`,
      borderRadius: 4,
      overflow: 'hidden' as const,
    },
    progressBarFill: {
      height: '100%',
      borderRadius: 4,
    },
    conversionStat: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 6,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
  });
}
