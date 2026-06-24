import { Ionicons } from '@expo/vector-icons';
import { useMemo } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

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
}

function createStyles(colors: AppColors) {
  return StyleSheet.create({
    card: {
      flex: 1,
      minWidth: '45%',
      backgroundColor: colors.card,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: colors.borderLight,
      padding: spacing.md,
      ...cardShadow(),
    },
    cardAccent: {
      borderColor: colors.primary,
      backgroundColor: colors.surface,
    },
    iconWrap: {
      width: 40,
      height: 40,
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
      fontSize: 12,
      fontWeight: '600',
    },
    value: {
      ...typography.h2,
      color: colors.text,
      fontSize: 22,
      marginTop: 4,
      fontWeight: '700',
      letterSpacing: -0.5,
    },
    trend: { ...typography.bodySm, color: colors.primary, marginTop: 6, fontWeight: '600' },
    action: { alignItems: 'center', width: 80 },
    actionPressed: { opacity: 0.88, transform: [{ scale: 0.97 }] },
    actionIcon: {
      width: 60,
      height: 60,
      borderRadius: radius.lg,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.borderLight,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing.sm,
      ...cardShadow(),
    },
    actionIconInner: {
      width: 44,
      height: 44,
      borderRadius: radius.md,
      backgroundColor: `${colors.primary}18`,
      alignItems: 'center',
      justifyContent: 'center',
    },
    actionLabel: {
      ...typography.label,
      color: colors.text,
      textAlign: 'center',
      fontSize: 12,
      lineHeight: 16,
    },
  });
}

export function StatCard({ label, value, icon, trend, accent, onPress }: StatCardProps) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const content = (
    <>
      {icon && (
        <View style={styles.iconWrap}>
          <Ionicons name={icon} size={20} color={colors.primary} />
        </View>
      )}
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
      {trend && <Text style={styles.trend}>{trend}</Text>}
    </>
  );

  if (onPress) {
    return (
      <Pressable
        style={({ pressed }) => [
          styles.card,
          accent && styles.cardAccent,
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

  return <View style={[styles.card, accent && styles.cardAccent]}>{content}</View>;
}

export function QuickAction({
  label,
  icon,
  onPress,
}: {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
}) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <Pressable
      style={({ pressed }) => [
        styles.action,
        pressed && styles.actionPressed,
        Platform.OS === 'web' && ({ cursor: 'pointer' } as const),
      ]}
      onPress={onPress}
    >
      <View style={styles.actionIcon}>
        <View style={styles.actionIconInner}>
          <Ionicons name={icon} size={22} color={colors.primary} />
        </View>
      </View>
      <Text style={styles.actionLabel} numberOfLines={2}>
        {label}
      </Text>
    </Pressable>
  );
}
