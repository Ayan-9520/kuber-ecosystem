import { StyleSheet, Text, View } from 'react-native';

import type { TimelineEvent } from '../data/types';

import { StatusBadge } from '@/components/ui';
import { useAppTheme } from '@/theme/ThemeProvider';
import { spacing, typography } from '@/theme';

function formatWhen(iso: string) {
  try {
    return new Date(iso).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

export function EarningsTimeline({
  events,
  title = 'Status timeline',
}: {
  events: TimelineEvent[];
  title?: string;
}) {
  const { colors } = useAppTheme();
  const ordered = [...events].sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime());

  return (
    <View style={styles.wrap}>
      <Text style={[typography.h3, { color: colors.text, marginBottom: spacing.sm }]}>{title}</Text>
      {ordered.map((event, index) => (
        <View key={event.id} style={styles.row}>
          <View style={styles.rail}>
            <View style={[styles.dot, { backgroundColor: colors.primary }]} />
            {index < ordered.length - 1 ? (
              <View style={[styles.line, { backgroundColor: colors.borderLight }]} />
            ) : null}
          </View>
          <View style={styles.body}>
            <View style={styles.head}>
              <StatusBadge status={event.status} />
              <Text style={[typography.bodySm, { color: colors.text, fontWeight: '700', flex: 1 }]}>
                {event.label}
              </Text>
            </View>
            <Text style={[typography.bodySm, { color: colors.textSecondary, marginTop: 4 }]}>
              {formatWhen(event.at)} · {event.by}
            </Text>
            {event.comment ? (
              <Text
                style={[
                  typography.bodySm,
                  {
                    color: colors.textSecondary,
                    marginTop: 6,
                    backgroundColor: colors.background,
                    padding: spacing.sm,
                    borderRadius: 8,
                  },
                ]}
              >
                {event.comment}
              </Text>
            ) : null}
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.xs },
  row: { flexDirection: 'row', gap: spacing.sm },
  rail: { width: 16, alignItems: 'center' },
  dot: { width: 10, height: 10, borderRadius: 5, marginTop: 4 },
  line: { flex: 1, width: 2, marginTop: 2, minHeight: 28 },
  body: { flex: 1, paddingBottom: spacing.md },
  head: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
});
