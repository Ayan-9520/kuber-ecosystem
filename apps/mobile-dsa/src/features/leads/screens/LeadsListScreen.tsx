import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { type NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import { useCallback, useState, useMemo } from 'react';
import { Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';

import { Button, Card, EmptyState, ListRow, PageHero, Screen } from '@/components/ui';
import { useAuth, useResponsiveLayout } from '@/hooks';
import { formatCurrency, getApiErrorMessage, str } from '@/lib/utils';
import type { LeadsStackParamList } from '@/navigation/types';
import { leadsService } from '@/services';
import { type AppColors, useAppTheme } from '@/theme/ThemeProvider';
import { spacing } from '@/theme';

export function LeadsListScreen() {
  const { colors } = useAppTheme();
  const { isDesktop, pagePad } = useResponsiveLayout();
  const styles = useMemo(() => createStyles(colors, isDesktop, pagePad), [colors, isDesktop, pagePad]);
  const navigation = useNavigation<NativeStackNavigationProp<LeadsStackParamList>>();
  const { partnerId } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'ALL' | 'HOT' | 'TODAY'>('ALL');

  const leads = useQuery({
    queryKey: ['leads', partnerId, filter],
    queryFn: () => {
      const params: Record<string, unknown> = { limit: 50, sortBy: 'createdAt', sortOrder: 'desc' };
      if (filter === 'HOT') params.priority = 'HIGH';
      if (filter === 'TODAY') {
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        params.fromDate = d.toISOString();
      }
      return leadsService.list(params);
    },
    enabled: !!partnerId,
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await leads.refetch();
    setRefreshing(false);
  }, [leads]);

  return (
    <Screen
      scroll
      padded={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
      }
    >
      <PageHero
        eyebrow="Pipeline"
        title="Leads"
        subtitle="Track prospects, priorities and conversions"
        icon="people"
        actions={<Button title="+ New Lead" onPress={() => navigation.navigate('CreateLead')} />}
      />

      <View style={styles.body}>
      <View style={styles.toolbar}>
        <Pressable style={styles.analyticsBtn} onPress={() => navigation.navigate('LeadAnalytics')}>
          <Ionicons name="analytics" size={18} color={colors.primary} />
          <Text style={styles.analyticsText}>Analytics</Text>
        </Pressable>
      </View>

      <View style={styles.filters}>
        {(['ALL', 'HOT', 'TODAY'] as const).map((f) => (
          <Pressable
            key={f}
            style={[styles.chip, filter === f && styles.chipActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.chipText, filter === f && styles.chipTextActive]}>{f}</Text>
          </Pressable>
        ))}
      </View>

      <Card title="Your Leads" subtitle={`${leads.data?.meta.total ?? 0} total`}>
        {!partnerId ? (
          <EmptyState title="Partner profile missing" description="Contact support to link your partner account" />
        ) : leads.isLoading ? (
          <Text style={{ color: colors.textMuted }}>Loading...</Text>
        ) : leads.isError ? (
          <EmptyState title="Failed to load leads" description={getApiErrorMessage(leads.error)} />
        ) : (leads.data?.items.length ?? 0) === 0 ? (
          <EmptyState
            title="No leads yet"
            description="Create your first lead to start your pipeline"
            action={<Button title="Create Lead" onPress={() => navigation.navigate('CreateLead')} />}
          />
        ) : (
          leads.data?.items.map((lead) => (
            <ListRow
              key={String(lead.id)}
              title={str(lead.fullName ?? lead.prospectName ?? lead.name)}
              subtitle={`${str(lead.leadNumber)} · ${str(lead.productName ?? 'Product')} · ${formatCurrency((lead.loanAmount ?? lead.requestedAmount) as number)} · ${str(lead.grade ?? lead.gradeAlias ?? lead.score)}`}
              status={str(lead.status)}
              icon="person"
              onPress={() => navigation.navigate('LeadDetail', { id: String(lead.id) })}
            />
          ))
        )}
      </Card>
      </View>
    </Screen>
  );
}

function createStyles(colors: AppColors, isDesktop: boolean, pagePad: number) {
  return StyleSheet.create({
  body: { paddingHorizontal: isDesktop ? pagePad : 16 },
  toolbar: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', marginBottom: spacing.md },
  analyticsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: `${colors.primary}40`,
    backgroundColor: `${colors.primary}0c`,
  },
  analyticsText: { color: colors.primary, fontSize: 13, fontWeight: '700' },
  filters: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { color: colors.textMuted, fontSize: 12, fontWeight: '700' },
  chipTextActive: { color: '#FFFFFF' },
});
}
