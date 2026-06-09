import { Ionicons } from '@expo/vector-icons';
import { type RouteProp, useRoute } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Card, EmptyState, Screen, StatusBadge } from '@/components/ui';
import { formatCurrency, formatDateTime, getApiErrorMessage, str } from '@/lib/utils';
import type { ApplicationsStackParamList } from '@/navigation/types';
import { applicationsService, documentsService, recommendationsService } from '@/services';
import { colors, radius, spacing, typography } from '@/theme';

type Route = RouteProp<ApplicationsStackParamList, 'ApplicationDetail'>;
type Tab = 'timeline' | 'sanctions' | 'disbursements' | 'bank' | 'docs' | 'recommendations';

export function ApplicationDetailScreen() {
  const { params } = useRoute<Route>();
  const [tab, setTab] = useState<Tab>('timeline');

  const application = useQuery({
    queryKey: ['application', params.id],
    queryFn: () => applicationsService.getById(params.id),
  });

  const timeline = useQuery({
    queryKey: ['application-timeline', params.id],
    queryFn: () => applicationsService.timeline(params.id),
    enabled: tab === 'timeline',
  });

  const sanctions = useQuery({
    queryKey: ['application-sanctions', params.id],
    queryFn: () => applicationsService.sanctions(params.id),
    enabled: tab === 'sanctions',
  });

  const disbursements = useQuery({
    queryKey: ['application-disbursements', params.id],
    queryFn: () => applicationsService.disbursements(params.id),
    enabled: tab === 'disbursements',
  });

  const bankLogins = useQuery({
    queryKey: ['application-bank', params.id],
    queryFn: () => applicationsService.bankLogins(params.id),
    enabled: tab === 'bank',
  });

  const pendingDocs = useQuery({
    queryKey: ['application-docs', params.id],
    queryFn: () => documentsService.requests({ applicationId: params.id, status: 'PENDING', limit: 50 }),
    enabled: tab === 'docs',
  });

  const recommendations = useQuery({
    queryKey: ['application-recommendations', params.id],
    queryFn: () => recommendationsService.forApplication(params.id),
    enabled: tab === 'recommendations',
  });

  const listQuery =
    tab === 'recommendations'
      ? null
      : ({ timeline, sanctions, disbursements, bank: bankLogins, docs: pendingDocs } as const)[tab];
  const listItems = (listQuery?.data as { items?: Array<Record<string, unknown>> } | undefined)?.items ?? [];

  if (application.isLoading) return <Screen loading><></></Screen>;

  if (application.isError || !application.data) {
    return (
      <Screen>
        <EmptyState title="Application not found" description={getApiErrorMessage(application.error)} />
      </Screen>
    );
  }

  const app = application.data;

  return (
    <Screen scroll>
      <Card>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>{str(app.applicationNumber)}</Text>
            <Text style={styles.sub}>{str(app.productName)} · {formatCurrency(app.requestedAmount as number)}</Text>
          </View>
          <StatusBadge status={str(app.status)} />
        </View>
        <Text style={styles.meta}>Customer: {str(app.customerName ?? app.customerId)}</Text>
        <Text style={styles.meta}>Updated: {formatDateTime(app.updatedAt as string)}</Text>
      </Card>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabs}>
        {(['timeline', 'sanctions', 'disbursements', 'bank', 'docs', 'recommendations'] as Tab[]).map((t) => (
          <Pressable key={t} style={[styles.tab, tab === t && styles.tabActive]} onPress={() => setTab(t)}>
            <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>{t}</Text>
          </Pressable>
        ))}
      </ScrollView>

      <Card title={tab.charAt(0).toUpperCase() + tab.slice(1)}>
        {tab === 'recommendations' ? (
          recommendations.isLoading ? (
            <Text style={styles.muted}>Loading...</Text>
          ) : recommendations.data ? (
            <View>
              <Text style={styles.rowTitle}>
                Approval {String((recommendations.data as { approvalProbability?: number }).approvalProbability ?? '—')}%
              </Text>
              {((recommendations.data as { lenders?: Array<{ lenderName: string; reason: string }> }).lenders ?? []).slice(0, 3).map((l) => (
                <View key={l.lenderName} style={styles.row}>
                  <View style={styles.rowBody}>
                    <Text style={styles.rowTitle}>{l.lenderName}</Text>
                    <Text style={styles.rowSub}>{l.reason}</Text>
                  </View>
                </View>
              ))}
              {((recommendations.data as { actions?: Array<{ title: string; description: string }> }).actions ?? []).slice(0, 3).map((a) => (
                <View key={a.title} style={styles.row}>
                  <View style={styles.rowBody}>
                    <Text style={styles.rowTitle}>{a.title}</Text>
                    <Text style={styles.rowSub}>{a.description}</Text>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <EmptyState title="No recommendations" description="AI recommendations unavailable for this application" />
          )
        ) : listQuery?.isLoading ? (
          <Text style={styles.muted}>Loading...</Text>
        ) : listItems.length === 0 ? (
          <EmptyState title="No records" description={`No ${tab} data for this application`} />
        ) : (
          listItems.map((item) => (
            <View key={String(item.id)} style={styles.row}>
              <Ionicons name="ellipse" size={8} color={colors.primary} style={{ marginTop: 6 }} />
              <View style={styles.rowBody}>
                <Text style={styles.rowTitle}>
                  {str(item.eventType ?? item.status ?? item.lenderName ?? item.documentTypeName ?? item.id)}
                </Text>
                <Text style={styles.rowSub}>
                  {formatDateTime(item.createdAt as string)}
                  {item.amount ? ` · ${formatCurrency(item.amount as number)}` : ''}
                </Text>
                {item.description ? <Text style={styles.rowDesc}>{str(item.description)}</Text> : null}
              </View>
            </View>
          ))
        )}
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm },
  title: { ...typography.h3, color: colors.text },
  sub: { ...typography.caption, color: colors.textMuted, marginTop: 4 },
  meta: { ...typography.bodySm, color: colors.textSecondary },
  tabs: { marginVertical: spacing.md },
  tab: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, marginRight: spacing.xs, borderRadius: radius.md, backgroundColor: colors.surface },
  tabActive: { backgroundColor: colors.primary },
  tabText: { ...typography.caption, color: colors.textMuted, textTransform: 'capitalize' },
  tabTextActive: { color: colors.background, fontWeight: '700' },
  row: { flexDirection: 'row', gap: spacing.sm, paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  rowBody: { flex: 1 },
  rowTitle: { ...typography.bodySm, color: colors.text, fontWeight: '600' },
  rowSub: { ...typography.caption, color: colors.textMuted },
  rowDesc: { ...typography.bodySm, color: colors.textSecondary, marginTop: 2 },
  muted: { color: colors.textMuted },
});
