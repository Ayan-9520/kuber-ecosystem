import { Ionicons } from '@expo/vector-icons';
import { useMemo } from 'react';
import { Platform, Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { useResponsiveLayout } from '@/hooks';
import { radius, spacing, typography } from '@/theme';
import { cardShadow } from '@/theme/elevation';
import { glassSurface, premiumHover } from '@/theme/premium';
import { type AppColors, useAppTheme } from '@/theme/ThemeProvider';

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: keyof typeof Ionicons.glyphMap;
  trend?: string;
  accent?: boolean;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

function createStyles(colors: AppColors, isDesktop: boolean) {
  return StyleSheet.create({
    card: {
      flexGrow: 1,
      flexBasis: '45%',
      minWidth: 140,
      borderRadius: isDesktop ? radius.xl : radius.lg,
      borderWidth: 1,
      padding: isDesktop ? spacing.xl : spacing.md,
      ...glassSurface(colors, isDesktop),
      ...cardShadow(false, colors.primary),
      ...premiumHover(),
    },
    cardAccent: {
      borderColor: `${colors.primary}55`,
      backgroundColor: isDesktop ? `${colors.primary}0c` : colors.surface,
      ...cardShadow(true, colors.primary),
    },
    iconWrap: {
      width: isDesktop ? 48 : 40,
      height: isDesktop ? 48 : 40,
      borderRadius: radius.lg,
      backgroundColor: `${colors.primary}1a`,
      borderWidth: 1,
      borderColor: `${colors.primary}28`,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing.md,
    },
    label: {
      ...typography.caption,
      color: colors.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: 0.6,
      fontSize: isDesktop ? 11 : 11,
      fontWeight: '700',
    },
    value: {
      ...typography.h2,
      color: colors.text,
      fontSize: isDesktop ? 26 : 22,
      marginTop: 6,
      fontWeight: '800',
      letterSpacing: -0.6,
    },
    trend: { ...typography.bodySm, color: colors.primary, marginTop: 8, fontWeight: '700' },
    action: {
      alignItems: 'center',
      flexGrow: 1,
      minWidth: 88,
    },
    actionPressed: { opacity: 0.88, transform: [{ scale: 0.96 }] },
    actionIcon: {
      width: isDesktop ? 80 : 60,
      height: isDesktop ? 80 : 60,
      borderRadius: isDesktop ? radius.xl : radius.lg,
      ...glassSurface(colors, isDesktop),
      borderWidth: 1,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing.sm,
      ...cardShadow(false, colors.primary),
      ...premiumHover(),
    },
    actionIconInner: {
      width: isDesktop ? 52 : 44,
      height: isDesktop ? 52 : 44,
      borderRadius: radius.lg,
      backgroundColor: `${colors.primary}1c`,
      borderWidth: 1,
      borderColor: `${colors.primary}30`,
      alignItems: 'center',
      justifyContent: 'center',
    },
    actionLabel: {
      ...typography.label,
      color: colors.text,
      textAlign: 'center',
      fontSize: isDesktop ? 13 : 12,
      lineHeight: 17,
      fontWeight: '700',
    },
  });
}

export function StatCard({ label, value, icon, trend, accent, onPress, style }: StatCardProps) {
  const { colors } = useAppTheme();
  const { isDesktop } = useResponsiveLayout();
  const styles = useMemo(() => createStyles(colors, isDesktop), [colors, isDesktop]);

  const text = String(value);
  const valueFontSize =
    text.length > 13 ? (isDesktop ? 18 : 16) : text.length > 10 ? (isDesktop ? 20 : 18) : text.length > 8 ? 20 : isDesktop ? 26 : 22;

  const content = (
    <>
      {icon && (
        <View style={styles.iconWrap}>
          <Ionicons name={icon} size={isDesktop ? 24 : 20} color={colors.primary} />
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
          pressed && { opacity: 0.92, transform: [{ scale: 0.98 }] },
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
          <Ionicons name={icon} size={isDesktop ? 26 : 22} color={colors.primary} />
        </View>
      </View>
      <Text style={styles.actionLabel} numberOfLines={2}>
        {label}
      </Text>
    </Pressable>
  );
}
