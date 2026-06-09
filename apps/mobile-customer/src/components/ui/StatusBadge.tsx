import { StyleSheet, Text, View } from 'react-native';

import { colors, radius, typography } from '@/theme';

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  ACTIVE: { bg: 'rgba(24,201,100,0.15)', text: colors.success },
  VERIFIED: { bg: 'rgba(24,201,100,0.15)', text: colors.success },
  PENDING: { bg: 'rgba(245,158,11,0.15)', text: colors.warning },
  OPEN: { bg: 'rgba(56,189,248,0.15)', text: colors.info },
  SUBMITTED: { bg: 'rgba(56,189,248,0.15)', text: colors.info },
  UNDER_REVIEW: { bg: 'rgba(245,158,11,0.15)', text: colors.warning },
  SANCTIONED: { bg: 'rgba(24,201,100,0.15)', text: colors.success },
  DISBURSED: { bg: 'rgba(34,211,166,0.15)', text: colors.primary },
  REJECTED: { bg: 'rgba(239,68,68,0.15)', text: colors.danger },
  DRAFT: { bg: 'rgba(139,154,171,0.15)', text: colors.textMuted },
  UNREAD: { bg: 'rgba(34,211,166,0.15)', text: colors.primary },
  RESOLVED: { bg: 'rgba(24,201,100,0.15)', text: colors.success },
  ELIGIBLE: { bg: 'rgba(24,201,100,0.15)', text: colors.success },
  NOT_ELIGIBLE: { bg: 'rgba(239,68,68,0.15)', text: colors.danger },
};

export function StatusBadge({ status }: { status: string }) {
  const key = status.toUpperCase().replace(/\s+/g, '_');
  const palette = STATUS_COLORS[key] ?? { bg: 'rgba(139,154,171,0.15)', text: colors.textSecondary };

  return (
    <View style={[styles.badge, { backgroundColor: palette.bg }]}>
      <Text style={[styles.text, { color: palette.text }]}>
        {status.replace(/_/g, ' ')}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  text: { ...typography.caption, fontSize: 10 },
});
