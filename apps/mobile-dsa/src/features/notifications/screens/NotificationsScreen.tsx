import { useNavigation } from '@react-navigation/native';
import { type NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Pressable, StyleSheet, Text } from 'react-native';

import { Button, Card, EmptyState, ListRow, Screen } from '@/components/ui';
import { useAuth } from '@/hooks';
import { formatDateTime, str } from '@/lib/utils';
import type { HomeStackParamList } from '@/navigation/types';
import { notificationsService } from '@/services';
import { colors, spacing } from '@/theme';

export function NotificationsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<HomeStackParamList>>();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const notifications = useQuery({
    queryKey: ['notifications', user?.id],
    queryFn: () =>
      notificationsService.list({ userId: user?.id, limit: 50, sortBy: 'createdAt', sortOrder: 'desc' }),
    enabled: !!user?.id,
  });

  const markAll = useMutation({
    mutationFn: () => notificationsService.markAllRead(user!.id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  return (
    <Screen scroll>
      <Button title="Mark All Read" variant="secondary" fullWidth loading={markAll.isPending} onPress={() => markAll.mutate()} />
      <Pressable onPress={() => navigation.navigate('CommunicationHistory')}>
        <Text style={styles.link}>View SMS / WhatsApp history →</Text>
      </Pressable>

      <Card title="Notifications">
        {(notifications.data?.items.length ?? 0) === 0 ? (
          <EmptyState title="No notifications" description="Alerts about leads, commissions and tickets appear here" />
        ) : (
          notifications.data?.items.map((n) => (
            <ListRow
              key={String(n.id)}
              title={str(n.title ?? n.subject)}
              subtitle={formatDateTime(n.createdAt as string)}
              status={n.isRead ? 'READ' : 'UNREAD'}
              icon="notifications"
            />
          ))
        )}
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  link: { color: colors.primary, marginBottom: spacing.md, fontWeight: '600' },
});
