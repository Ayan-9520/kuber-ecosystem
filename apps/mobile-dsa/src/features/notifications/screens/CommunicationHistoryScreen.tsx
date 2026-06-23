import { useQuery } from '@tanstack/react-query';
import { useState, useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Card, EmptyState, ListRow, Screen } from '@/components/ui';
import { useAuth } from '@/hooks';
import { formatDateTime, str } from '@/lib/utils';
import { notificationsService } from '@/services';
import { type AppColors, useAppTheme } from '@/theme/ThemeProvider';
import { radius, spacing, typography } from '@/theme';

type Channel = 'all' | 'sms' | 'whatsapp' | 'logs';

type CommItem = Record<string, unknown> & { channel: string };

export function CommunicationHistoryScreen() {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { user, partnerId } = useAuth();
  const [channel, setChannel] = useState<Channel>('all');

  const sms = useQuery({
    queryKey: ['sms-history', user?.id],
    queryFn: () => notificationsService.sms({ userId: user?.id, limit: 30 }),
    enabled: !!user?.id && (channel === 'all' || channel === 'sms'),
  });

  const whatsapp = useQuery({
    queryKey: ['whatsapp-history', user?.id],
    queryFn: () => notificationsService.whatsapp({ userId: user?.id, limit: 30 }),
    enabled: !!user?.id && (channel === 'all' || channel === 'whatsapp'),
  });

  const logs = useQuery({
    queryKey: ['comm-logs', partnerId],
    queryFn: () =>
      notificationsService.communicationLogs({ partnerId, limit: 30, sortBy: 'createdAt', sortOrder: 'desc' }),
    enabled: !!partnerId && (channel === 'all' || channel === 'logs'),
  });

  const items: CommItem[] = [
    ...(channel === 'all' || channel === 'sms'
      ? (sms.data?.items ?? []).map((i) => ({ ...(i as Record<string, unknown>), channel: 'SMS' }))
      : []),
    ...(channel === 'all' || channel === 'whatsapp'
      ? (whatsapp.data?.items ?? []).map((i) => ({ ...(i as Record<string, unknown>), channel: 'WhatsApp' }))
      : []),
    ...(channel === 'all' || channel === 'logs'
      ? (logs.data?.items ?? []).map((i) => ({
          ...(i as Record<string, unknown>),
          channel: String((i as Record<string, unknown>).channel ?? 'LOG'),
        }))
      : []),
  ].sort(
    (a: CommItem, b: CommItem) =>
      new Date(String(b.createdAt ?? 0)).getTime() - new Date(String(a.createdAt ?? 0)).getTime(),
  );

  return (
    <Screen scroll title="Communication Timeline">
      <View style={styles.filters}>
        {(['all', 'sms', 'whatsapp', 'logs'] as Channel[]).map((c) => (
          <Pressable key={c} style={[styles.chip, channel === c && styles.chipActive]} onPress={() => setChannel(c)}>
            <Text style={[styles.chipText, channel === c && styles.chipTextActive]}>{c.toUpperCase()}</Text>
          </Pressable>
        ))}
      </View>

      <Card>
        {items.length === 0 ? (
          <EmptyState title="No communications" description="SMS, WhatsApp and system messages appear here" />
        ) : (
          items.map((item, idx) => (
            <ListRow
              key={`${item.channel}-${String(item.id ?? idx)}`}
              title={str(item.subject ?? item.eventType ?? String(item.body ?? '').slice(0, 60))}
              subtitle={`${item.channel} · ${formatDateTime(item.createdAt as string)}`}
              status={str(item.status ?? item.deliveryStatus)}
              icon="chatbubble"
            />
          ))
        )}
      </Card>
    </Screen>
  );
}

function createStyles(colors: AppColors) {
  return StyleSheet.create({
  filters: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginBottom: spacing.md },
  chip: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: radius.full, borderWidth: 1, borderColor: colors.border },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { ...typography.caption, color: colors.textMuted },
  chipTextActive: { color: colors.background, fontWeight: '700' },
});
}
