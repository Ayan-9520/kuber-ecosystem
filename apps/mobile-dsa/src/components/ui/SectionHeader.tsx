import { useMemo } from 'react';
import { StyleSheet, Text, View, type ViewStyle } from 'react-native';

import { useResponsiveLayout } from '@/hooks';
import { spacing, typography } from '@/theme';
import { type AppColors, useAppTheme } from '@/theme/ThemeProvider';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  right?: React.ReactNode;
  style?: ViewStyle;
}

function createStyles(colors: AppColors, isDesktop: boolean) {
  return StyleSheet.create({
    wrap: { marginBottom: isDesktop ? spacing.sm : spacing.sm },
    eyebrow: {
      ...typography.caption,
      color: colors.primary,
      fontWeight: '600',
      letterSpacing: 0.8,
      fontSize: 10,
      textTransform: 'uppercase',
      marginBottom: 4,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: spacing.md,
    },
    copy: { flex: 1, minWidth: 0 },
    title: {
      ...typography.h3,
      color: colors.text,
      fontSize: isDesktop ? 16 : 17,
      fontWeight: '700',
    },
    subtitle: {
      ...typography.bodySm,
      color: colors.textSecondary,
      marginTop: 2,
      fontSize: isDesktop ? 12 : 13,
    },
  });
}

export function SectionHeader({ title, subtitle, eyebrow, right, style }: SectionHeaderProps) {
  const { colors } = useAppTheme();
  const { isDesktop } = useResponsiveLayout();
  const styles = useMemo(() => createStyles(colors, isDesktop), [colors, isDesktop]);

  return (
    <View style={[styles.wrap, style]}>
      {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
      <View style={styles.row}>
        <View style={styles.copy}>
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
        {right}
      </View>
    </View>
  );
}
