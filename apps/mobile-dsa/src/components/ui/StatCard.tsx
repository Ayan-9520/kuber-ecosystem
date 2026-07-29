import { Ionicons } from '@expo/vector-icons';
import { useMemo } from 'react';
import { Platform, Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { useResponsiveLayout } from '@/hooks';
import { radius, spacing, typography } from '@/theme';
import { cardShadow } from '@/theme/elevation';
import { type AppColors, useAppTheme } from '@/theme/ThemeProvider';

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: keyof typeof Ionicons.glyphMap;
  trend?: string;
  accent?: boolean;
  onPress?: () => void;
  /** Override flex basis for responsive grids (e.g. 25% for 4-col). */
  style?: StyleProp<ViewStyle>;
}

function createStyles(colors: AppColors, isDesktop: boolean) {
  return StyleSheet.create({
    card: {
      flexGrow: 1,
      flexBasis: '45%',
      minWidth: 140,
      backgroundColor: colors.card,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: colors.borderLight,
      padding: isDesktop ? spacing.lg : spacing.md,
      ...cardShadow(),
      ...(Platform.OS === 'web'
        ? ({
            transitionProperty: 'transform, box-shadow, border-color',
            transitionDuration: '160ms',
          } as object)
        : null),
    },
    cardAccent: {
      borderColor: colors.primary,
      backgroundColor: colors.surface,
    },
    iconWrap: {
      width: isDesktop ? 44 : 40,
      height: isDesktop ? 44 : 40,
      borderRadius: radius.md,
      backgroundColor: `${colors.primary}22`,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing.sm,
    },
    label: {
      ...typography.caption,
      color: colors.textSecondary,
      textTransform: 'none',
      letterSpacing: 0.3,
      fontSize: isDesktop ? 13 : 12,
      fontWeight: '600',
    },
    value: {
      ...typography.h2,
      color: colors.text,
      fontSize: isDesktop ? 24 : 22,
      marginTop: 4,
      fontWeight: '700',
      letterSpacing: -0.5,
    },
    trend: { ...typography.bodySm, color: colors.primary, marginTop: 6, fontWeight: '600' },
    action: {
      alignItems: 'center',
      flexGrow: 1,
      minWidth: 88,
    },
    actionPressed: { opacity: 0.88, transform: [{ scale: 0.97 }] },
    actionIcon: {
      width: isDesktop ? 72 : 60,
      height: isDesktop ? 72 : 60,
      borderRadius: radius.lg,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.borderLight,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing.sm,
      ...cardShadow(),
      ...(Platform.OS === 'web'
        ? ({
            transitionProperty: 'transform, border-color, box-shadow',
            transitionDuration: '160ms',
          } as object)
        : null),
    },
    actionIconInner: {
      width: isDesktop ? 48 : 44,
      height: isDesktop ? 48 : 44,
      borderRadius: radius.md,
      backgroundColor: `${colors.primary}18`,
      alignItems: 'center',
      justifyContent: 'center',
    },
    actionLabel: {
      ...typography.label,
      color: colors.text,
      textAlign: 'center',
      fontSize: isDesktop ? 13 : 12,
      lineHeight: 16,
      fontWeight: '600',
    },
  });
}

export function StatCard({ label, value, icon, trend, accent, onPress, style }: StatCardProps) {
  const { colors } = useAppTheme();
  const { isDesktop } = useResponsiveLayout();
  const styles = useMemo(() => createStyles(colors, isDesktop), [colors, isDesktop]);

  const text = String(value);
  const valueFontSize =
    text.length > 13 ? (isDesktop ? 18 : 16) : text.length > 10 ? (isDesktop ? 20 : 18) : text.length > 8 ? 20 : isDesktop ? 24 : 22;

  const content = (
    <>
      {icon && (
        <View style={styles.iconWrap}>
          <Ionicons name={icon} size={isDesktop ? 22 : 20} color={colors.primary} />
        </View>
      )}
      <Text style={styles.label} numberOfLines={2}>
        {label}
      </Text>
      <Text style={[styles.value, { fontSize: valueFontSize }]} numberOfLines={1} adjustsFontSizeToFit>
        {text}
      </Text>
      {trend && (
        <Text style={styles.trend} numberOfLines={1}>
          {trend}
        </Text>
      )}
    </>
  );

  if (onPress) {
    return (
      <Pressable
        style={({ pressed }) => [
          styles.card,
          accent && styles.cardAccent,
          style,
          pressed && { opacity: 0.9 },
          Platform.OS === 'web' && ({ cursor: 'pointer' } as const),
        ]}
        onPress={onPress}
        accessibilityRole="button"
      >
        {content}
      </Pressable>
    );
  }

  return <View style={[styles.card, accent && styles.cardAccent, style]}>{content}</View>;
}

export function QuickAction({
  label,
  icon,
  onPress,
  style,
}: {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
}) {
  const { colors } = useAppTheme();
  const { isDesktop } = useResponsiveLayout();
  const styles = useMemo(() => createStyles(colors, isDesktop), [colors, isDesktop]);

  return (
    <Pressable
      style={({ pressed }) => [
        styles.action,
        style,
        pressed && styles.actionPressed,
        Platform.OS === 'web' && ({ cursor: 'pointer' } as const),
      ]}
      onPress={onPress}
    >
      <View style={styles.actionIcon}>
        <View style={styles.actionIconInner}>
          <Ionicons name={icon} size={isDesktop ? 24 : 22} color={colors.primary} />
        </View>
      </View>
      <Text style={styles.actionLabel} numberOfLines={2}>
        {label}
      </Text>
    </Pressable>
  );
}
