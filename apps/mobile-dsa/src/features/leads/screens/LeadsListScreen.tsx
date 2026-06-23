import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { type NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import { useCallback, useState } from 'react';
import { Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';

import { Button, Card, EmptyState, ListRow, Screen } from '@/components/ui';
import { useAuth } from '@/hooks';
import { formatCurrency, getApiErrorMessage, str } from '@/lib/utils';
import type { LeadsStackParamList } from '@/navigation/types';
import { leadsService } from '@/services';
import { colors, spacing } from '@/theme';

export function LeadsListScreen() {
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
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
      }
    >
      <View style={styles.toolbar}>
        <Button title="+ New Lead" onPress={() => navigation.navigate('CreateLead')} />
        <Pressable onPress={() => navigation.navigate('LeadAnalytics')}>
          <Ionicons name="analytics" size={24} color={colors.primary} />
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
    </Screen>
  );
}

const styles = StyleSheet.create({
  toolbar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  filters: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { color: colors.textMuted, fontSize: 12, fontWeight: '600' },
  chipTextActive: { color: colors.background },
});
