import { type ReactNode, useMemo } from 'react';
import { Platform, Pressable, StyleSheet, Text, View, type ViewProps } from 'react-native';

import { useResponsiveLayout } from '@/hooks';
import { radius, spacing, typography } from '@/theme';
import { cardShadow } from '@/theme/elevation';
import { glassSurface, premiumHover } from '@/theme/premium';
import { type AppColors, useAppTheme } from '@/theme/ThemeProvider';

interface CardProps extends ViewProps {
  title?: string;
  subtitle?: string;
  onPress?: () => void;
  children: ReactNode;
  action?: ReactNode;
  elevated?: boolean;
}

function createStyles(colors: AppColors, isDesktop: boolean) {
  return StyleSheet.create({
    card: {
      borderRadius: isDesktop ? radius.lg : radius.lg,
      borderWidth: 1,
      padding: isDesktop ? spacing.lg : spacing.lg,
      marginBottom: 0,
      ...glassSurface(colors, isDesktop),
      ...cardShadow(false, colors.primary),
      ...premiumHover(),
    },
    elevated: {
      ...cardShadow(true, colors.primary),
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: spacing.md,
    },
    headerText: { flex: 1 },
    title: {
      ...typography.h3,
      color: colors.text,
      fontSize: isDesktop ? 16 : 17,
      fontWeight: '700',
    },
    subtitle: { ...typography.bodySm, color: colors.textSecondary, marginTop: 6, lineHeight: 18 },
    pressed: { opacity: 0.94, transform: [{ scale: 0.995 }] },
  });
}

export function Card({
  title,
  subtitle,
  onPress,
  children,
  action,
  elevated,
  style,
  ...rest
}: CardProps) {
  const { colors } = useAppTheme();
  const { isDesktop } = useResponsiveLayout();
  const styles = useMemo(() => createStyles(colors, isDesktop), [colors, isDesktop]);

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
