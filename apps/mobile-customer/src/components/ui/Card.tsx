import { type ReactNode, useMemo } from 'react';
import { Platform, Pressable, StyleSheet, Text, View, type ViewProps } from 'react-native';

import { radius, spacing, typography } from '@/theme';
import { cardShadow } from '@/theme/elevation';
import { type AppColors, useAppTheme } from '@/theme/ThemeProvider';

interface CardProps extends ViewProps {
  title?: string;
  subtitle?: string;
  onPress?: () => void;
  children: ReactNode;
  action?: ReactNode;
  elevated?: boolean;
}

function createStyles(colors: AppColors) {
  return StyleSheet.create({
    card: {
      backgroundColor: colors.card,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: colors.borderLight,
      padding: spacing.lg,
      marginBottom: spacing.md,
    },
    elevated: {
      borderColor: colors.border,
      ...cardShadow(true),
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: spacing.md,
    },
    headerText: { flex: 1 },
    title: { ...typography.h3, color: colors.text, fontSize: 17 },
    subtitle: { ...typography.bodySm, color: colors.textSecondary, marginTop: 4, lineHeight: 18 },
    pressed: { opacity: 0.92 },
  });
}

export function Card({ title, subtitle, onPress, children, action, elevated, style, ...rest }: CardProps) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const content = (
    <View style={[styles.card, elevated && styles.elevated, style]} {...rest}>
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
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          pressed && styles.pressed,
          Platform.OS === 'web' && ({ cursor: 'pointer' } as const),
        ]}
      >
        {content}
      </Pressable>
    );
  }

  return content;
}
