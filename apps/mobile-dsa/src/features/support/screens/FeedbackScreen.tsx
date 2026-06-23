import { type RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { useMutation } from '@tanstack/react-query';
import { useState, useMemo } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { Button, Card, Screen } from '@/components/ui';
import { getApiErrorMessage } from '@/lib/utils';
import type { ProfileStackParamList } from '@/navigation/types';
import { supportService } from '@/services';
import { type AppColors, useAppTheme } from '@/theme/ThemeProvider';
import { spacing } from '@/theme';

const RATINGS = [1, 2, 3, 4, 5] as const;

export function FeedbackScreen() {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const route = useRoute<RouteProp<ProfileStackParamList, 'TicketFeedback'>>();
  const navigation = useNavigation();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  const submit = useMutation({
    mutationFn: () => supportService.rateTicket(route.params.id, { rating, comment: comment.trim() || undefined }),
    onSuccess: () => navigation.goBack(),
  });

  return (
    <Screen title="Rate Support">
      <Card title="Your Rating">
        <View style={styles.stars}>
          {RATINGS.map((n) => (
            <Button key={n} title={String(n)} variant={rating === n ? 'primary' : 'secondary'} onPress={() => setRating(n)} />
          ))}
        </View>
        <TextInput
          style={styles.commentInput}
          placeholder="Optional feedback"
          placeholderTextColor={colors.textMuted}
          value={comment}
          onChangeText={setComment}
          multiline
        />
        {submit.error && <Text style={styles.error}>{getApiErrorMessage(submit.error)}</Text>}
        <Button title="Submit" fullWidth loading={submit.isPending} onPress={() => submit.mutate()} />
      </Card>
    </Screen>
  );
}

function createStyles(colors: AppColors) {
  return StyleSheet.create({
  stars: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg },
  commentInput: {
    minHeight: 80,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    backgroundColor: colors.surface,
    color: colors.text,
    marginBottom: spacing.lg,
    textAlignVertical: 'top',
  },
  error: { color: colors.danger, marginBottom: spacing.md },
});
}
