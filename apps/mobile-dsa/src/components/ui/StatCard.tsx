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
      minWidth: isDesktop ? 120 : 140,
      borderRadius: isDesktop ? radius.md : radius.lg,
      borderWidth: 1,
      padding: isDesktop ? spacing.md : spacing.md,
      flexDirection: isDesktop ? 'row' : 'column',
      alignItems: isDesktop ? 'center' : 'flex-start',
      gap: isDesktop ? spacing.sm : 0,
      ...glassSurface(colors, isDesktop),
      ...cardShadow(false, colors.primary),
      ...premiumHover(),
    },
    cardAccent: {
      borderColor: `${colors.primary}40`,
      backgroundColor: isDesktop ? `${colors.primary}08` : colors.surface,
    },
    iconWrap: {
      width: isDesktop ? 34 : 36,
      height: isDesktop ? 34 : 36,
      borderRadius: radius.sm,
      backgroundColor: `${colors.primary}14`,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: isDesktop ? 0 : spacing.sm,
      flexShrink: 0,
    },
    body: { flex: 1, minWidth: 0 },
    label: {
      ...typography.caption,
      color: colors.textSecondary,
      textTransform: isDesktop ? 'none' : 'uppercase',
      letterSpacing: isDesktop ? 0 : 0.4,
      fontSize: 11,
      fontWeight: '600',
    },
    value: {
      color: colors.text,
      fontSize: isDesktop ? 18 : 20,
      marginTop: 2,
      fontWeight: '700',
      letterSpacing: -0.4,
    },
    trend: { ...typography.bodySm, color: colors.primary, marginTop: 4, fontWeight: '600', fontSize: 11 },
    action: {
      alignItems: 'center',
      flexGrow: 0,
      flexBasis: isDesktop ? 'auto' : undefined,
      minWidth: isDesktop ? undefined : 72,
    },
    actionPressed: { opacity: 0.88 },
    actionPill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingVertical: isDesktop ? 8 : 0,
      paddingHorizontal: isDesktop ? 12 : 0,
      borderRadius: radius.md,
      borderWidth: isDesktop ? 1 : 0,
      borderColor: `${colors.primary}25`,
      backgroundColor: isDesktop ? colors.card : 'transparent',
      ...premiumHover(),
    },
    actionIconOnly: {
      width: isDesktop ? 28 : 52,
      height: isDesktop ? 28 : 52,
      borderRadius: isDesktop ? radius.sm : radius.md,
      backgroundColor: `${colors.primary}12`,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: isDesktop ? 0 : spacing.xs,
    },
    actionLabel: {
      ...typography.label,
      color: colors.text,
      fontSize: isDesktop ? 12 : 11,
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
    text.length > 13 ? 14 : text.length > 10 ? 16 : text.length > 8 ? 17 : isDesktop ? 18 : 20;

  const content = (
    <>
      {icon && (
        <View style={styles.iconWrap}>
          <Ionicons name={icon} size={isDesktop ? 16 : 18} color={colors.primary} />
        </View>
      )}
      <View style={styles.body}>
        <Text style={styles.label} numberOfLines={1}>
          {label}
        </Text>
        <Text style={[styles.value, { fontSize: valueFontSize }]} numberOfLines={1} adjustsFontSizeToFit>
          {text}
        </Text>
        {trend ? (
          <Text style={styles.trend} numberOfLines={1}>
            {trend}
          </Text>
        ) : null}
      </View>
    </>
  );

  if (onPress) {
    return (
      <Pressable
        style={({ pressed }) => [
          styles.card,
          accent && styles.cardAccent,
          style,
          pressed && { opacity: 0.92 },
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
      <View style={[styles.actionPill, { borderColor: colors.borderLight, backgroundColor: colors.card }]}>
        <View style={styles.actionIconOnly}>
          <Ionicons name={icon} size={isDesktop ? 15 : 20} color={colors.primary} />
        </View>
        <Text style={styles.actionLabel} numberOfLines={1}>
          {label}
        </Text>
      </View>
    </Pressable>
  );
}
