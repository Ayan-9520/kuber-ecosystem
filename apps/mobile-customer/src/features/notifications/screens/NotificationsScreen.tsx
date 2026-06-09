import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
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
import { notificationsService } from '@/services';
import { colors, radius, spacing, typography } from '@/theme';

function isUnread(notification: Record<string, unknown>): boolean {
  if (notification.readAt) return false;
  const status = String(notification.status ?? '').toUpperCase();
  return status !== 'READ';
}

export function NotificationsScreen() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);

  const notifications = useQuery({
    queryKey: ['notifications', user?.id],
    queryFn: () =>
      notificationsService.list({
        userId: user?.id,
        limit: 50,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      }),
    enabled: !!user?.id,
  });

  const communicationLogs = useQuery({
    queryKey: ['communication-logs', user?.id],
    queryFn: () =>
      notificationsService.communicationLogs({
        recipientUserId: user?.id,
        limit: 30,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      }),
    enabled: !!user?.id,
  });

  const markRead = useMutation({
    mutationFn: (id: string) => notificationsService.markRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'notifications'] });
    },
  });

  const markAllRead = useMutation({
    mutationFn: () => notificationsService.markAllRead(user!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'notifications'] });
    },
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([notifications.refetch(), communicationLogs.refetch()]);
    setRefreshing(false);
  }, [notifications, communicationLogs]);

  const unreadCount =
    notifications.data?.items.filter(isUnread).length ?? 0;

  const handlePress = (item: Record<string, unknown>) => {
    if (!isUnread(item)) return;
    markRead.mutate(String(item.id));
  };

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
      {unreadCount > 0 && (
        <View style={styles.actions}>
          <Button
            title={`Mark all read (${unreadCount})`}
            variant="secondary"
            onPress={() => markAllRead.mutate()}
            loading={markAllRead.isPending}
            icon={<Ionicons name="checkmark-done" size={18} color={colors.text} />}
          />
        </View>
      )}

      <Card title="Inbox" subtitle="Tap unread alerts to mark as read">
        {notifications.isLoading ? (
          <Text style={styles.muted}>Loading notifications...</Text>
        ) : (notifications.data?.items.length ?? 0) === 0 ? (
          <EmptyState
            title="All caught up"
            description="You have no notifications right now"
          />
        ) : (
          notifications.data?.items.map((item) => {
            const unread = isUnread(item);
            return (
              <Pressable
                key={String(item.id)}
                onPress={() => handlePress(item)}
                style={({ pressed }) => [
                  styles.notificationRow,
                  unread && styles.unreadRow,
                  pressed && styles.pressed,
                ]}
              >
                <View style={[styles.iconWrap, unread && styles.iconWrapUnread]}>
                  <Ionicons
                    name={unread ? 'mail-unread' : 'mail-open'}
                    size={18}
                    color={unread ? colors.primary : colors.textMuted}
                  />
                </View>
                <View style={styles.notificationBody}>
                  <View style={styles.notificationHeader}>
                    <Text style={[styles.title, unread && styles.titleUnread]} numberOfLines={1}>
                      {str(item.title)}
                    </Text>
                    {unread && <View style={styles.dot} />}
                  </View>
                  <Text style={styles.message} numberOfLines={2}>
                    {str(item.message ?? item.body)}
                  </Text>
                  <View style={styles.metaRow}>
                    <StatusBadge status={str(item.eventType ?? item.channel)} />
                    <Text style={styles.time}>{formatDateTime(item.createdAt as string)}</Text>
                  </View>
                </View>
              </Pressable>
            );
          })
        )}
        {notifications.isError && (
          <Text style={styles.error}>{getApiErrorMessage(notifications.error)}</Text>
        )}
      </Card>

      <Card title="Communication History" subtitle="SMS, email, push & in-app delivery logs">
        {communicationLogs.isLoading ? (
          <Text style={styles.muted}>Loading history...</Text>
        ) : (communicationLogs.data?.items.length ?? 0) === 0 ? (
          <EmptyState
            title="No communication logs"
            description="Outbound messages to your account will appear here"
          />
        ) : (
          communicationLogs.data?.items.map((log) => (
            <View key={String(log.id)} style={styles.logRow}>
              <View style={styles.logHeader}>
                <Text style={styles.logChannel}>{str(log.channel)}</Text>
                <StatusBadge status={str(log.status)} />
              </View>
              <Text style={styles.logEvent}>{str(log.eventType)}</Text>
              {!!str(log.subject ?? log.body) && str(log.subject ?? log.body) !== '—' && (
                <Text style={styles.logBody} numberOfLines={2}>
                  {str(log.subject ?? log.body)}
                </Text>
              )}
              <Text style={styles.time}>
                {formatDateTime((log.sentAt ?? log.createdAt) as string)}
              </Text>
            </View>
          ))
        )}
        {communicationLogs.isError && (
          <Text style={styles.error}>{getApiErrorMessage(communicationLogs.error)}</Text>
        )}
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  actions: { marginBottom: spacing.md },
  notificationRow: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  unreadRow: { backgroundColor: 'rgba(34,211,166,0.04)', marginHorizontal: -spacing.sm, paddingHorizontal: spacing.sm, borderRadius: radius.sm },
  pressed: { opacity: 0.85 },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapUnread: { backgroundColor: 'rgba(34,211,166,0.12)' },
  notificationBody: { flex: 1 },
  notificationHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  title: { ...typography.label, color: colors.textSecondary, flex: 1 },
  titleUnread: { color: colors.text },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary },
  message: { ...typography.bodySm, color: colors.textMuted, marginTop: 4 },
  metaRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: spacing.sm },
  time: { ...typography.bodySm, color: colors.textMuted, fontSize: 11 },
  logRow: {
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  logHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  logChannel: { ...typography.label, color: colors.text },
  logEvent: { ...typography.caption, color: colors.primary, marginTop: 4, textTransform: 'none' },
  logBody: { ...typography.bodySm, color: colors.textMuted, marginTop: 4 },
  muted: { ...typography.bodySm, color: colors.textMuted },
  error: { ...typography.bodySm, color: colors.danger, marginTop: spacing.sm },
});
