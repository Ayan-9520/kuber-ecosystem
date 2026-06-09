import { type RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { Button, Card, Screen } from '@/components/ui';
import { getApiErrorMessage } from '@/lib/utils';
import type { SupportStackParamList } from '@/navigation/types';
import { supportService } from '@/services';
import { colors, spacing, typography } from '@/theme';

const RATINGS = [1, 2, 3, 4, 5] as const;

export function FeedbackScreen() {
  const route = useRoute<RouteProp<SupportStackParamList, 'TicketFeedback'>>();
  const navigation = useNavigation();
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState('');

  const submit = useMutation({
    mutationFn: () =>
      supportService.rateTicket(route.params.id, {
        rating,
        comment: comment.trim() || undefined,
      }),
    onSuccess: () => navigation.goBack(),
  });

  return (
    <Screen title="Rate Support" subtitle="How was your support experience?">
      <Card title="Your Rating">
        <View style={styles.stars}>
          {RATINGS.map((n) => (
            <Button
              key={n}
              title={String(n)}
              variant={rating === n ? 'primary' : 'secondary'}
              onPress={() => setRating(n)}
            />
          ))}
        </View>
        <Text style={styles.label}>Comments (optional)</Text>
        <TextInput
          style={styles.commentInput}
          placeholder="Share feedback to help us improve"
          placeholderTextColor={colors.textMuted}
          value={comment}
          onChangeText={setComment}
          multiline
        />
        {submit.error && <Text style={styles.error}>{getApiErrorMessage(submit.error)}</Text>}
        <Button title="Submit Feedback" fullWidth loading={submit.isPending} onPress={() => submit.mutate()} />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  stars: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg },
  label: { ...typography.label, color: colors.textSecondary, marginBottom: spacing.sm },
  commentInput: {
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg,
    minHeight: 80,
    color: colors.text,
    textAlignVertical: 'top',
  },
  error: { color: colors.danger, marginBottom: spacing.md },
});
