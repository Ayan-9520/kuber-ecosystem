import { Ionicons } from '@expo/vector-icons';
import { type RouteProp, useRoute } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Card, EmptyState, Screen, StatusBadge } from '@/components/ui';
import { formatCurrency, formatDateTime, getApiErrorMessage, str } from '@/lib/utils';
import type { ApplicationsStackParamList } from '@/navigation/types';
import { applicationsService, documentsService } from '@/services';
import { colors, radius, spacing, typography } from '@/theme';

type ApplicationDetailRoute = RouteProp<ApplicationsStackParamList, 'ApplicationDetail'>;

type DetailTab = 'timeline' | 'bank' | 'credit' | 'sanctions' | 'disbursements' | 'docs';

const TABS: { key: DetailTab; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: 'timeline', label: 'Timeline', icon: 'time' },
  { key: 'bank', label: 'Bank Logins', icon: 'business' },
  { key: 'credit', label: 'Credit', icon: 'analytics' },
  { key: 'sanctions', label: 'Sanctions', icon: 'ribbon' },
  { key: 'disbursements', label: 'Disbursements', icon: 'cash' },
  { key: 'docs', label: 'Pending Docs', icon: 'document' },
];

export function ApplicationDetailScreen() {
  const { params } = useRoute<ApplicationDetailRoute>();
  const [activeTab, setActiveTab] = useState<DetailTab>('timeline');

  const application = useQuery({
    queryKey: ['application', params.id],
    queryFn: () => applicationsService.getById(params.id),
  });

  const timeline = useQuery({
    queryKey: ['application', params.id, 'timeline'],
    queryFn: () => applicationsService.timeline(params.id),
    enabled: activeTab === 'timeline',
  });

  const bankLogins = useQuery({
    queryKey: ['application', params.id, 'bank-logins'],
    queryFn: () => applicationsService.bankLogins(params.id),
    enabled: activeTab === 'bank',
  });

  const creditReviews = useQuery({
    queryKey: ['application', params.id, 'credit-reviews'],
    queryFn: () => applicationsService.creditReviews(params.id),
    enabled: activeTab === 'credit',
  });

  const sanctions = useQuery({
    queryKey: ['application', params.id, 'sanctions'],
    queryFn: () => applicationsService.sanctions(params.id),
    enabled: activeTab === 'sanctions',
  });

  const disbursements = useQuery({
    queryKey: ['application', params.id, 'disbursements'],
    queryFn: () => applicationsService.disbursements(params.id),
    enabled: activeTab === 'disbursements',
  });

  const pendingDocs = useQuery({
    queryKey: ['application', params.id, 'pending-docs'],
    queryFn: () =>
      documentsService.requests({
        applicationId: params.id,
        status: 'PENDING',
        limit: 50,
      }),
    enabled: activeTab === 'docs',
  });

  const activeQuery = {
    timeline,
    bank: bankLogins,
    credit: creditReviews,
    sanctions,
    disbursements,
    docs: pendingDocs,
  }[activeTab];

  if (application.isLoading) {
    return (
      <Screen loading>
        <></>
      </Screen>
    );
  }

  if (application.isError || !application.data) {
    return (
      <Screen>
        <EmptyState
          title="Application not found"
          description={application.isError ? getApiErrorMessage(application.error) : 'This application may have been removed'}
        />
      </Screen>
    );
  }

  const app = application.data;

  return (
    <Screen scroll padded={false}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.headerInfo}>
            <Text style={styles.appNumber}>{str(app.applicationNumber ?? app.id)}</Text>
            <Text style={styles.product}>{str(app.productName)}</Text>
            <Text style={styles.amount}>{formatCurrency(app.requestedAmount as number)}</Text>
          </View>
          <StatusBadge status={str(app.status)} />
        </View>
        <Text style={styles.updated}>Updated {formatDateTime(app.updatedAt as string)}</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabBar}
      >
        {TABS.map((tab) => (
          <Pressable
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.tabActive]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Ionicons
              name={tab.icon}
              size={14}
              color={activeTab === tab.key ? colors.primary : colors.textMuted}
            />
            <Text style={[styles.tabLabel, activeTab === tab.key && styles.tabLabelActive]}>
              {tab.label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      <View style={styles.tabContent}>
        {activeQuery?.isLoading ? (
          <Text style={styles.muted}>Loading...</Text>
        ) : activeQuery?.isError ? (
          <Card>
            <Text style={styles.errorText}>{getApiErrorMessage(activeQuery.error)}</Text>
          </Card>
        ) : (
          <TabContent
            tab={activeTab}
            timeline={timeline.data?.items ?? []}
            bankLogins={bankLogins.data?.items ?? []}
            creditReviews={creditReviews.data?.items ?? []}
            sanctions={sanctions.data?.items ?? []}
            disbursements={disbursements.data?.items ?? []}
            pendingDocs={pendingDocs.data?.items ?? []}
          />
        )}
      </View>
    </Screen>
  );
}

function TabContent({
  tab,
  timeline,
  bankLogins,
  creditReviews,
  sanctions,
  disbursements,
  pendingDocs,
}: {
  tab: DetailTab;
  timeline: Record<string, unknown>[];
  bankLogins: Record<string, unknown>[];
  creditReviews: Record<string, unknown>[];
  sanctions: Record<string, unknown>[];
  disbursements: Record<string, unknown>[];
  pendingDocs: Record<string, unknown>[];
}) {
  if (tab === 'timeline') {
    if (timeline.length === 0) {
      return <EmptyState title="No timeline events" description="Activity will appear as your application progresses" />;
    }
    return (
      <Card title="Application Timeline">
        {timeline.map((event) => (
          <View key={String(event.id)} style={styles.timelineRow}>
            <View style={styles.timelineDot} />
            <View style={styles.timelineContent}>
              <Text style={styles.timelineTitle}>{str(event.title)}</Text>
              {!!event.description && (
                <Text style={styles.timelineDesc}>{str(event.description)}</Text>
              )}
              <Text style={styles.timelineDate}>{formatDateTime(event.createdAt as string)}</Text>
            </View>
          </View>
        ))}
      </Card>
    );
  }

  if (tab === 'bank') {
    if (bankLogins.length === 0) {
      return <EmptyState title="No bank logins" description="Lender submissions will appear here" />;
    }
    return bankLogins.map((item) => {
      const lender = item.lender as Record<string, unknown> | undefined;
      return (
        <Card key={String(item.id)}>
          <View style={styles.itemRow}>
            <View style={styles.itemInfo}>
              <Text style={styles.itemTitle}>{str(lender?.name ?? item.lenderId)}</Text>
              <Text style={styles.itemSub}>{formatDateTime(item.createdAt as string)}</Text>
            </View>
            <StatusBadge status={str(item.status)} />
          </View>
          {!!item.notes && <Text style={styles.itemNote}>{str(item.notes)}</Text>}
        </Card>
      );
    });
  }

  if (tab === 'credit') {
    if (creditReviews.length === 0) {
      return <EmptyState title="No credit reviews" description="Credit assessment updates will show here" />;
    }
    return creditReviews.map((item) => (
      <Card key={String(item.id)}>
        <View style={styles.itemRow}>
          <View style={styles.itemInfo}>
            <Text style={styles.itemTitle}>Decision: {str(item.decision)}</Text>
            <Text style={styles.itemSub}>{formatDateTime(item.createdAt as string)}</Text>
          </View>
          {!!item.decision && <StatusBadge status={str(item.decision)} />}
        </View>
        {!!item.reviewNotes && <Text style={styles.itemNote}>{str(item.reviewNotes)}</Text>}
        {item.creditScore != null && (
          <Text style={styles.itemMeta}>Credit Score: {str(item.creditScore)}</Text>
        )}
      </Card>
    ));
  }

  if (tab === 'sanctions') {
    if (sanctions.length === 0) {
      return <EmptyState title="No sanctions yet" description="Sanction letters will appear once approved" />;
    }
    return sanctions.map((item) => (
      <Card key={String(item.id)}>
        <View style={styles.itemRow}>
          <View style={styles.itemInfo}>
            <Text style={styles.itemTitle}>{formatCurrency(item.sanctionAmount as number)}</Text>
            <Text style={styles.itemSub}>{formatDateTime(item.createdAt as string)}</Text>
          </View>
          <StatusBadge status={str(item.status)} />
        </View>
        {!!item.conditions && <Text style={styles.itemNote}>{str(item.conditions)}</Text>}
        {item.interestRate != null && (
          <Text style={styles.itemMeta}>Rate: {str(item.interestRate)}% · Tenure: {str(item.tenureMonths)} mo</Text>
        )}
      </Card>
    ));
  }

  if (tab === 'disbursements') {
    if (disbursements.length === 0) {
      return <EmptyState title="No disbursements" description="Funds transfer details will appear here" />;
    }
    return disbursements.map((item) => (
      <Card key={String(item.id)}>
        <View style={styles.itemRow}>
          <View style={styles.itemInfo}>
            <Text style={styles.itemTitle}>{formatCurrency(item.disbursementAmount as number)}</Text>
            <Text style={styles.itemSub}>{formatDateTime(item.createdAt as string)}</Text>
          </View>
          <StatusBadge status={str(item.status)} />
        </View>
        {!!item.bankReference && (
          <Text style={styles.itemNote}>Ref: {str(item.bankReference)}</Text>
        )}
        {!!item.disbursementMode && (
          <Text style={styles.itemMeta}>Mode: {str(item.disbursementMode)}</Text>
        )}
      </Card>
    ));
  }

  if (pendingDocs.length === 0) {
    return <EmptyState title="No pending documents" description="All required documents have been submitted" />;
  }

  return pendingDocs.map((item) => {
    const docType = item.documentType as Record<string, unknown> | undefined;
    return (
      <Card key={String(item.id)}>
        <View style={styles.itemRow}>
          <View style={styles.itemInfo}>
            <Text style={styles.itemTitle}>{str(docType?.name ?? item.documentTypeId)}</Text>
            <Text style={styles.itemSub}>{formatDateTime(item.createdAt as string)}</Text>
          </View>
          <StatusBadge status={str(item.status)} />
        </View>
        {!!item.notes && <Text style={styles.itemNote}>{str(item.notes)}</Text>}
        {!!item.dueDate && (
          <Text style={styles.itemMeta}>Due: {formatDateTime(item.dueDate as string)}</Text>
        )}
      </Card>
    );
  });
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  headerInfo: { flex: 1, marginRight: spacing.md },
  appNumber: { ...typography.h2, color: colors.text, fontSize: 20 },
  product: { ...typography.bodySm, color: colors.textMuted, marginTop: 2 },
  amount: { ...typography.h3, color: colors.primary, marginTop: spacing.sm },
  updated: { ...typography.bodySm, color: colors.textMuted, marginTop: spacing.sm, fontSize: 11 },
  tabBar: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tabActive: { backgroundColor: 'rgba(34,211,166,0.12)', borderColor: colors.primary },
  tabLabel: { ...typography.bodySm, color: colors.textMuted, fontSize: 12 },
  tabLabelActive: { color: colors.primary, fontWeight: '600' },
  tabContent: { paddingHorizontal: spacing.md, paddingTop: spacing.sm },
  muted: { ...typography.bodySm, color: colors.textMuted, textAlign: 'center', paddingVertical: spacing.xl },
  errorText: { ...typography.bodySm, color: colors.danger },
  timelineRow: { flexDirection: 'row', gap: spacing.md, paddingVertical: spacing.sm },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
    marginTop: 6,
  },
  timelineContent: { flex: 1, borderBottomWidth: 1, borderBottomColor: colors.border, paddingBottom: spacing.sm },
  timelineTitle: { ...typography.label, color: colors.text },
  timelineDesc: { ...typography.bodySm, color: colors.textMuted, marginTop: 2 },
  timelineDate: { ...typography.bodySm, color: colors.textMuted, marginTop: 4, fontSize: 10 },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  itemInfo: { flex: 1, marginRight: spacing.sm },
  itemTitle: { ...typography.label, color: colors.text },
  itemSub: { ...typography.bodySm, color: colors.textMuted, marginTop: 2, fontSize: 11 },
  itemNote: { ...typography.bodySm, color: colors.textSecondary, marginTop: spacing.sm },
  itemMeta: { ...typography.bodySm, color: colors.primary, marginTop: spacing.xs, fontSize: 11 },
});
