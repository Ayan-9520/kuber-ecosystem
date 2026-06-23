import { useNavigation } from '@react-navigation/native';
import { type NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, useMemo } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Button, Input, Screen } from '@/components/ui';
import { useAuth } from '@/hooks';
import { getApiErrorMessage, str } from '@/lib/utils';
import type { SupportStackParamList } from '@/navigation/types';
import { supportService } from '@/services';
import { type AppColors, useAppTheme } from '@/theme/ThemeProvider';
import { radius, spacing, typography } from '@/theme';

const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const;

export function CreateTicketScreen() {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const navigation = useNavigation<NativeStackNavigationProp<SupportStackParamList>>();
  const queryClient = useQueryClient();
  const { customerId } = useAuth();

  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [priority, setPriority] = useState<(typeof PRIORITIES)[number]>('MEDIUM');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const categories = useQuery({
    queryKey: ['support', 'categories'],
    queryFn: () => supportService.categories(),
  });

  const createTicket = useMutation({
    mutationFn: () =>
      supportService.createTicket({
        subject: subject.trim(),
        description: description.trim(),
        categoryId: categoryId!,
        priority,
        customerId,
      }),
    onSuccess: (ticket) => {
      queryClient.invalidateQueries({ queryKey: ['support', 'tickets'] });
      navigation.replace('TicketDetail', { id: String(ticket.id) });
    },
    onError: (error) => {
      Alert.alert('Could not create ticket', getApiErrorMessage(error));
    },
  });

  const validate = () => {
    const next: Record<string, string> = {};
    if (subject.trim().length < 3) next.subject = 'Subject must be at least 3 characters';
    if (description.trim().length < 10) next.description = 'Please describe your issue (min 10 characters)';
    if (!categoryId) next.category = 'Select a category';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = () => {
    if (!customerId) {
      Alert.alert('Profile required', 'Complete your profile before creating a support ticket.');
      return;
    }
    if (!validate()) return;
    createTicket.mutate();
  };

  return (
    <Screen scroll={false} padded={false}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.heading}>Tell us how we can help</Text>
        <Text style={styles.subheading}>
          Our support team typically responds within a few business hours.
        </Text>

        <Input
          label="Subject"
          placeholder="Brief summary of your issue"
          value={subject}
          onChangeText={setSubject}
          error={errors.subject}
          maxLength={300}
        />

        <View style={styles.field}>
          <Text style={styles.label}>Category</Text>
          {categories.isLoading ? (
            <Text style={styles.muted}>Loading categories...</Text>
          ) : (
            <View style={styles.chipGrid}>
              {categories.data?.items.map((cat) => {
                const id = String(cat.id);
                const selected = categoryId === id;
                return (
                  <Pressable
                    key={id}
                    onPress={() => setCategoryId(id)}
                    style={[styles.chip, selected && styles.chipSelected]}
                  >
                    <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
                      {str(cat.name ?? cat.code)}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          )}
          {errors.category && <Text style={styles.error}>{errors.category}</Text>}
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Priority</Text>
          <View style={styles.chipGrid}>
            {PRIORITIES.map((p) => {
              const selected = priority === p;
              return (
                <Pressable
                  key={p}
                  onPress={() => setPriority(p)}
                  style={[styles.chip, selected && styles.chipSelected]}
                >
                  <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
                    {p.replace('_', ' ')}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <Input
          label="Description"
          placeholder="Describe your issue in detail..."
          value={description}
          onChangeText={setDescription}
          error={errors.description}
          multiline
          numberOfLines={6}
          style={styles.textArea}
          textAlignVertical="top"
        />

        <Button
          title="Submit Ticket"
          fullWidth
          loading={createTicket.isPending}
          onPress={handleSubmit}
        />
      </ScrollView>
    </Screen>
  );
}

function createStyles(colors: AppColors) {
  return StyleSheet.create({
  content: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  heading: { ...typography.h2, color: colors.text, marginBottom: spacing.xs },
  subheading: { ...typography.bodySm, color: colors.textMuted, marginBottom: spacing.lg },
  field: { marginBottom: spacing.md },
  label: { ...typography.label, color: colors.textSecondary, marginBottom: spacing.sm },
  chipGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipSelected: {
    backgroundColor: 'rgba(34,211,166,0.15)',
    borderColor: colors.primary,
  },
  chipText: { ...typography.bodySm, color: colors.textMuted },
  chipTextSelected: { color: colors.primary, fontWeight: '600' },
  textArea: { minHeight: 140, paddingTop: spacing.md },
  muted: { ...typography.bodySm, color: colors.textMuted },
  error: { ...typography.bodySm, color: colors.danger, marginTop: spacing.xs },
});
}
