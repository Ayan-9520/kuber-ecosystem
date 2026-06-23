import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useRef, useState, useMemo } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { Screen } from '@/components/ui';
import { sendAdvisorChat, type ChatMessage } from '@/lib/ai-chat';
import { type AppColors, useAppTheme } from '@/theme/ThemeProvider';
import { radius, spacing, typography } from '@/theme';

const WELCOME: ChatMessage = {
  id: 'welcome',
  role: 'assistant',
  text: "Hi Partner! I'm your KuberOne AI Advisor. Ask about lender recommendations, lead qualification, missing documents, or approval probability.",
  timestamp: Date.now(),
};

function ChatBubble({ message }: { message: ChatMessage }) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const isUser = message.role === 'user';
  return (
    <View style={[styles.bubbleRow, isUser && styles.bubbleRowRight]}>
      {!isUser && (
        <View style={styles.avatar}>
          <Ionicons name="sparkles" size={16} color={colors.primary} />
        </View>
      )}
      <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleAssistant]}>
        <Text style={[styles.bubbleText, isUser && styles.bubbleTextUser]}>{message.text}</Text>
      </View>
    </View>
  );
}

export function AiAdvisorScreen() {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME]);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const [conversationId, setConversationId] = useState<string | undefined>();
  const listRef = useRef<FlatList>(null);

  const scrollToEnd = useCallback(() => {
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 80);
  }, []);

  useEffect(() => {
    scrollToEnd();
  }, [messages.length, thinking, scrollToEnd]);

  const send = async () => {
    const text = input.trim();
    if (!text || thinking) return;

    setMessages((prev) => [...prev, { id: `u-${Date.now()}`, role: 'user', text, timestamp: Date.now() }]);
    setInput('');
    setThinking(true);

    const result = await sendAdvisorChat({
      message: text,
      conversationId,
      channel: 'text',
      language: 'en',
    });
    if (result.conversationId) setConversationId(result.conversationId);
    setMessages((prev) => [
      ...prev,
      { id: `a-${Date.now()}`, role: 'assistant', text: result.reply, timestamp: Date.now() },
    ]);
    setThinking(false);
  };

  const suggestions = [
    'Recommend a lender for this lead',
    'What documents are missing?',
    'Approval probability tips',
    'Next best action for hot leads',
  ];

  return (
    <Screen scroll={false} padded={false}>
      <View style={styles.banner}>
        <Ionicons name="sparkles" size={20} color={colors.primary} />
        <Text style={styles.bannerText}>DSA Sales Copilot · Lender & lead insights</Text>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ChatBubble message={item} />}
          contentContainerStyle={styles.list}
          onContentSizeChange={scrollToEnd}
          ListFooterComponent={
            thinking ? (
              <View style={styles.thinking}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={styles.thinkingText}>Thinking...</Text>
              </View>
            ) : null
          }
        />

        {messages.length <= 1 && (
          <View style={styles.suggestions}>
            {suggestions.map((s) => (
              <Pressable key={s} onPress={() => setInput(s)} style={styles.suggestionChip}>
                <Text style={styles.suggestionText}>{s}</Text>
              </Pressable>
            ))}
          </View>
        )}

        <View style={styles.composer}>
          <TextInput
            style={styles.input}
            placeholder="Ask about leads, lenders, documents..."
            placeholderTextColor={colors.textMuted}
            value={input}
            onChangeText={setInput}
            multiline
            maxLength={2000}
            editable={!thinking}
          />
          <Pressable
            onPress={send}
            disabled={!input.trim() || thinking}
            style={[styles.sendBtn, (!input.trim() || thinking) && styles.sendBtnDisabled]}
          >
            <Ionicons
              name="arrow-up"
              size={22}
              color={input.trim() && !thinking ? colors.background : colors.textMuted}
            />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

function createStyles(colors: AppColors) {
  return StyleSheet.create({
  flex: { flex: 1 },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: 'rgba(34,211,166,0.08)',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  bannerText: { ...typography.bodySm, color: colors.textSecondary, flex: 1 },
  list: { padding: spacing.md, flexGrow: 1 },
  bubbleRow: { flexDirection: 'row', alignItems: 'flex-end', gap: spacing.sm, marginBottom: spacing.md },
  bubbleRowRight: { justifyContent: 'flex-end' },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: radius.full,
    backgroundColor: 'rgba(34,211,166,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bubble: { maxWidth: '78%', padding: spacing.md, borderRadius: radius.lg },
  bubbleUser: { backgroundColor: colors.primary, borderBottomRightRadius: radius.sm },
  bubbleAssistant: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderBottomLeftRadius: radius.sm,
  },
  bubbleText: { ...typography.body, color: colors.text, lineHeight: 22 },
  bubbleTextUser: { color: colors.background },
  thinking: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.sm, paddingLeft: 40 },
  thinkingText: { ...typography.bodySm, color: colors.textMuted },
  suggestions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, paddingHorizontal: spacing.md, paddingBottom: spacing.sm },
  suggestionChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  suggestionText: { ...typography.bodySm, color: colors.primary },
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
    borderRadius: radius.xl,
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
});
}
