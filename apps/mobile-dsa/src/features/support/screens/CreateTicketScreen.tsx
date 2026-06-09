import { useNavigation } from '@react-navigation/native';
import { type NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Button, Input, Screen } from '@/components/ui';
import { useAuth } from '@/hooks';
import { getApiErrorMessage } from '@/lib/utils';
import type { ProfileStackParamList } from '@/navigation/types';
import { supportService } from '@/services';
import { colors, radius, spacing, typography } from '@/theme';

const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const;

export function CreateTicketScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ProfileStackParamList>>();
  const { partnerId } = useAuth();
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [priority, setPriority] = useState<(typeof PRIORITIES)[number]>('MEDIUM');
  const [error, setError] = useState('');

  const categories = useQuery({
    queryKey: ['ticket-categories'],
    queryFn: () => supportService.categories({ limit: 50 }),
  });

  const createMutation = useMutation({
    mutationFn: () =>
      supportService.createTicket({
        subject: subject.trim(),
        description: description.trim(),
        categoryId: categoryId!,
        partnerId,
        priority,
      }),
    onSuccess: (ticket) => navigation.replace('TicketDetail', { id: String(ticket.id) }),
    onError: (e) => setError(getApiErrorMessage(e)),
  });

  const submit = () => {
    if (subject.trim().length < 3 || description.trim().length < 10) {
      setError('Subject and description (min 10 chars) are required');
      return;
    }
    if (!categoryId) {
      setError('Select a category');
      return;
    }
    setError('');
    createMutation.mutate();
  };

  return (
    <Screen scroll={false} padded={false}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Input label="Subject" value={subject} onChangeText={setSubject} />
        <Input label="Description" value={description} onChangeText={setDescription} multiline numberOfLines={5} />
        <Text style={styles.label}>Category</Text>
        <View style={styles.chips}>
          {(categories.data?.items ?? []).map((c) => {
            const id = String(c.id);
            const active = categoryId === id;
            return (
              <Pressable key={id} style={[styles.chip, active && styles.chipActive]} onPress={() => setCategoryId(id)}>
                <Text style={[styles.chipText, active && styles.chipTextActive]}>{String(c.name ?? c.code)}</Text>
              </Pressable>
            );
          })}
        </View>
        <Text style={styles.label}>Priority</Text>
        <View style={styles.chips}>
          {PRIORITIES.map((p) => (
            <Pressable key={p} style={[styles.chip, priority === p && styles.chipActive]} onPress={() => setPriority(p)}>
              <Text style={[styles.chipText, priority === p && styles.chipTextActive]}>{p}</Text>
            </Pressable>
          ))}
        </View>
        <Button title="Submit Ticket" fullWidth loading={createMutation.isPending} onPress={submit} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.md },
  error: { color: colors.danger, marginBottom: spacing.md },
  label: { ...typography.label, color: colors.textSecondary, marginBottom: spacing.sm, marginTop: spacing.md },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.md },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipActive: { borderColor: colors.primary, backgroundColor: `${colors.primary}22` },
  chipText: { ...typography.caption, color: colors.textMuted },
  chipTextActive: { color: colors.primary, fontWeight: '600' },
});
