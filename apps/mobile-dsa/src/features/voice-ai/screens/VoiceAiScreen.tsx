import { Ionicons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import { useEffect, useRef, useState } from 'react';
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
import { voiceService } from '@/services';
import { colors, radius, spacing, typography } from '@/theme';

const WELCOME: ChatMessage = {
  id: 'welcome',
  role: 'assistant',
  text: "Voice mode ready. Tap the mic, use dictation or type. I'll read Kuber AI partner insights aloud.",
  timestamp: Date.now(),
};

export function VoiceAiScreen() {
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME]);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [micActive, setMicActive] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | undefined>();
  const sessionIdRef = useRef<string | null>(null);
  const inputRef = useRef<TextInput>(null);
  const listRef = useRef<FlatList>(null);

  useEffect(() => {
    let active = true;
    voiceService
      .createSession({ language: 'en' })
      .then((session) => {
        if (active) {
          sessionIdRef.current = session.id;
          setSessionId(session.id);
          setConversationId(session.conversationId);
        }
      })
      .catch(() => undefined);

    return () => {
      active = false;
      Speech.stop();
      const id = sessionIdRef.current;
      if (id) void voiceService.endSession(id).catch(() => undefined);
    };
  }, []);

  const speak = (text: string) => {
    Speech.stop();
    setSpeaking(true);
    Speech.speak(text, {
      language: 'en-IN',
      rate: 0.92,
      onDone: () => setSpeaking(false),
      onStopped: () => setSpeaking(false),
      onError: () => setSpeaking(false),
    });
  };

  const send = async () => {
    const text = input.trim();
    if (!text || thinking) return;

    setMessages((prev) => [...prev, { id: `u-${Date.now()}`, role: 'user', text, timestamp: Date.now() }]);
    setInput('');
    setThinking(true);
    setMicActive(false);
    Speech.stop();

    const result = await sendAdvisorChat({
      message: text,
      conversationId,
      channel: 'voice',
      voiceSessionId: sessionId ?? undefined,
      language: 'en',
    });
    if (result.conversationId) setConversationId(result.conversationId);
    setMessages((prev) => [
      ...prev,
      { id: `a-${Date.now()}`, role: 'assistant', text: result.reply, timestamp: Date.now() },
    ]);
    speak(result.reply);
    setThinking(false);
  };

  return (
    <Screen scroll={false} padded={false}>
      <View style={styles.statusBar}>
        <View style={[styles.statusDot, speaking && styles.statusDotActive]} />
        <Text style={styles.statusText}>
          {thinking ? 'Processing...' : speaking ? 'Speaking response' : micActive ? 'Listening' : 'Ready'}
        </Text>
      </View>

      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={[styles.bubbleRow, item.role === 'user' && styles.bubbleRowRight]}>
              <View style={[styles.bubble, item.role === 'user' ? styles.bubbleUser : styles.bubbleAssistant]}>
                <Text style={styles.bubbleText}>{item.text}</Text>
              </View>
            </View>
          )}
          contentContainerStyle={styles.list}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
          ListFooterComponent={
            thinking ? (
              <View style={styles.thinking}>
                <ActivityIndicator size="small" color={colors.primary} />
              </View>
            ) : null
          }
        />

        <Pressable
          onPress={() => {
            setMicActive(true);
            inputRef.current?.focus();
          }}
          style={[styles.micButton, micActive && styles.micButtonActive]}
        >
          <Ionicons name={micActive ? 'mic' : 'mic-outline'} size={32} color={micActive ? colors.background : colors.primary} />
        </Pressable>

        <View style={styles.composer}>
          <TextInput
            ref={inputRef}
            style={styles.input}
            placeholder="Speak or type..."
            placeholderTextColor={colors.textMuted}
            value={input}
            onChangeText={setInput}
            onBlur={() => setMicActive(false)}
            multiline
            editable={!thinking}
          />
          <Pressable onPress={send} disabled={!input.trim() || thinking} style={styles.sendBtn}>
            <Ionicons name="arrow-up" size={22} color={colors.background} />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  statusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  statusDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.textMuted },
  statusDotActive: { backgroundColor: colors.primary },
  statusText: { ...typography.bodySm, color: colors.textSecondary },
  list: { padding: spacing.md, flexGrow: 1 },
  bubbleRow: { marginBottom: spacing.md, alignItems: 'flex-start' },
  bubbleRowRight: { alignItems: 'flex-end' },
  bubble: { maxWidth: '85%', padding: spacing.md, borderRadius: radius.lg },
  bubbleUser: { backgroundColor: colors.primary },
  bubbleAssistant: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  bubbleText: { ...typography.body, color: colors.text },
  thinking: { paddingVertical: spacing.sm },
  micButton: {
    alignSelf: 'center',
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: spacing.md,
  },
  micButtonActive: { backgroundColor: colors.primary },
  composer: {
    flexDirection: 'row',
    gap: spacing.sm,
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.card,
  },
  input: {
    flex: 1,
    minHeight: 44,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.xl,
    paddingHorizontal: spacing.md,
    color: colors.text,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
