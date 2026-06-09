import { Ionicons } from '@expo/vector-icons';
import { type RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { type NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { Screen, StatusBadge } from '@/components/ui';
import { formatDateTime, getApiErrorMessage, str } from '@/lib/utils';
import type { ProfileStackParamList } from '@/navigation/types';
import { supportService } from '@/services';
import { colors, radius, spacing, typography } from '@/theme';

type Tab = 'messages' | 'timeline';

export function TicketDetailScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ProfileStackParamList>>();
  const route = useRoute<RouteProp<ProfileStackParamList, 'TicketDetail'>>();
  const { id } = route.params;
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<Tab>('messages');
  const [draft, setDraft] = useState('');
  const listRef = useRef<FlatList>(null);

  const ticket = useQuery({
    queryKey: ['ticket', id],
    queryFn: () => supportService.getTicket(id),
  });

  const messages = useQuery({
    queryKey: ['ticket-messages', id],
    queryFn: () => supportService.messages({ ticketId: id, limit: 100 }),
    refetchInterval: tab === 'messages' ? 15_000 : false,
  });

  const timeline = useQuery({
    queryKey: ['ticket-timeline', id],
    queryFn: () => supportService.timeline(id, { limit: 50 }),
    enabled: tab === 'timeline',
  });

  const sendMessage = useMutation({
    mutationFn: (body: string) => supportService.sendMessage({ ticketId: id, body }),
    onSuccess: () => {
      setDraft('');
      void queryClient.invalidateQueries({ queryKey: ['ticket-messages', id] });
    },
  });

  const scrollToEnd = useCallback(() => {
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
  }, []);

  useEffect(() => {
    if (messages.data?.items.length) scrollToEnd();
  }, [messages.data?.items.length, scrollToEnd]);

  const isClosed = ['CLOSED', 'RESOLVED', 'REJECTED'].includes(String(ticket.data?.status ?? '').toUpperCase());

  if (ticket.isLoading) return <Screen loading><></></Screen>;

  return (
    <Screen scroll={false} padded={false}>
      <View style={styles.header}>
        <Text style={styles.subject}>{str(ticket.data?.subject)}</Text>
        <StatusBadge status={str(ticket.data?.status)} />
        <Text style={styles.meta}>#{str(ticket.data?.ticketNumber ?? id)}</Text>
      </View>
      <View style={styles.tabs}>
        {(['messages', 'timeline'] as Tab[]).map((key) => (
          <Pressable key={key} style={[styles.tab, tab === key && styles.tabActive]} onPress={() => setTab(key)}>
            <Text style={[styles.tabText, tab === key && styles.tabTextActive]}>{key}</Text>
          </Pressable>
        ))}
      </View>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {tab === 'messages' ? (
          <>
            <FlatList
              ref={listRef}
              data={messages.data?.items ?? []}
              keyExtractor={(item) => String(item.id)}
              contentContainerStyle={styles.messageList}
              onContentSizeChange={scrollToEnd}
              renderItem={({ item }) => {
                const isCustomer = String(item.messageType) === 'CUSTOMER';
                return (
                  <View style={[styles.bubbleRow, isCustomer && styles.bubbleRowRight]}>
                    <View style={[styles.bubble, isCustomer ? styles.bubbleUser : styles.bubbleAgent]}>
                      <Text style={[styles.bubbleText, isCustomer && styles.bubbleTextUser]}>{str(item.body)}</Text>
                      <Text style={styles.bubbleTime}>{formatDateTime(item.createdAt as string)}</Text>
                    </View>
                  </View>
                );
              }}
              ListEmptyComponent={<Text style={styles.empty}>No messages yet</Text>}
            />
            {!isClosed && (
              <View style={styles.composer}>
                <TextInput
                  style={styles.input}
                  placeholder="Type your message..."
                  placeholderTextColor={colors.textMuted}
                  value={draft}
                  onChangeText={setDraft}
                  multiline
                />
                <Pressable onPress={() => draft.trim() && sendMessage.mutate(draft.trim())} style={styles.sendBtn}>
                  <Ionicons name="send" size={18} color={colors.background} />
                </Pressable>
              </View>
            )}
            {isClosed && (
              <Pressable onPress={() => navigation.navigate('TicketFeedback', { id })} style={styles.rateBtn}>
                <Text style={styles.rateText}>Rate Support</Text>
              </Pressable>
            )}
            {sendMessage.error && <Text style={styles.error}>{getApiErrorMessage(sendMessage.error)}</Text>}
          </>
        ) : (
          <FlatList
            data={timeline.data?.items ?? []}
            keyExtractor={(item) => String(item.id)}
            contentContainerStyle={styles.messageList}
            renderItem={({ item }) => (
              <View style={styles.timelineRow}>
                <Text style={styles.timelineTitle}>{str(item.title ?? item.eventType)}</Text>
                <Text style={styles.timelineTime}>{formatDateTime(item.occurredAt as string)}</Text>
              </View>
            )}
          />
        )}
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: { padding: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border, backgroundColor: colors.card },
  subject: { ...typography.h3, color: colors.text },
  meta: { ...typography.caption, color: colors.textMuted, marginTop: spacing.xs },
  tabs: { flexDirection: 'row', backgroundColor: colors.card, borderBottomWidth: 1, borderBottomColor: colors.border },
  tab: { flex: 1, paddingVertical: spacing.md, alignItems: 'center' },
  tabActive: { borderBottomWidth: 2, borderBottomColor: colors.primary },
  tabText: { ...typography.label, color: colors.textMuted, textTransform: 'capitalize' },
  tabTextActive: { color: colors.primary },
  messageList: { padding: spacing.md, flexGrow: 1 },
  bubbleRow: { marginBottom: spacing.sm, alignItems: 'flex-start' },
  bubbleRowRight: { alignItems: 'flex-end' },
  bubble: { maxWidth: '85%', padding: spacing.md, borderRadius: radius.lg },
  bubbleUser: { backgroundColor: colors.primary },
  bubbleAgent: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  bubbleText: { ...typography.body, color: colors.text },
  bubbleTextUser: { color: colors.background },
  bubbleTime: { ...typography.caption, color: colors.textMuted, marginTop: 4 },
  composer: { flexDirection: 'row', gap: spacing.sm, padding: spacing.md, borderTopWidth: 1, borderTopColor: colors.border },
  input: {
    flex: 1,
    minHeight: 44,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    color: colors.text,
  },
  sendBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  rateBtn: { padding: spacing.md, alignItems: 'center' },
  rateText: { ...typography.label, color: colors.primary },
  error: { color: colors.danger, textAlign: 'center', padding: spacing.sm },
  empty: { ...typography.bodySm, color: colors.textMuted, textAlign: 'center', padding: spacing.xl },
  timelineRow: { marginBottom: spacing.md, paddingBottom: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  timelineTitle: { ...typography.label, color: colors.text },
  timelineTime: { ...typography.caption, color: colors.textMuted, marginTop: 4 },
});
