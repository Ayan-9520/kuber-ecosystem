import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { type NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import { useCallback, useMemo, useState } from 'react';
import { Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';

import { Button, Card, EmptyState, PageHero, Screen, SectionHeader, StatusBadge } from '@/components/ui';
import { useAuth, useResponsiveLayout } from '@/hooks';
import { formatDateTime, getApiErrorMessage, str } from '@/lib/utils';
import type { SupportStackParamList } from '@/navigation/types';
import { supportService } from '@/services';
import { type AppColors, useAppTheme } from '@/theme/ThemeProvider';
import { radius, spacing, typography } from '@/theme';

export function SupportScreen() {
  const { colors } = useAppTheme();
  const { pagePad } = useResponsiveLayout();
  const styles = useMemo(() => createStyles(colors, pagePad), [colors, pagePad]);
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
      padded={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={colors.primary}
          colors={[colors.primary]}
        />
      }
    >
      <PageHero
        eyebrow="Help center"
        title="Support"
        subtitle="Kuber Finserve help & tickets"
        icon="headset"
        actions={
          <Button
            title="New ticket"
            onPress={() => navigation.navigate('CreateTicket')}
            icon={<Ionicons name="add" size={16} color={colors.onPrimary} />}
          />
        }
      />

      <View style={styles.body}>
        <SectionHeader title="Overview" subtitle="Your support activity" eyebrow="Status" />
        <Card elevated>
          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{openCount}</Text>
              <Text style={styles.statLabel}>Open</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text style={styles.statValue}>{closedCount}</Text>
              <Text style={styles.statLabel}>Closed</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text style={styles.statValue}>{tickets.data?.meta.total ?? 0}</Text>
              <Text style={styles.statLabel}>Total</Text>
            </View>
          </View>
        </Card>

        <SectionHeader
          title="Your tickets"
          subtitle={`${tickets.data?.meta.total ?? 0} total`}
          eyebrow="Inbox"
          style={styles.sectionGap}
        />
        <Card elevated>
          {!customerId ? (
            <EmptyState
              title="Profile incomplete"
              description="Complete your profile to access support tickets"
            />
          ) : tickets.isLoading ? (
            <Text style={styles.muted}>Loading tickets...</Text>
          ) : items.length === 0 ? (
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
            items.map((ticket, idx) => (
              <Pressable
                key={String(ticket.id)}
                onPress={() => navigation.navigate('TicketDetail', { id: String(ticket.id) })}
                style={({ pressed }) => [
                  styles.ticketRow,
                  idx === items.length - 1 && styles.ticketRowLast,
                  pressed && styles.pressed,
                ]}
              >
                <View style={styles.ticketIcon}>
                  <Ionicons name="chatbubbles-outline" size={18} color={colors.primary} />
                </View>
                <View style={styles.ticketBody}>
                  <Text style={styles.ticketSubject} numberOfLines={1}>
                    {str(ticket.subject)}
                  </Text>
                  <Text style={styles.ticketMeta} numberOfLines={1}>
                    #{str(ticket.ticketNumber ?? ticket.id)} ·{' '}
                    {str(
                      ticket.categoryName ??
                        (ticket.category as Record<string, unknown> | undefined)?.name,
                    )}
                  </Text>
                  <View style={styles.ticketFooter}>
                    <StatusBadge status={str(ticket.status)} />
                    <Text style={styles.time}>{formatDateTime(ticket.updatedAt as string)}</Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
              </Pressable>
            ))
          )}
          {tickets.isError ? (
            <Text style={styles.error}>{getApiErrorMessage(tickets.error)}</Text>
          ) : null}
        </Card>
      </View>
    </Screen>
  );
}

function createStyles(colors: AppColors, pagePad: number) {
  return StyleSheet.create({
    body: { paddingHorizontal: pagePad, paddingBottom: spacing.xl, gap: spacing.md },
    sectionGap: { marginTop: spacing.sm },
    statsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around' },
    stat: { alignItems: 'center', flex: 1 },
    statDivider: { width: 1, height: 36, backgroundColor: colors.borderLight },
    statValue: { ...typography.h2, color: colors.primary, fontSize: 24, fontWeight: '800' },
    statLabel: { ...typography.caption, color: colors.textMuted, marginTop: 4 },
    ticketRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      paddingVertical: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.borderLight,
    },
    ticketRowLast: { borderBottomWidth: 0 },
    pressed: { opacity: 0.88 },
    ticketIcon: {
      width: 40,
      height: 40,
      borderRadius: radius.md,
      backgroundColor: `${colors.primary}14`,
      borderWidth: 1,
      borderColor: `${colors.primary}28`,
      alignItems: 'center',
      justifyContent: 'center',
    },
    ticketBody: { flex: 1, minWidth: 0 },
    ticketSubject: { ...typography.label, color: colors.text, fontSize: 14 },
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
}
