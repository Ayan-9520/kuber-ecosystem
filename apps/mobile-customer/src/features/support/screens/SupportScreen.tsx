import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { type NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import { useCallback, useState } from 'react';
import {
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Button, Card, EmptyState, Screen, StatusBadge } from '@/components/ui';
import { useAuth } from '@/hooks';
import { formatDateTime, getApiErrorMessage, str } from '@/lib/utils';
import type { SupportStackParamList } from '@/navigation/types';
import { supportService } from '@/services';
import { colors, radius, spacing, typography } from '@/theme';

export function SupportScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<SupportStackParamList>>();
  const { customerId } = useAuth();
  const [refreshing, setRefreshing] = useState(false);

  const tickets = useQuery({
    queryKey: ['support', 'tickets', customerId],
    queryFn: () =>
      supportService.tickets({
        customerId,
        limit: 50,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      }),
    enabled: !!customerId,
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await tickets.refetch();
    setRefreshing(false);
  }, [tickets]);

  const items = tickets.data?.items ?? [];
  const openCount = items.filter((t) => !['CLOSED', 'RESOLVED', 'REJECTED'].includes(String(t.status))).length;
  const closedCount = items.length - openCount;

  return (
    <Screen
      scroll
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={colors.primary}
          colors={[colors.primary]}
        />
      }
    >
      <Card title="Support Overview" subtitle="Kuber Finserve Help Center">
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{openCount}</Text>
            <Text style={styles.statLabel}>Open</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{closedCount}</Text>
            <Text style={styles.statLabel}>Closed</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{tickets.data?.meta.total ?? 0}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
        </View>
      </Card>

      <Button
        title="Create New Ticket"
        fullWidth
        onPress={() => navigation.navigate('CreateTicket')}
        icon={<Ionicons name="add-circle" size={20} color={colors.background} />}
      />

      <Card
        title="Your Tickets"
        subtitle={`${tickets.data?.meta.total ?? 0} total`}
        style={styles.ticketCard}
      >
        {!customerId ? (
          <EmptyState
            title="Profile incomplete"
            description="Complete your profile to access support tickets"
          />
        ) : tickets.isLoading ? (
          <Text style={styles.muted}>Loading tickets...</Text>
        ) : (tickets.data?.items.length ?? 0) === 0 ? (
          <EmptyState
            title="No support tickets"
            description="Need help? Create a ticket and our team will respond shortly."
            action={
              <Button
                title="Get Help"
                variant="secondary"
                onPress={() => navigation.navigate('CreateTicket')}
              />
            }
          />
        ) : (
          tickets.data?.items.map((ticket) => (
            <Pressable
              key={String(ticket.id)}
              onPress={() => navigation.navigate('TicketDetail', { id: String(ticket.id) })}
              style={({ pressed }) => [styles.ticketRow, pressed && styles.pressed]}
            >
              <View style={styles.ticketIcon}>
                <Ionicons name="chatbubbles-outline" size={20} color={colors.primary} />
              </View>
              <View style={styles.ticketBody}>
                <Text style={styles.ticketSubject} numberOfLines={1}>
                  {str(ticket.subject)}
                </Text>
                <Text style={styles.ticketMeta} numberOfLines={1}>
                  #{str(ticket.ticketNumber ?? ticket.id)} · {str(ticket.categoryName ?? (ticket.category as Record<string, unknown> | undefined)?.name)}
                </Text>
                <View style={styles.ticketFooter}>
                  <StatusBadge status={str(ticket.status)} />
                  <Text style={styles.time}>{formatDateTime(ticket.updatedAt as string)}</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </Pressable>
          ))
        )}
        {tickets.isError && (
          <Text style={styles.error}>{getApiErrorMessage(tickets.error)}</Text>
        )}
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  statsRow: { flexDirection: 'row', justifyContent: 'space-around' },
  stat: { alignItems: 'center' },
  statValue: { ...typography.h2, color: colors.primary },
  statLabel: { ...typography.caption, color: colors.textMuted },
  ticketCard: { marginTop: spacing.md },
  ticketRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  pressed: { opacity: 0.88 },
  ticketIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: 'rgba(34,211,166,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ticketBody: { flex: 1 },
  ticketSubject: { ...typography.label, color: colors.text, fontSize: 15 },
  ticketMeta: { ...typography.bodySm, color: colors.textMuted, marginTop: 2 },
  ticketFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  time: { ...typography.bodySm, color: colors.textMuted, fontSize: 11 },
  muted: { ...typography.bodySm, color: colors.textMuted },
  error: { ...typography.bodySm, color: colors.danger, marginTop: spacing.sm },
});
