import { useMemo } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  type PressableProps,
  StyleSheet,
  Text,
  type ViewStyle,
} from 'react-native';

import { useResponsiveLayout } from '@/hooks';
import { radius, spacing, typography } from '@/theme';
import { cardShadow } from '@/theme/elevation';
import { premiumHover } from '@/theme/premium';
import { type AppColors, useAppTheme } from '@/theme/ThemeProvider';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';

interface ButtonProps extends PressableProps {
  title: string;
  variant?: Variant;
  loading?: boolean;
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

function createStyles(colors: AppColors, isDesktop: boolean) {
  return StyleSheet.create({
    base: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.sm,
      paddingVertical: isDesktop ? 14 : 13,
      paddingHorizontal: spacing.lg,
      borderRadius: isDesktop ? radius.lg : radius.md,
      minHeight: 48,
      ...premiumHover(),
    },
    fullWidth: { width: '100%' },
    primary: {
      backgroundColor: colors.primary,
      ...cardShadow(true, colors.primary),
    },
    secondary: { backgroundColor: colors.surfaceHover, borderWidth: 1, borderColor: colors.border },
    ghost: { backgroundColor: 'transparent' },
    danger: {
      backgroundColor: `${colors.danger}26`,
      borderWidth: 1,
      borderColor: `${colors.danger}4D`,
    },
    pressed: { opacity: 0.88, transform: [{ scale: 0.98 }] },
    disabled: { opacity: 0.5 },
    text: { ...typography.label, fontSize: 15 },
    primaryText: { color: colors.onPrimary },
    secondaryText: { color: colors.text },
    ghostText: { color: colors.primary },
    dangerText: { color: colors.danger },
  });
}

export function Button({
  title,
  variant = 'primary',
  loading,
  icon,
  fullWidth,
  disabled,
  style,
  ...rest
}: ButtonProps) {
  const { colors } = useAppTheme();
  const { isDesktop } = useResponsiveLayout();
  const styles = useMemo(() => createStyles(colors, isDesktop), [colors, isDesktop]);

  return (
    <Pressable
      style={({ pressed }) => [
        styles.base,
        styles[variant],
        fullWidth && styles.fullWidth,
        (disabled || loading) && styles.disabled,
        pressed && styles.pressed,
        Platform.OS === 'web' && ({ cursor: 'pointer' } as const),
        style as ViewStyle,
      ]}
      disabled={disabled || loading}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? colors.onPrimary : colors.primary} />
      ) : (
        <>
          {icon}
          <Text style={[styles.text, styles[`${variant}Text` as keyof typeof styles] as object]}>{title}</Text>
        </>
      )}
    </Pressable>
  );
}
