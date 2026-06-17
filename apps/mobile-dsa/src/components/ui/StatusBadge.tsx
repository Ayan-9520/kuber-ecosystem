import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { radius, typography } from '@/theme';
import { type AppColors, useAppTheme } from '@/theme/ThemeProvider';

function statusPalette(colors: AppColors, status: string) {
  const key = status.toUpperCase().replace(/\s+/g, '_');
  const map: Record<string, { bg: string; text: string }> = {
    ACTIVE: { bg: `${colors.success}22`, text: colors.success },
    VERIFIED: { bg: `${colors.success}22`, text: colors.success },
    PENDING: { bg: `${colors.warning}22`, text: colors.warning },
    OPEN: { bg: `${colors.info}22`, text: colors.info },
    SUBMITTED: { bg: `${colors.info}22`, text: colors.info },
    UNDER_REVIEW: { bg: `${colors.warning}22`, text: colors.warning },
    SANCTIONED: { bg: `${colors.success}22`, text: colors.success },
    DISBURSED: { bg: `${colors.primary}22`, text: colors.primary },
    REJECTED: { bg: `${colors.danger}22`, text: colors.danger },
    DRAFT: { bg: `${colors.textMuted}22`, text: colors.textSecondary },
    UNREAD: { bg: `${colors.primary}22`, text: colors.primary },
    RESOLVED: { bg: `${colors.success}22`, text: colors.success },
    ELIGIBLE: { bg: `${colors.success}22`, text: colors.success },
    NOT_ELIGIBLE: { bg: `${colors.danger}22`, text: colors.danger },
    HIGH: { bg: `${colors.danger}22`, text: colors.danger },
    NEW: { bg: `${colors.info}22`, text: colors.info },
    CONVERTED: { bg: `${colors.success}22`, text: colors.success },
  };
  return map[key] ?? { bg: `${colors.textMuted}22`, text: colors.textSecondary };
}

export function StatusBadge({ status }: { status: string }) {
  const { colors } = useAppTheme();
  const palette = statusPalette(colors, status);
  const styles = useMemo(
    () =>
      StyleSheet.create({
        badge: {
          alignSelf: 'flex-start',
          paddingHorizontal: 10,
          paddingVertical: 5,
          borderRadius: radius.full,
          backgroundColor: palette.bg,
        },
        text: {
          ...typography.caption,
          fontSize: 10,
          fontWeight: '700',
          color: palette.text,
          textTransform: 'capitalize',
        },
      }),
    [palette.bg, palette.text],
  );

  return (
    <View style={styles.badge}>
      <Text style={styles.text}>{status.replace(/_/g, ' ').toLowerCase()}</Text>
    </View>
  );
}
