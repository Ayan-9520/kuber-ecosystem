import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useRef, useState } from 'react';
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
import { useAuth } from '@/hooks';
import { sendAdvisorChat } from '@/lib/ai-chat';
import { type ChatMessage } from '@/lib/ai-orchestrator';
import { getApiErrorMessage } from '@/lib/utils';
import { colors, radius, spacing, typography } from '@/theme';

const WELCOME: ChatMessage = {
  id: 'welcome',
  role: 'assistant',
  text: "Hi! I'm your KuberOne AI Advisor. Ask me about loan recommendations, eligibility, EMI calculations, application status, or documents.",
  timestamp: Date.now(),
};

function ChatBubble({ message }: { message: ChatMessage }) {
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
  const { customerId } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME]);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const [conversationId, setConversationId] = useState<string | undefined>();
  const [error, setError] = useState<string | null>(null);
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

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      text,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setThinking(true);
    setError(null);

    try {
      const result = await sendAdvisorChat({
        message: text,
        customerId,
        conversationId,
        channel: 'text',
        language: 'en',
      });
      if (result.conversationId) setConversationId(result.conversationId);
      const assistantMsg: ChatMessage = {
        id: `a-${Date.now()}`,
        role: 'assistant',
        text: result.reply,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setThinking(false);
    }
  };

  const suggestions = [
    'What is my application status?',
    'Calculate EMI for 50 lakhs',
    'Which loan do you recommend?',
    'What documents do I need?',
  ];

  return (
    <Screen scroll={false} padded={false}>
      <View style={styles.banner}>
        <Ionicons name="sparkles" size={20} color={colors.primary} />
        <Text style={styles.bannerText}>Powered by KuberOne AI · Loan & eligibility insights</Text>
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
              <Pressable
                key={s}
                onPress={() => setInput(s)}
                style={({ pressed }) => [styles.suggestionChip, pressed && styles.pressed]}
              >
                <Text style={styles.suggestionText}>{s}</Text>
              </Pressable>
            ))}
          </View>
        )}

        {error && <Text style={styles.error}>{error}</Text>}

        <View style={styles.composer}>
          <TextInput
            style={styles.input}
            placeholder="Ask about loans, EMI, eligibility..."
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
            style={({ pressed }) => [
              styles.sendBtn,
              (!input.trim() || thinking) && styles.sendBtnDisabled,
              pressed && styles.pressed,
            ]}
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

const styles = StyleSheet.create({
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
  list: { padding: spacing.md, paddingBottom: spacing.lg, flexGrow: 1 },
  bubbleRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  bubbleRowRight: { justifyContent: 'flex-end' },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: radius.full,
    backgroundColor: 'rgba(34,211,166,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bubble: {
    maxWidth: '78%',
    padding: spacing.md,
    borderRadius: radius.lg,
  },
  bubbleUser: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: radius.sm,
  },
  bubbleAssistant: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderBottomLeftRadius: radius.sm,
  },
  bubbleText: { ...typography.body, color: colors.text, lineHeight: 22 },
  bubbleTextUser: { color: colors.background },
  thinking: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingLeft: 40,
  },
  thinkingText: { ...typography.bodySm, color: colors.textMuted },
  suggestions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
  },
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
  pressed: { opacity: 0.88 },
  error: {
    ...typography.bodySm,
    color: colors.danger,
    textAlign: 'center',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xs,
  },
});
