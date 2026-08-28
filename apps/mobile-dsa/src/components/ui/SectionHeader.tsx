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
    wrap: { marginBottom: isDesktop ? spacing.lg : spacing.sm },
    eyebrow: {
      ...typography.caption,
      color: colors.primary,
      fontWeight: '800',
      letterSpacing: 1.4,
      fontSize: 10,
      textTransform: 'uppercase',
      marginBottom: 6,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
      gap: spacing.md,
    },
    copy: { flex: 1, minWidth: 0 },
    title: {
      ...typography.h3,
      color: colors.text,
      fontSize: isDesktop ? 22 : 17,
      fontWeight: '800',
      letterSpacing: -0.4,
    },
    subtitle: {
      ...typography.bodySm,
      color: colors.textSecondary,
      marginTop: 4,
      fontSize: isDesktop ? 14 : 13,
      lineHeight: 20,
    },
    accent: {
      width: 36,
      height: 3,
      borderRadius: 2,
      backgroundColor: colors.primary,
      marginTop: 10,
      opacity: 0.85,
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
          {isDesktop ? <View style={styles.accent} /> : null}
        </View>
        {right}
      </View>
    </View>
  );
}
