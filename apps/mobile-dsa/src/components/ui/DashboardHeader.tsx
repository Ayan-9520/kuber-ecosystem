import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { radius, spacing, typography } from '@/theme';
import { type AppColors, useAppTheme } from '@/theme/ThemeProvider';

interface DashboardHeaderProps {
  name: string;
  unreadCount?: number;
  onNotificationsPress?: () => void;
  onProfilePress?: () => void;
}

function createStyles(colors: AppColors) {
  return StyleSheet.create({
    wrap: {
      marginHorizontal: spacing.md,
      marginTop: spacing.sm,
      marginBottom: spacing.lg,
      borderRadius: radius.xl,
      overflow: 'hidden',
    },
    gradient: {
      padding: spacing.lg,
      paddingBottom: spacing.xl,
    },
    topRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: spacing.lg,
    },
    brand: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    logo: {
      width: 36,
      height: 36,
      borderRadius: radius.md,
      backgroundColor: 'rgba(255,255,255,0.18)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    logoText: {
      ...typography.label,
      color: '#FFFFFF',
      fontWeight: '800',
      letterSpacing: 0.5,
    },
    brandName: {
      ...typography.label,
      color: 'rgba(255,255,255,0.92)',
      fontSize: 14,
      fontWeight: '700',
    },
    brandTag: {
      ...typography.caption,
      color: 'rgba(255,255,255,0.72)',
      textTransform: 'none',
      letterSpacing: 0.2,
      fontSize: 11,
    },
    actions: { flexDirection: 'row', gap: spacing.sm },
    iconBtn: {
      width: 40,
      height: 40,
      borderRadius: radius.full,
      backgroundColor: 'rgba(255,255,255,0.14)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    badge: {
      position: 'absolute',
      top: 6,
      right: 6,
      minWidth: 16,
      height: 16,
      borderRadius: 8,
      backgroundColor: colors.warning,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 4,
    },
    badgeText: { color: '#FFFFFF', fontSize: 9, fontWeight: '700' },
    greeting: {
      ...typography.caption,
      color: 'rgba(255,255,255,0.78)',
      textTransform: 'none',
      letterSpacing: 0.8,
      fontSize: 12,
    },
    name: {
      ...typography.h1,
      color: '#FFFFFF',
      fontSize: 28,
      marginTop: 4,
      letterSpacing: -0.8,
    },
    sub: {
      ...typography.body,
      color: 'rgba(255,255,255,0.88)',
      marginTop: spacing.sm,
      lineHeight: 22,
    },
    pillRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.sm,
      marginTop: spacing.lg,
    },
    pill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: radius.full,
      backgroundColor: 'rgba(255,255,255,0.14)',
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.2)',
    },
    pillText: {
      ...typography.label,
      color: '#FFFFFF',
      fontSize: 12,
    },
    avatar: {
      width: 44,
      height: 44,
      borderRadius: radius.full,
      backgroundColor: 'rgba(255,255,255,0.22)',
      borderWidth: 2,
      borderColor: 'rgba(255,255,255,0.35)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarText: {
      ...typography.label,
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '700',
    },
  });
}

export function DashboardHeader({
  name,
  unreadCount = 0,
  onNotificationsPress,
  onProfilePress,
}: DashboardHeaderProps) {
  const { colors, resolved } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const initials = name.slice(0, 2).toUpperCase();

  const gradientColors =
    resolved === 'dark'
      ? (['#0A2E2A', '#0F3D38', '#071A1F'] as const)
      : (['#0D5C52', '#0F766E', '#14B8A6'] as const);

  return (
    <View style={styles.wrap}>
      <LinearGradient colors={gradientColors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.gradient}>
        <View style={styles.topRow}>
          <View style={styles.brand}>
            <View style={styles.logo}>
              <Text style={styles.logoText}>K</Text>
            </View>
            <View>
              <Text style={styles.brandName}>KuberOne DSA</Text>
              <Text style={styles.brandTag}>Partner Command Center</Text>
            </View>
          </View>
          <View style={styles.actions}>
            <Pressable style={styles.iconBtn} onPress={onNotificationsPress} accessibilityLabel="Notifications">
              <Ionicons name="notifications-outline" size={20} color="#FFFFFF" />
              {unreadCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
                </View>
              )}
            </Pressable>
            <Pressable style={styles.avatar} onPress={onProfilePress} accessibilityLabel="Profile">
              <Text style={styles.avatarText}>{initials}</Text>
            </Pressable>
          </View>
        </View>

        <Text style={styles.greeting}>WELCOME BACK</Text>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.sub}>Leads, commissions & pipeline — all in one place</Text>

        <View style={styles.pillRow}>
          <View style={styles.pill}>
            <Ionicons name="briefcase" size={14} color="#FFFFFF" />
            <Text style={styles.pillText}>DSA Partner</Text>
          </View>
          <View style={styles.pill}>
            <Ionicons name="trending-up" size={14} color="#FFFFFF" />
            <Text style={styles.pillText}>Live pipeline</Text>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}
