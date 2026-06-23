import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { type NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import { useCallback, useState, useMemo } from 'react';
import { RefreshControl, StyleSheet, Text, View } from 'react-native';

import { Button, Card, EmptyState, ListRow, Screen } from '@/components/ui';
import { useAuth } from '@/hooks';
import { formatDateTime, getApiErrorMessage, str } from '@/lib/utils';
import type { ProfileStackParamList } from '@/navigation/types';
import { supportService } from '@/services';
import { type AppColors, useAppTheme } from '@/theme/ThemeProvider';
import { typography } from '@/theme';

export function SupportScreen() {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const navigation = useNavigation<NativeStackNavigationProp<ProfileStackParamList>>();
  const { partnerId } = useAuth();
  const [refreshing, setRefreshing] = useState(false);

  const tickets = useQuery({
    queryKey: ['support-tickets', partnerId],
    queryFn: () =>
      supportService.tickets({ partnerId, limit: 50, sortBy: 'createdAt', sortOrder: 'desc' }),
    enabled: !!partnerId,
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await tickets.refetch();
    setRefreshing(false);
  }, [tickets]);

  const items = tickets.data?.items ?? [];
  const openCount = items.filter((t) => !['CLOSED', 'RESOLVED', 'REJECTED'].includes(String(t.status))).length;

  return (
    <Screen
      scroll
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
      }
    >
      <Card title="Partner Support" subtitle="Commission, KYC, leads & technical help">
        <View style={styles.statsRow}>
          <View style={styles.stat}><Text style={styles.statValue}>{openCount}</Text><Text style={styles.statLabel}>Open</Text></View>
          <View style={styles.stat}><Text style={styles.statValue}>{items.length - openCount}</Text><Text style={styles.statLabel}>Closed</Text></View>
          <View style={styles.stat}><Text style={styles.statValue}>{tickets.data?.meta.total ?? 0}</Text><Text style={styles.statLabel}>Total</Text></View>
        </View>
      </Card>
      <Button
        title="Create Ticket"
        fullWidth
        onPress={() => navigation.navigate('CreateTicket')}
        icon={<Ionicons name="add-circle" size={20} color={colors.background} />}
      />

      <Card title="Your Tickets" subtitle={`${tickets.data?.meta.total ?? 0} total`}>
        {tickets.isLoading ? (
          <Text style={styles.muted}>Loading...</Text>
        ) : tickets.isError ? (
          <EmptyState title="Failed to load tickets" description={getApiErrorMessage(tickets.error)} />
        ) : (tickets.data?.items.length ?? 0) === 0 ? (
          <EmptyState title="No tickets" description="Create a ticket for help with leads, commissions or KYC" />
        ) : (
          tickets.data?.items.map((t) => (
            <ListRow
              key={String(t.id)}
              title={str(t.subject)}
              subtitle={formatDateTime(t.updatedAt as string)}
              status={str(t.status)}
              icon="ticket"
              onPress={() => navigation.navigate('TicketDetail', { id: String(t.id) })}
            />
          ))
        )}
      </Card>
    </Screen>
  );
}

function createStyles(colors: AppColors) {
  return StyleSheet.create({
  statsRow: { flexDirection: 'row', justifyContent: 'space-around' },
  stat: { alignItems: 'center' },
  statValue: { ...typography.h2, color: colors.primary },
  statLabel: { ...typography.caption, color: colors.textMuted },
  muted: { color: colors.textMuted },
});
}
