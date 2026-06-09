import { type ReactNode, useMemo } from 'react';
import { Pressable, StyleSheet, Text, View, type ViewProps } from 'react-native';

import { type AppColors, useAppTheme } from '@/theme/ThemeProvider';
import { radius, spacing, typography } from '@/theme';

interface CardProps extends ViewProps {
  title?: string;
  subtitle?: string;
  onPress?: () => void;
  children: ReactNode;
  action?: ReactNode;
}

function createStyles(colors: AppColors) {
  return StyleSheet.create({
    card: {
      backgroundColor: colors.card,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: colors.border,
      padding: spacing.md,
      marginBottom: spacing.md,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: spacing.md,
    },
    headerText: { flex: 1 },
    title: { ...typography.h3, color: colors.text },
    subtitle: { ...typography.bodySm, color: colors.textMuted, marginTop: 2 },
    pressed: { opacity: 0.92 },
  });
}

export function Card({ title, subtitle, onPress, children, action, style, ...rest }: CardProps) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const content = (
    <View style={[styles.card, style]} {...rest}>
      {(title || action) && (
        <View style={styles.header}>
          <View style={styles.headerText}>
            {title && <Text style={styles.title}>{title}</Text>}
            {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
          </View>
          {action}
        </View>
      )}
      {children}
    </View>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} style={({ pressed }) => pressed && styles.pressed}>
        {content}
      </Pressable>
    );
  }

  return content;
}
