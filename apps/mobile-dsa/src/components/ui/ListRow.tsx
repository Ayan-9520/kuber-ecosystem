import { Ionicons } from '@expo/vector-icons';
import { useMemo } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { StatusBadge } from './StatusBadge';

import { useResponsiveLayout } from '@/hooks';
import { radius, spacing, typography } from '@/theme';
import { cardShadow } from '@/theme/elevation';
import { glassSurface, premiumHover } from '@/theme/premium';
import { type AppColors, useAppTheme } from '@/theme/ThemeProvider';

interface ListRowProps {
  title: string;
  subtitle?: string;
  status?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
  right?: React.ReactNode;
}

function createStyles(colors: AppColors, isDesktop: boolean) {
  return StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: isDesktop ? spacing.md : spacing.md,
      paddingHorizontal: isDesktop ? spacing.md : 0,
      marginBottom: isDesktop ? spacing.sm : 0,
      borderRadius: isDesktop ? radius.lg : 0,
      gap: spacing.md,
      ...(isDesktop
        ? {
            ...glassSurface(colors, isDesktop),
            borderWidth: 1,
            ...cardShadow(false, colors.primary),
            ...premiumHover(),
          }
        : {
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
          }),
    },
    rowPressed: { opacity: 0.92, transform: [{ scale: 0.995 }] },
    iconWrap: {
      width: isDesktop ? 44 : 36,
      height: isDesktop ? 44 : 36,
      borderRadius: radius.md,
      backgroundColor: `${colors.primary}14`,
      borderWidth: 1,
      borderColor: `${colors.primary}22`,
      alignItems: 'center',
      justifyContent: 'center',
    },
    content: { flex: 1, minWidth: 0 },
    title: {
      ...typography.body,
      color: colors.text,
      fontWeight: '700',
      fontSize: isDesktop ? 15 : 14,
    },
    subtitle: { ...typography.bodySm, color: colors.textMuted, marginTop: 3, lineHeight: 18 },
  });
}

export function ListRow({ title, subtitle, status, icon, onPress, right }: ListRowProps) {
  const { colors } = useAppTheme();
  const { isDesktop } = useResponsiveLayout();
  const styles = useMemo(() => createStyles(colors, isDesktop), [colors, isDesktop]);

  return (
    <Pressable
      style={({ pressed }) => [
        styles.row,
        pressed && onPress && styles.rowPressed,
        Platform.OS === 'web' && onPress && ({ cursor: 'pointer' } as const),
      ]}
      onPress={onPress}
      disabled={!onPress}
    >
      {icon ? (
        <View style={styles.iconWrap}>
          <Ionicons name={icon} size={isDesktop ? 22 : 20} color={colors.primary} />
        </View>
      ) : null}
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={styles.subtitle} numberOfLines={isDesktop ? 2 : 1}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {status ? <StatusBadge status={status} /> : null}
      {right}
      {onPress && !right ? <Ionicons name="chevron-forward" size={18} color={colors.textMuted} /> : null}
    </Pressable>
  );
}
