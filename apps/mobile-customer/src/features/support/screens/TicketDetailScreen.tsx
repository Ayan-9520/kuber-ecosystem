import { Ionicons } from '@expo/vector-icons';
import { type RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { type NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useRef, useState, useMemo } from 'react';
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
import type { SupportStackParamList } from '@/navigation/types';
import { supportService } from '@/services';
import { type AppColors, useAppTheme } from '@/theme/ThemeProvider';
import { radius, spacing, typography } from '@/theme';

type Tab = 'messages' | 'timeline';

function MessageBubble({ message }: { message: Record<string, unknown> }) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const isCustomer = String(message.messageType) === 'CUSTOMER';
  const isSystem = String(message.messageType) === 'SYSTEM';

  return (
    <View style={[styles.bubbleRow, isCustomer && styles.bubbleRowRight]}>
      <View
        style={[
          styles.bubble,
          isCustomer ? styles.bubbleUser : isSystem ? styles.bubbleSystem : styles.bubbleAgent,
        ]}
      >
        {!isCustomer && (
          <Text style={styles.bubbleSender}>{str(message.messageType)}</Text>
        )}
        <Text style={[styles.bubbleText, isCustomer && styles.bubbleTextUser]}>
          {str(message.body)}
        </Text>
        <Text style={[styles.bubbleTime, isCustomer && styles.bubbleTimeUser]}>
          {formatDateTime(message.createdAt as string)}
        </Text>
      </View>
    </View>
  );
}

function TimelineItem({ event }: { event: Record<string, unknown> }) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const iconMap: Record<string, keyof typeof Ionicons.glyphMap> = {
    MESSAGE: 'chatbubble',
    ASSIGNMENT: 'person-add',
    ESCALATION: 'arrow-up-circle',
    RESOLUTION: 'checkmark-circle',
  };
  const eventType = String(event.eventType ?? 'EVENT');
  const icon = iconMap[eventType] ?? 'ellipse';

  return (
    <View style={styles.timelineItem}>
      <View style={styles.timelineIcon}>
        <Ionicons name={icon} size={16} color={colors.primary} />
      </View>
      <View style={styles.timelineBody}>
        <Text style={styles.timelineTitle}>{str(event.title ?? event.eventType)}</Text>
        {!!event.description && (
          <Text style={styles.timelineDesc} numberOfLines={3}>
            {str(event.description)}
          </Text>
        )}
        <Text style={styles.timelineTime}>{formatDateTime(event.occurredAt as string)}</Text>
      </View>
    </View>
  );
}

export function TicketDetailScreen() {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const navigation = useNavigation<NativeStackNavigationProp<SupportStackParamList>>();
  const route = useRoute<RouteProp<SupportStackParamList, 'TicketDetail'>>();
  const { id } = route.params;
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<Tab>('messages');
  const [draft, setDraft] = useState('');
  const listRef = useRef<FlatList>(null);

  const ticket = useQuery({
    queryKey: ['support', 'ticket', id],
    queryFn: () => supportService.getTicket(id),
  });

  const messages = useQuery({
    queryKey: ['support', 'messages', id],
    queryFn: () => supportService.messages(id),
    refetchInterval: tab === 'messages' ? 15_000 : false,
  });

  const timeline = useQuery({
    queryKey: ['support', 'timeline', id],
    queryFn: () => supportService.timeline(id),
    enabled: tab === 'timeline',
  });

  const sendMessage = useMutation({
    mutationFn: (body: string) => supportService.sendMessage({ ticketId: id, body }),
    onSuccess: () => {
      setDraft('');
      queryClient.invalidateQueries({ queryKey: ['support', 'messages', id] });
      queryClient.invalidateQueries({ queryKey: ['support', 'timeline', id] });
      queryClient.invalidateQueries({ queryKey: ['support', 'ticket', id] });
    },
  });

  const scrollToEnd = useCallback(() => {
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
  }, []);

  useEffect(() => {
    if (messages.data?.items.length) scrollToEnd();
  }, [messages.data?.items.length, scrollToEnd]);

  const handleSend = () => {
    const body = draft.trim();
    if (!body || sendMessage.isPending) return;
    sendMessage.mutate(body);
  };

  const isClosed = ['CLOSED', 'RESOLVED', 'REJECTED'].includes(
    String(ticket.data?.status ?? '').toUpperCase(),
  );

  return (
    <Screen scroll={false} padded={false} loading={ticket.isLoading}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.subject} numberOfLines={2}>
            {str(ticket.data?.subject)}
          </Text>
          <StatusBadge status={str(ticket.data?.status)} />
        </View>
        <Text style={styles.ticketMeta}>
          #{str(ticket.data?.ticketNumber ?? id)} · {str(ticket.data?.categoryName)}
        </Text>
      </View>

      <View style={styles.tabs}>
        <Pressable
          onPress={() => setTab('messages')}
          style={[styles.tab, tab === 'messages' && styles.tabActive]}
        >
          <Text style={[styles.tabText, tab === 'messages' && styles.tabTextActive]}>Messages</Text>
        </Pressable>
        <Pressable
          onPress={() => setTab('timeline')}
          style={[styles.tab, tab === 'timeline' && styles.tabActive]}
        >
          <Text style={[styles.tabText, tab === 'timeline' && styles.tabTextActive]}>Timeline</Text>
        </Pressable>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {tab === 'messages' ? (
          <>
            <FlatList
              ref={listRef}
              data={messages.data?.items ?? []}
              keyExtractor={(item) => String(item.id)}
              renderItem={({ item }) => <MessageBubble message={item} />}
              contentContainerStyle={styles.messageList}
              onContentSizeChange={scrollToEnd}
              ListEmptyComponent={
                <Text style={styles.emptyChat}>
                  {messages.isLoading ? 'Loading messages...' : 'No messages yet. Say hello to our team.'}
                </Text>
              }
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
                  maxLength={5000}
                />
                <Pressable
                  onPress={handleSend}
                  disabled={!draft.trim() || sendMessage.isPending}
                  style={({ pressed }) => [
                    styles.sendBtn,
                    (!draft.trim() || sendMessage.isPending) && styles.sendBtnDisabled,
                    pressed && styles.pressed,
                  ]}
                >
                  <Ionicons
                    name="send"
                    size={20}
                    color={draft.trim() ? colors.background : colors.textMuted}
                  />
                </Pressable>
              </View>
            )}
            {sendMessage.isError && (
              <Text style={styles.sendError}>{getApiErrorMessage(sendMessage.error)}</Text>
            )}
            {isClosed && (
              <View style={styles.closedBanner}>
                <Ionicons name="lock-closed" size={16} color={colors.textMuted} />
                <Text style={styles.closedText}>This ticket is closed.</Text>
                <Pressable onPress={() => navigation.navigate('TicketFeedback', { id })} style={styles.rateBtn}>
                  <Text style={styles.rateBtnText}>Rate Support</Text>
                </Pressable>
              </View>
            )}
          </>
        ) : (
          <FlatList
            data={timeline.data?.items ?? []}
            keyExtractor={(item) => String(item.id)}
            renderItem={({ item }) => <TimelineItem event={item} />}
            contentContainerStyle={styles.timelineList}
            ListEmptyComponent={
              <Text style={styles.emptyChat}>
                {timeline.isLoading ? 'Loading timeline...' : 'No timeline events yet'}
              </Text>
            }
          />
        )}
      </KeyboardAvoidingView>
    </Screen>
  );
}

