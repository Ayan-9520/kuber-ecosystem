import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { type NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { Card, DashboardHeader, EmptyState, QuickAction, Screen, StatCard, StatusBadge } from '@/components/ui';
import { ACADEMY_LEVELS } from '@/features/academy/data/academy';
import { useAuth, useResponsiveLayout } from '@/hooks';
import { formatCurrency, str } from '@/lib/utils';
import type { HomeStackParamList } from '@/navigation/types';
import {
  applicationsService,
  commissionsService,
  documentsService,
  leadsService,
  notificationsService,
  partnersService,
  referralsService,
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

  /** Backend commissionAnalyticsService.getSummary() shape. */
  const commissionTotals = commissions.data as
    | { totals?: { totalCommission?: number }; paidCommissions?: number }
    | undefined;
  const commissionEarned = Number(commissionTotals?.totals?.totalCommission ?? 0);

  // ── MTD Earnings calculations ──
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

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

  const lastMonthCommissions = useQuery({
    queryKey: ['dashboard', 'last-month-commissions', partnerId],
    queryFn: () =>
      commissionsService.analytics({
        partnerId,
        fromDate: lastMonthStart.toISOString(),
        toDate: lastMonthEnd.toISOString(),
      }),
    enabled: !!partnerId,
  });

  const mtdData = mtdCommissions.data as
    | { totals?: { totalCommission?: number } }
    | undefined;
  const lastMonthData = lastMonthCommissions.data as
    | { totals?: { totalCommission?: number } }
    | undefined;

  const mtdEarned = Number(mtdData?.totals?.totalCommission ?? 0);
  const lastMonthEarned = Number(lastMonthData?.totals?.totalCommission ?? 0);
  const mtdChangePercent =
    lastMonthEarned > 0
      ? ((mtdEarned - lastMonthEarned) / lastMonthEarned) * 100
      : mtdEarned > 0
        ? 100
        : 0;
  const MONTHLY_TARGET = 50_000;
  const mtdProgress = Math.min(mtdEarned / MONTHLY_TARGET, 1);

  // ── Conversion Rate calculations ──
  const mtdLeads = useQuery({
    queryKey: ['dashboard', 'mtd-leads', partnerId],
    queryFn: () =>
      leadsService.list({
        fromDate: monthStart.toISOString(),
        limit: 1,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      }),
    enabled: !!partnerId,
  });

  const mtdDisbursed = useQuery({
    queryKey: ['dashboard', 'mtd-disbursed', partnerId],
    queryFn: () =>
      leadsService.list({
        fromDate: monthStart.toISOString(),
        status: 'DISBURSED',
        limit: 1,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      }),
    enabled: !!partnerId,
  });

  const totalLeadsMtd = mtdLeads.data?.meta.total ?? 0;
  const convertedLeadsMtd = mtdDisbursed.data?.meta.total ?? 0;
  const conversionRate =
    totalLeadsMtd > 0 ? (convertedLeadsMtd / totalLeadsMtd) * 100 : 0;

  // ── Target vs Actual ──
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const daysRemaining = daysInMonth - now.getDate();
  const targetProgress = Math.min(mtdEarned / MONTHLY_TARGET, 1);

  const refreshing =
    leads.isRefetching ||
    applications.isRefetching ||
    commissions.isRefetching ||
    notifications.isRefetching;

  const refreshAll = () => {
    void leads.refetch();
    void hotLeads.refetch();
    void applications.refetch();
    void sanctions.refetch();
    void disbursements.refetch();
    void commissions.refetch();
    void referrals.refetch();
    void pendingDocs.refetch();
    void notifications.refetch();
    void mtdCommissions.refetch();
    void lastMonthCommissions.refetch();
    void mtdLeads.refetch();
    void mtdDisbursed.refetch();
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

  const goDocuments = () => {
    tabNav?.navigate('Profile', { screen: 'Documents' });
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
        <Text style={styles.sectionTitle}>What should I do today?</Text>
        <Text style={styles.sectionSub}>Quick actions to grow your business</Text>
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
          <QuickAction
            style={styles.actionItem}
            label="Voice AI"
            icon="mic"
            onPress={() => navigation.navigate('VoiceAi')}
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
          <QuickAction label="Voice AI" icon="mic" onPress={() => navigation.navigate('VoiceAi')} />
          <QuickAction label="Alerts" icon="notifications" onPress={goNotifications} />
          <QuickAction label="Referrals" icon="gift" onPress={goReferrals} />
        </ScrollView>
      )}

      <View style={styles.section}>
        <View style={styles.sectionHeadInset}>
          <Text style={styles.sectionTitle}>Kuber Academy</Text>
          <Text style={styles.sectionSub}>Learn · Certify · Rank — grow as a financial entrepreneur</Text>
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
          <Text style={styles.sectionTitle}>Pipeline overview</Text>
          <Text style={styles.sectionSub}>Today's numbers at a glance</Text>
        </View>
        <View style={styles.statGrid}>
          <StatCard style={styles.statCell} label="Today's Leads" value={todayLeads} icon="today" accent onPress={goLeads} />
          <StatCard
            style={styles.statCell}
            label="Hot Leads"
            value={hotLeads.data?.meta.total ?? 0}
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
            label="Sanctions"
            value={sanctions.data?.meta.total ?? 0}
            icon="ribbon"
            onPress={goApplications}
          />
          <StatCard
            style={styles.statCell}
            label="Disbursements"
            value={disbursements.data?.meta.total ?? 0}
            icon="cash"
            onPress={goApplications}
          />
          <StatCard
            style={styles.statCell}
            label="Commission ₹"
            value={commissions.isError ? '—' : formatCurrency(commissionEarned)}
            icon="trending-up"
            onPress={goCommissionAnalytics}
          />
          <StatCard
            style={styles.statCell}
            label="Referral ₹"
            value={formatCurrency(referralEarnings)}
            icon="gift"
            onPress={goReferrals}
          />
          <StatCard
            style={styles.statCell}
            label="Pending Docs"
            value={pendingDocs.data?.meta.total ?? 0}
            icon="folder-open"
            onPress={goDocuments}
          />
        </View>
      </View>

      {/* ── MTD Earnings Widget ── */}
      <View style={styles.section}>
        <View style={styles.sectionHeadInset}>
          <Text style={styles.sectionTitle}>MTD Earnings</Text>
          <Text style={styles.sectionSub}>Month-to-date commission earnings</Text>
        </View>
        <Card elevated>
          <View style={styles.widgetRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.widgetValue}>{formatCurrency(mtdEarned)}</Text>
              <View style={styles.widgetChangeRow}>
                <Ionicons
                  name={mtdChangePercent >= 0 ? 'arrow-up' : 'arrow-down'}
                  size={14}
                  color={mtdChangePercent >= 0 ? colors.success : colors.danger}
                />
                <Text
                  style={[
                    styles.widgetChangeText,
                    { color: mtdChangePercent >= 0 ? colors.success : colors.danger },
                  ]}
                >
                  {Math.abs(mtdChangePercent).toFixed(1)}% vs last month
                </Text>
              </View>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.widgetLabel}>
                Target: {formatCurrency(MONTHLY_TARGET)}
              </Text>
            </View>
          </View>
          <View style={styles.progressBarBg}>
            <View
              style={[
                styles.progressBarFill,
                {
                  width: `${(mtdProgress * 100).toFixed(0)}%` as `${number}%`,
                  backgroundColor: colors.primary,
                },
              ]}
            />
          </View>
          <Text style={styles.widgetMini}>
            {(mtdProgress * 100).toFixed(0)}% of monthly target
          </Text>
        </Card>
      </View>

      {/* ── Conversion Rate Widget ── */}
      <View style={styles.section}>
        <View style={styles.sectionHeadInset}>
          <Text style={styles.sectionTitle}>Conversion Rate</Text>
          <Text style={styles.sectionSub}>Lead to disbursement this month</Text>
        </View>
        <Card elevated>
          <View style={styles.widgetRow}>
            <ConversionCircle
              percentage={conversionRate}
              size={72}
              strokeWidth={7}
              color={colors.primary}
              trackColor={`${colors.primary}20`}
              textColor={colors.text}
            />
            <View style={{ flex: 1, marginLeft: spacing.lg }}>
              <View style={styles.conversionStat}>
                <Text style={styles.widgetLabel}>Leads submitted</Text>
                <Text style={styles.widgetStatNum}>{totalLeadsMtd}</Text>
              </View>
              <View style={styles.conversionStat}>
                <Text style={styles.widgetLabel}>Disbursed</Text>
                <Text style={[styles.widgetStatNum, { color: colors.success }]}>
                  {convertedLeadsMtd}
                </Text>
              </View>
            </View>
          </View>
        </Card>
      </View>

      {/* ── Target vs Actual Widget ── */}
      <View style={styles.section}>
        <View style={styles.sectionHeadInset}>
          <Text style={styles.sectionTitle}>Target vs Actual</Text>
          <Text style={styles.sectionSub}>{daysRemaining} days remaining this month</Text>
        </View>
        <Card elevated>
          <View style={styles.widgetRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.widgetLabel}>Actual earned</Text>
              <Text style={styles.widgetValue}>{formatCurrency(mtdEarned)}</Text>
            </View>
            <View style={{ flex: 1, alignItems: 'flex-end' }}>
              <Text style={styles.widgetLabel}>Monthly target</Text>
              <Text style={styles.widgetValue}>{formatCurrency(MONTHLY_TARGET)}</Text>
            </View>
          </View>
          <View style={styles.progressBarBg}>
            <View
              style={[
                styles.progressBarFill,
                {
                  width: `${(targetProgress * 100).toFixed(0)}%` as `${number}%`,
                  backgroundColor:
                    targetProgress >= 1
                      ? colors.success
                      : targetProgress >= 0.5
                        ? colors.warning
                        : colors.danger,
                },
              ]}
            />
          </View>
          <View style={styles.widgetRow}>
            <Text style={styles.widgetMini}>
              {(targetProgress * 100).toFixed(0)}% achieved
            </Text>
            <Text style={styles.widgetMini}>
              {formatCurrency(Math.max(MONTHLY_TARGET - mtdEarned, 0))} remaining
            </Text>
          </View>
        </Card>
      </View>

      <View style={[styles.section, styles.listsSection]}>
        <View style={styles.listCol}>
          <Card title="Hot Leads" subtitle="High priority prospects" elevated onPress={goLeads}>
            {(hotLeads.data?.items.length ?? 0) === 0 ? (
              <EmptyState title="No hot leads" description="Create leads with HIGH priority to see them here" />
            ) : (
              hotLeads.data?.items.map((lead, index, arr) => (
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

function ConversionCircle({
  percentage,
  size,
  strokeWidth,
  color,
  trackColor,
  textColor,
}: {
  percentage: number;
  size: number;
  strokeWidth: number;
  color: string;
  trackColor: string;
  textColor: string;
}) {
  const r = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * r;
  const strokeDashoffset = circumference * (1 - Math.min(percentage, 100) / 100);

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={trackColor}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${circumference}`}
          strokeDashoffset={strokeDashoffset}
          rotation={-90}
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
      <Text
        style={{
          position: 'absolute',
          fontSize: 14,
          fontWeight: '800',
          color: textColor,
        }}
      >
        {percentage.toFixed(0)}%
      </Text>
    </View>
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
      paddingBottom: spacing.lg,
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: isDesktop ? spacing.lg : spacing.md,
    },
    actionItem: {
      flexBasis: actionBasis,
      maxWidth: actionBasis,
      minWidth: isDesktop ? 100 : 88,
    },
    academyRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.md,
      marginBottom: spacing.md,
      alignItems: 'stretch',
    },
    statHalf: {
      flexBasis: isDesktop ? '31%' : '47%',
      minWidth: isDesktop ? 200 : 140,
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
      minWidth: isDesktop ? 200 : 140,
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
