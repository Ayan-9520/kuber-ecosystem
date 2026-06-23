import { Ionicons } from '@expo/vector-icons';
import { type RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { type NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Button, Card, EmptyState, Screen, StatusBadge } from '@/components/ui';
import { formatCurrency, formatDateTime, getApiErrorMessage, str } from '@/lib/utils';
import type { LeadsStackParamList } from '@/navigation/types';
import { leadsService } from '@/services';
import { radius, spacing, typography } from '@/theme';
import { type AppColors, useAppTheme } from '@/theme/ThemeProvider';

type Route = RouteProp<LeadsStackParamList, 'LeadDetail'>;
type Tab = 'timeline' | 'score' | 'notes' | 'activities';

function createStyles(colors: AppColors) {
  return StyleSheet.create({
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.md },
    name: { ...typography.h3, color: colors.text },
    sub: { ...typography.caption, color: colors.textMuted, marginTop: 4 },
    meta: { gap: 4, marginBottom: spacing.md },
    metaItem: { ...typography.bodySm, color: colors.textSecondary },
    tabs: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginVertical: spacing.md },
    tab: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs,
      borderRadius: radius.md,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    tabActive: { backgroundColor: `${colors.primary}1F`, borderColor: colors.primary },
    tabText: { ...typography.caption, color: colors.textMuted, textTransform: 'capitalize' },
    tabTextActive: { color: colors.primary, fontWeight: '700' },
    entry: {
      flexDirection: 'row',
      gap: spacing.sm,
      paddingVertical: spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    entryBody: { flex: 1 },
    entryTitle: { ...typography.bodySm, color: colors.text, fontWeight: '600' },
    entrySub: { ...typography.caption, color: colors.textMuted },
    entryDesc: { ...typography.bodySm, color: colors.textSecondary, marginTop: 2 },
    muted: { color: colors.textMuted },
  });
}

export function LeadDetailScreen() {
  const { params } = useRoute<Route>();
  const navigation = useNavigation<NativeStackNavigationProp<LeadsStackParamList>>();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<Tab>('timeline');
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

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

  const qualifyMutation = useMutation({
    mutationFn: () => leadsService.update(params.id, { status: 'QUALIFIED' }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['lead', params.id] });
      await queryClient.invalidateQueries({ queryKey: ['leads'] });
    },
  });

  const activeData = { timeline, score: scores, notes, activities }[tab];

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
            <Text style={styles.name}>{str(data.fullName ?? data.prospectName ?? data.name)}</Text>
            <Text style={styles.sub}>{str(data.leadNumber)} · {str(data.phone ?? data.prospectPhone)}</Text>
          </View>
          <StatusBadge status={str(data.status)} />
        </View>
        <View style={styles.meta}>
          <Text style={styles.metaItem}>Product: {str(data.productName)}</Text>
          <Text style={styles.metaItem}>Amount: {formatCurrency((data.loanAmount ?? data.requestedAmount) as number)}</Text>
          <Text style={styles.metaItem}>Grade: {str(data.grade ?? data.gradeAlias ?? data.score)}</Text>
          <Text style={styles.metaItem}>Priority: {str(data.priority)}</Text>
          <Text style={styles.metaItem}>Source: {str(data.sourceName)}</Text>
          <Text style={styles.metaItem}>Updated: {formatDateTime(data.updatedAt as string)}</Text>
        </View>
        <View style={{ gap: spacing.sm }}>
          {data.status !== 'QUALIFIED' && data.status !== 'LOST' ? (
            <Button
              title="Mark Qualified"
              loading={qualifyMutation.isPending}
              onPress={() => qualifyMutation.mutate()}
            />
          ) : null}
          <Button title="Edit Lead" variant="secondary" onPress={() => navigation.navigate('EditLead', { id: params.id })} />
        </View>
        {qualifyMutation.isError ? (
          <Text style={styles.muted}>{getApiErrorMessage(qualifyMutation.error)}</Text>
        ) : null}
      </Card>

      <View style={styles.tabs}>
        {(['timeline', 'score', 'notes', 'activities'] as Tab[]).map((t) => (
          <Pressable key={t} style={[styles.tab, tab === t && styles.tabActive]} onPress={() => setTab(t)}>
            <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>{t}</Text>
          </Pressable>
        ))}
      </View>

      <Card title={tab.charAt(0).toUpperCase() + tab.slice(1)}>
        {activeData.isLoading ? (
          <Text style={styles.muted}>Loading...</Text>
        ) : ((activeData.data as { items?: unknown[] } | undefined)?.items?.length ?? 0) === 0 ? (
          <EmptyState title={`No ${tab} entries`} description="Activity will appear as the lead progresses" />
        ) : tab === 'timeline' ? (
          timeline.data?.items.map((item) => (
            <View key={String(item.id)} style={styles.entry}>
              <Ionicons name="time-outline" size={16} color={colors.primary} />
              <View style={styles.entryBody}>
                <Text style={styles.entryTitle}>{str(item.title ?? item.eventType)}</Text>
                <Text style={styles.entrySub}>{formatDateTime((item.occurredAt ?? item.createdAt) as string)}</Text>
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
              <Text style={styles.entrySub}>
                {str(n.authorName ?? n.createdByName ?? (n.author as { email?: string } | undefined)?.email)} · {formatDateTime(n.createdAt as string)}
              </Text>
            </View>
          ))
        ) : (
          activities.data?.items.map((a) => (
            <View key={String(a.id)} style={styles.entry}>
              <Text style={styles.entryTitle}>{str(a.title ?? a.activityType)} · {str(a.outcome ?? a.disposition)}</Text>
              {a.description ? <Text style={styles.entryDesc}>{str(a.description)}</Text> : null}
              <Text style={styles.entrySub}>{formatDateTime(a.createdAt as string)}</Text>
            </View>
          ))
        )}
      </Card>
    </Screen>
  );
}