function createStyles(colors: AppColors) {
  return StyleSheet.create({
  flex: { flex: 1 },
  header: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.card,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  subject: { ...typography.h3, color: colors.text, flex: 1 },
  ticketMeta: { ...typography.bodySm, color: colors.textMuted, marginTop: spacing.xs },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.card,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: { borderBottomColor: colors.primary },
  tabText: { ...typography.label, color: colors.textMuted },
  tabTextActive: { color: colors.primary },
  messageList: { padding: spacing.md, paddingBottom: spacing.lg, flexGrow: 1 },
  timelineList: { padding: spacing.md },
  bubbleRow: { marginBottom: spacing.sm, alignItems: 'flex-start' },
  bubbleRowRight: { alignItems: 'flex-end' },
  bubble: {
    maxWidth: '82%',
    padding: spacing.md,
    borderRadius: radius.lg,
    borderTopLeftRadius: radius.sm,
  },
  bubbleUser: {
    backgroundColor: colors.primary,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.sm,
  },
  bubbleAgent: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  bubbleSystem: { backgroundColor: colors.surfaceHover, alignSelf: 'center', maxWidth: '90%' },
  bubbleSender: { ...typography.caption, color: colors.primary, marginBottom: 4, textTransform: 'none' },
  bubbleText: { ...typography.body, color: colors.text },
  bubbleTextUser: { color: colors.background },
  bubbleTime: { ...typography.bodySm, color: colors.textMuted, fontSize: 10, marginTop: spacing.xs },
  bubbleTimeUser: { color: 'rgba(7,26,31,0.6)' },
  timelineItem: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.lg },
  timelineIcon: {
    width: 32,
    height: 32,
    borderRadius: radius.full,
    backgroundColor: 'rgba(34,211,166,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineBody: { flex: 1, borderLeftWidth: 0 },
  timelineTitle: { ...typography.label, color: colors.text },
  timelineDesc: { ...typography.bodySm, color: colors.textMuted, marginTop: 4 },
  timelineTime: { ...typography.bodySm, color: colors.textMuted, fontSize: 10, marginTop: spacing.xs },
  composer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.card,
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    color: colors.text,
    fontSize: 15,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: { backgroundColor: colors.surfaceHover },
  pressed: { opacity: 0.88 },
  sendError: {
    ...typography.bodySm,
    color: colors.danger,
    textAlign: 'center',
    paddingBottom: spacing.sm,
  },
  closedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  closedText: { ...typography.bodySm, color: colors.textMuted, flex: 1 },
  rateBtn: { marginTop: spacing.sm, paddingVertical: spacing.sm },
  rateBtnText: { ...typography.label, color: colors.primary },
  emptyChat: {
    ...typography.bodySm,
    color: colors.textMuted,
    textAlign: 'center',
    paddingVertical: spacing.xxl,
  },
});
}
