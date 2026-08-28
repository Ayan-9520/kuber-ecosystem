import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useMemo } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { useResponsiveLayout } from '@/hooks';
import { radius, spacing, typography } from '@/theme';
import { type AppColors, useAppTheme } from '@/theme/ThemeProvider';

const logoK1 = require('../../../assets/logo-k1.png');

interface DashboardHeaderProps {
  name: string;
  unreadCount?: number;
  onNotificationsPress?: () => void;
  onProfilePress?: () => void;
  subtitle?: string;
  pills?: Array<{ icon: keyof typeof Ionicons.glyphMap; label: string }>;
  tagline?: string;
}

function createStyles(colors: AppColors, isDesktop: boolean, pagePad: number) {
  return StyleSheet.create({
    outer: {
      width: '100%',
      paddingHorizontal: isDesktop ? pagePad : spacing.md,
      marginBottom: isDesktop ? spacing.md : spacing.lg,
    },
    desktopBar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingBottom: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.borderLight,
      gap: spacing.md,
    },
    desktopCopy: { flex: 1, minWidth: 0 },
    desktopGreeting: {
      ...typography.caption,
      color: colors.textMuted,
      fontSize: 11,
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: 0.8,
    },
    desktopName: {
      color: colors.text,
      fontSize: 20,
      fontWeight: '700',
      letterSpacing: -0.4,
      marginTop: 2,
    },
    desktopSub: {
      ...typography.bodySm,
      color: colors.textSecondary,
      fontSize: 12,
      marginTop: 2,
    },
    desktopActions: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
    desktopIconBtn: {
      width: 34,
      height: 34,
      borderRadius: radius.md,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.borderLight,
      alignItems: 'center',
      justifyContent: 'center',
    },
    wrap: {
      borderRadius: radius.lg,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.08)',
    },
    gradient: {
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.lg,
      paddingBottom: spacing.xl,
    },
    topRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: spacing.lg,
    },
    brand: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    logoPlate: {
      width: 44,
      height: 44,
      borderRadius: 12,
      backgroundColor: '#FFFFFF',
      alignItems: 'center',
      justifyContent: 'center',
    },
    logoImage: { width: 34, height: 34, resizeMode: 'contain' },
    brandText: { gap: 2 },
    brandName: { color: '#FFFFFF', fontSize: 17, fontWeight: '800' },
    brandTag: { ...typography.caption, color: 'rgba(255,255,255,0.75)', fontSize: 11 },
    actions: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
    iconBtn: {
      width: 36,
      height: 36,
      borderRadius: radius.full,
      backgroundColor: 'rgba(255,255,255,0.12)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    badge: {
      position: 'absolute',
      top: 2,
      right: 2,
      minWidth: 14,
      height: 14,
      borderRadius: 7,
      backgroundColor: colors.warning,
      alignItems: 'center',
      justifyContent: 'center',
    },
    badgeText: { color: '#FFFFFF', fontSize: 8, fontWeight: '700' },
    heroBody: { gap: spacing.md },
    greeting: {
      ...typography.caption,
      color: 'rgba(255,255,255,0.75)',
      letterSpacing: 1,
      fontSize: 10,
      fontWeight: '700',
    },
    name: { color: '#FFFFFF', fontSize: 24, fontWeight: '800', marginTop: 4 },
    sub: { ...typography.bodySm, color: 'rgba(255,255,255,0.88)', marginTop: 6, fontSize: 13 },
    pillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginTop: spacing.sm },
    pill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: radius.full,
      backgroundColor: 'rgba(255,255,255,0.1)',
    },
    pillText: { ...typography.label, color: '#FFFFFF', fontSize: 11 },
    avatar: {
      width: 36,
      height: 36,
      borderRadius: radius.full,
      backgroundColor: 'rgba(255,255,255,0.18)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarText: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
  });
}

export function DashboardHeader({
  name,
  unreadCount = 0,
  onNotificationsPress,
  onProfilePress,
  subtitle = 'Leads, commissions & pipeline — all in one place',
  tagline = 'Partner Command Center',
  pills = [
    { icon: 'briefcase', label: 'DSA Partner' },
    { icon: 'trending-up', label: 'Live pipeline' },
  ],
}: DashboardHeaderProps) {
  const { colors } = useAppTheme();
  const { isDesktop, pagePad } = useResponsiveLayout();
  const styles = useMemo(() => createStyles(colors, isDesktop, pagePad), [colors, isDesktop, pagePad]);
  const initials = name.slice(0, 2).toUpperCase();

  if (isDesktop) {
    return (
      <View style={styles.outer}>
        <View style={styles.desktopBar}>
          <View style={styles.desktopCopy}>
            <Text style={styles.desktopGreeting}>Dashboard</Text>
            <Text style={styles.desktopName}>{name}</Text>
            <Text style={styles.desktopSub} numberOfLines={1}>
              {subtitle}
            </Text>
          </View>
          <View style={styles.desktopActions}>
            {pills.slice(0, 2).map((p) => (
              <View
                key={p.label}
                style={[styles.pill, { backgroundColor: `${colors.primary}10`, borderWidth: 1, borderColor: `${colors.primary}25` }]}
              >
                <Ionicons name={p.icon} size={12} color={colors.primary} />
                <Text style={[styles.pillText, { color: colors.textSecondary, fontSize: 11 }]}>{p.label}</Text>
              </View>
            ))}
            <Pressable
              style={styles.desktopIconBtn}
              onPress={onNotificationsPress}
              accessibilityLabel="Notifications"
            >
              <Ionicons name="notifications-outline" size={17} color={colors.textSecondary} />
              {unreadCount > 0 ? (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
                </View>
              ) : null}
            </Pressable>
          </View>
        </View>
      </View>
    );
  }

  const gradientColors = ['#021a14', '#064a3c', '#00a870'] as const;

  return (
    <View style={styles.outer}>
      <View style={styles.wrap}>
        <LinearGradient colors={gradientColors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.gradient}>
          <View style={styles.topRow}>
            <View style={styles.brand}>
              <View style={styles.logoPlate}>
                <Image source={logoK1} style={styles.logoImage} accessibilityLabel="KuberOne" />
              </View>
              <View style={styles.brandText}>
                <Text style={styles.brandName}>KuberOne</Text>
                <Text style={styles.brandTag}>{tagline}</Text>
              </View>
            </View>
            <View style={styles.actions}>
              <Pressable style={styles.iconBtn} onPress={onNotificationsPress} accessibilityLabel="Notifications">
                <Ionicons name="notifications-outline" size={18} color="#FFFFFF" />
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
          <View style={styles.heroBody}>
            <Text style={styles.greeting}>WELCOME BACK</Text>
            <Text style={styles.name}>{name}</Text>
            <Text style={styles.sub}>{subtitle}</Text>
            <View style={styles.pillRow}>
              {pills.map((p) => (
                <View key={p.label} style={styles.pill}>
                  <Ionicons name={p.icon} size={12} color="#FFFFFF" />
                  <Text style={styles.pillText}>{p.label}</Text>
                </View>
              ))}
            </View>
          </View>
        </LinearGradient>
      </View>
    </View>
  );
}
