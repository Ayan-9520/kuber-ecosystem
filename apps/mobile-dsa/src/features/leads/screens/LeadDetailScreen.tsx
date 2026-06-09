import { Ionicons } from '@expo/vector-icons';
import { type RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { type NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Button, Card, EmptyState, Screen, StatusBadge } from '@/components/ui';
import { formatCurrency, formatDateTime, getApiErrorMessage, str } from '@/lib/utils';
import type { LeadsStackParamList } from '@/navigation/types';
import { leadsService } from '@/services';
import { recommendationsService } from '@/services/recommendations.service';
import { colors, radius, spacing, typography } from '@/theme';

type Route = RouteProp<LeadsStackParamList, 'LeadDetail'>;
type Tab = 'timeline' | 'score' | 'notes' | 'activities' | 'recommendations';

export function LeadDetailScreen() {
  const { params } = useRoute<Route>();
  const navigation = useNavigation<NativeStackNavigationProp<LeadsStackParamList>>();
  const [tab, setTab] = useState<Tab>('timeline');

  const lead = useQuery({
    queryKey: ['lead', params.id],
    queryFn: () => leadsService.getById(params.id),
  });

  const timeline = useQuery({
    queryKey: ['lead-timeline', params.id],
    queryFn: () => leadsService.timeline({ leadId: params.id, limit: 50 }),
    enabled: tab === 'timeline',
  });

  const scores = useQuery({
    queryKey: ['lead-scores', params.id],
    queryFn: () => leadsService.scores({ leadId: params.id, limit: 10 }),
    enabled: tab === 'score',
  });

  const notes = useQuery({
    queryKey: ['lead-notes', params.id],
    queryFn: () => leadsService.notes({ leadId: params.id, limit: 20 }),
    enabled: tab === 'notes',
  });

  const activities = useQuery({
    queryKey: ['lead-activities', params.id],
    queryFn: () => leadsService.activities({ leadId: params.id, limit: 20 }),
    enabled: tab === 'activities',
  });

  const recommendations = useQuery({
    queryKey: ['lead-recommendations', params.id],
    queryFn: () => recommendationsService.forLead(params.id),
    enabled: tab === 'recommendations',
  });

  const activeData = { timeline, score: scores, notes, activities, recommendations }[tab];

  if (lead.isLoading) return <Screen loading><></></Screen>;

  if (lead.isError || !lead.data) {
    return (
      <Screen>
        <EmptyState title="Lead not found" description={getApiErrorMessage(lead.error)} />
      </Screen>
    );
  }

  const data = lead.data;

  return (
    <Screen scroll>
      <Card>
        <View style={styles.header}>
          <View>
            <Text style={styles.name}>{str(data.prospectName)}</Text>
            <Text style={styles.sub}>{str(data.leadNumber)} · {str(data.prospectPhone)}</Text>
          </View>
          <StatusBadge status={str(data.status)} />
        </View>
        <View style={styles.meta}>
          <Text style={styles.metaItem}>Amount: {formatCurrency(data.requestedAmount as number)}</Text>
          <Text style={styles.metaItem}>Grade: {str(data.grade ?? data.score)}</Text>
          <Text style={styles.metaItem}>Priority: {str(data.priority)}</Text>
          <Text style={styles.metaItem}>Updated: {formatDateTime(data.updatedAt as string)}</Text>
        </View>
        <Button title="Edit Lead" variant="secondary" onPress={() => navigation.navigate('EditLead', { id: params.id })} />
      </Card>

      <View style={styles.tabs}>
        {(['timeline', 'score', 'recommendations', 'notes', 'activities'] as Tab[]).map((t) => (
          <Pressable key={t} style={[styles.tab, tab === t && styles.tabActive]} onPress={() => setTab(t)}>
            <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>{t}</Text>
          </Pressable>
        ))}
      </View>

      <Card title={tab.charAt(0).toUpperCase() + tab.slice(1)}>
        {activeData.isLoading ? (
          <Text style={styles.muted}>Loading...</Text>
        ) : tab === 'recommendations' ? (
          recommendations.data ? (
            <View>
              <Text style={styles.entryTitle}>
                Approval {String((recommendations.data as { approvalProbability?: number }).approvalProbability ?? '—')}%
              </Text>
              {((recommendations.data as { lenders?: Array<{ lenderName: string; reason: string }> }).lenders ?? []).slice(0, 3).map((l) => (
                <View key={l.lenderName} style={styles.entry}>
                  <Text style={styles.entryTitle}>{l.lenderName}</Text>
                  <Text style={styles.entryDesc}>{l.reason}</Text>
                </View>
              ))}
              {((recommendations.data as { actions?: Array<{ title: string; description: string }> }).actions ?? []).slice(0, 3).map((a) => (
                <View key={a.title} style={styles.entry}>
                  <Text style={styles.entryTitle}>{a.title}</Text>
                  <Text style={styles.entryDesc}>{a.description}</Text>
                </View>
              ))}
            </View>
          ) : (
            <EmptyState title="No recommendations" description="Tap recommendations tab to load" />
          )
        ) : ((activeData.data as { items?: unknown[] } | undefined)?.items?.length ?? 0) === 0 ? (
          <EmptyState title={`No ${tab} entries`} description="Activity will appear as the lead progresses" />
        ) : tab === 'timeline' ? (
          timeline.data?.items.map((item) => (
            <View key={String(item.id)} style={styles.entry}>
              <Ionicons name="time-outline" size={16} color={colors.primary} />
              <View style={styles.entryBody}>
                <Text style={styles.entryTitle}>{str(item.eventType ?? item.title)}</Text>
                <Text style={styles.entrySub}>{formatDateTime(item.createdAt as string)}</Text>
                {item.description ? <Text style={styles.entryDesc}>{str(item.description)}</Text> : null}
              </View>
            </View>
          ))
        ) : tab === 'score' ? (
          scores.data?.items.map((s) => (
            <View key={String(s.id)} style={styles.entry}>
              <Text style={styles.entryTitle}>Score: {str(s.score ?? s.totalScore)}</Text>
              <Text style={styles.entrySub}>{formatDateTime(s.createdAt as string)}</Text>
            </View>
          ))
        ) : tab === 'notes' ? (
          notes.data?.items.map((n) => (
            <View key={String(n.id)} style={styles.entry}>
              <Text style={styles.entryDesc}>{str(n.content ?? n.note)}</Text>
              <Text style={styles.entrySub}>{formatDateTime(n.createdAt as string)}</Text>
            </View>
          ))
        ) : (
          activities.data?.items.map((a) => (
            <View key={String(a.id)} style={styles.entry}>
              <Text style={styles.entryTitle}>{str(a.activityType)} · {str(a.disposition)}</Text>
              <Text style={styles.entrySub}>{formatDateTime(a.createdAt as string)}</Text>
            </View>
          ))
        )}
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.md },
  name: { ...typography.h3, color: colors.text },
  sub: { ...typography.caption, color: colors.textMuted, marginTop: 4 },
  meta: { gap: 4, marginBottom: spacing.md },
  metaItem: { ...typography.bodySm, color: colors.textSecondary },
  tabs: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginVertical: spacing.md },
  tab: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: radius.md, backgroundColor: colors.surface },
  tabActive: { backgroundColor: colors.primary },
  tabText: { ...typography.caption, color: colors.textMuted, textTransform: 'capitalize' },
  tabTextActive: { color: colors.background, fontWeight: '700' },
  entry: { flexDirection: 'row', gap: spacing.sm, paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  entryBody: { flex: 1 },
  entryTitle: { ...typography.bodySm, color: colors.text, fontWeight: '600' },
  entrySub: { ...typography.caption, color: colors.textMuted },
  entryDesc: { ...typography.bodySm, color: colors.textSecondary, marginTop: 2 },
  muted: { color: colors.textMuted },
});
