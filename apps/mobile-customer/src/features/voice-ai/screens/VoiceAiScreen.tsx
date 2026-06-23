import { Ionicons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
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
import { useAuth } from '@/hooks';
import { sendAdvisorChat } from '@/lib/ai-chat';
import { type ChatMessage } from '@/lib/ai-orchestrator';
import { getApiErrorMessage } from '@/lib/utils';
import { voiceService } from '@/services';
import { type AppColors, useAppTheme } from '@/theme/ThemeProvider';
import { radius, spacing, typography } from '@/theme';

const WELCOME: ChatMessage = {
  id: 'welcome',
  role: 'assistant',
  text: "Voice mode ready. Tap the microphone, speak using your keyboard's dictation, or type below. I'll read Kuber AI responses aloud.",
  timestamp: Date.now(),
};

function VoiceBubble({ message }: { message: ChatMessage }) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const isUser = message.role === 'user';
  return (
    <View style={[styles.bubbleRow, isUser && styles.bubbleRowRight]}>
      <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleAssistant]}>
        <Text style={[styles.bubbleText, isUser && styles.bubbleTextUser]}>{message.text}</Text>
      </View>
    </View>
  );
}

export function VoiceAiScreen() {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { customerId } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME]);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [micActive, setMicActive] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | undefined>();
  const [error, setError] = useState<string | null>(null);
  const listRef = useRef<FlatList>(null);
  const inputRef = useRef<TextInput>(null);
  const sessionIdRef = useRef<string | null>(null);

  useEffect(() => {
    let active = true;

    voiceService
      .createSession({ language: 'en', customerId })
      .then((session) => {
        if (active) {
          sessionIdRef.current = session.id;
          setSessionId(session.id);
          setConversationId(session.conversationId);
        }
      })
      .catch(() => {
        if (active) setError('Could not start voice session. Replies will still work in offline mode.');
      });

    return () => {
      active = false;
      Speech.stop();
      const id = sessionIdRef.current;
      if (id) void voiceService.endSession(id).catch(() => undefined);
    };
  }, [customerId]);

  const scrollToEnd = useCallback(() => {
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 80);
  }, []);

  useEffect(() => {
    scrollToEnd();
  }, [messages.length, thinking, scrollToEnd]);

  const speak = (text: string) => {
    Speech.stop();
    setSpeaking(true);
    Speech.speak(text, {
      language: 'en-IN',
      rate: 0.92,
      pitch: 1,
      onDone: () => setSpeaking(false),
      onStopped: () => setSpeaking(false),
      onError: () => setSpeaking(false),
    });
  };

  const stopSpeaking = () => {
    Speech.stop();
    setSpeaking(false);
  };

  const handleMicPress = () => {
    setMicActive(true);
    inputRef.current?.focus();
  };

  const send = async () => {
    const text = input.trim();
    if (!text || thinking) return;

    stopSpeaking();
    setMicActive(false);

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
        channel: 'voice',
        voiceSessionId: sessionId ?? undefined,
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
      speak(result.reply);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setThinking(false);
    }
  };

  return (
    <Screen scroll={false} padded={false}>
      <View style={styles.statusBar}>
        <View style={[styles.statusDot, speaking && styles.statusDotActive]} />
        <Text style={styles.statusText}>
          {thinking ? 'Processing...' : speaking ? 'Speaking response' : micActive ? 'Listening — use keyboard dictation' : 'Ready'}
        </Text>
        {speaking && (
          <Pressable onPress={stopSpeaking} style={styles.stopBtn}>
            <Ionicons name="stop-circle" size={22} color={colors.danger} />
          </Pressable>
        )}
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
          renderItem={({ item }) => <VoiceBubble message={item} />}
          contentContainerStyle={styles.list}
          onContentSizeChange={scrollToEnd}
          ListFooterComponent={
            thinking ? (
              <View style={styles.thinking}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={styles.thinkingText}>Getting answer...</Text>
              </View>
            ) : null
          }
        />

        {error && <Text style={styles.error}>{error}</Text>}

        <View style={styles.voiceArea}>
          <Pressable
            onPress={handleMicPress}
            style={({ pressed }) => [
              styles.micButton,
              micActive && styles.micButtonActive,
              pressed && styles.pressed,
            ]}
          >
            <Ionicons
              name={micActive ? 'mic' : 'mic-outline'}
              size={32}
              color={micActive ? colors.background : colors.primary}
            />
          </Pressable>
          <Text style={styles.micHint}>Tap mic, then use device dictation or type below</Text>
        </View>

        <View style={styles.composer}>
          <TextInput
            ref={inputRef}
            style={styles.input}
            placeholder="Speak or type your question..."
            placeholderTextColor={colors.textMuted}
            value={input}
            onChangeText={setInput}
            onBlur={() => setMicActive(false)}
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

function createStyles(colors: AppColors) {
  return StyleSheet.create({
  flex: { flex: 1 },
  statusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.textMuted,
  },
  statusDotActive: { backgroundColor: colors.primary },
  statusText: { ...typography.bodySm, color: colors.textSecondary, flex: 1 },
  stopBtn: { padding: spacing.xs },
  list: { padding: spacing.md, flexGrow: 1 },
  bubbleRow: { marginBottom: spacing.md, alignItems: 'flex-start' },
  bubbleRowRight: { alignItems: 'flex-end' },
  bubble: {
    maxWidth: '85%',
    padding: spacing.md,
    borderRadius: radius.lg,
  },
  bubbleUser: { backgroundColor: colors.primary, borderBottomRightRadius: radius.sm },
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
  },
  thinkingText: { ...typography.bodySm, color: colors.textMuted },
  voiceArea: { alignItems: 'center', paddingVertical: spacing.lg },
  micButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(34,211,166,0.12)',
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  micButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primaryHover,
    transform: [{ scale: 1.05 }],
  },
  micHint: { ...typography.bodySm, color: colors.textMuted, marginTop: spacing.sm, textAlign: 'center' },
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
    maxHeight: 100,
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
}
