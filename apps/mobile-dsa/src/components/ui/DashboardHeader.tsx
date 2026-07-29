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

function createStyles(colors: AppColors, isDesktop: boolean, contentMaxWidth: number | undefined, pagePad: number) {
  return StyleSheet.create({
    outer: {
      width: '100%',
      alignItems: 'center',
      marginBottom: isDesktop ? spacing.xl : spacing.lg,
      paddingHorizontal: isDesktop ? pagePad : spacing.md,
    },
    wrap: {
      width: '100%',
      maxWidth: contentMaxWidth,
      borderRadius: radius.xl,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.08)',
      marginTop: isDesktop ? spacing.md : spacing.sm,
    },
    gradient: {
      paddingHorizontal: isDesktop ? 40 : spacing.lg,
      paddingTop: isDesktop ? 32 : spacing.lg,
      paddingBottom: isDesktop ? 40 : spacing.xl,
    },
    topRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: isDesktop ? spacing.xl : spacing.lg,
    },
    brand: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      flexShrink: 1,
    },
    logoPlate: {
      width: isDesktop ? 56 : 52,
      height: isDesktop ? 56 : 52,
      borderRadius: 14,
      backgroundColor: '#FFFFFF',
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.35)',
    },
    logoImage: {
      width: isDesktop ? 44 : 40,
      height: isDesktop ? 44 : 40,
      resizeMode: 'contain',
    },
    brandText: {
      flexShrink: 1,
      gap: 2,
    },
    brandName: {
      color: '#FFFFFF',
      fontSize: isDesktop ? 24 : 18,
      fontWeight: '800',
      letterSpacing: -0.4,
    },
    brandTag: {
      ...typography.caption,
      color: 'rgba(255,255,255,0.78)',
      letterSpacing: 0.3,
      fontSize: isDesktop ? 12 : 11,
    },
    actions: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
    iconBtn: {
      width: 44,
      height: 44,
      borderRadius: radius.full,
      backgroundColor: 'rgba(255,255,255,0.14)',
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.16)',
    },
    badge: {
      position: 'absolute',
      top: 4,
      right: 4,
      minWidth: 16,
      height: 16,
      borderRadius: 8,
      backgroundColor: colors.warning,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 4,
    },
    badgeText: { color: '#FFFFFF', fontSize: 9, fontWeight: '700' },
    heroBody: {
      flexDirection: isDesktop ? 'row' : 'column',
      alignItems: isDesktop ? 'flex-end' : 'flex-start',
      justifyContent: 'space-between',
      gap: spacing.lg,
    },
    heroCopy: { flex: 1, minWidth: 0 },
    greeting: {
      ...typography.caption,
      color: 'rgba(255,255,255,0.8)',
      letterSpacing: 1.2,
      fontSize: 11,
      fontWeight: '700',
    },
    name: {
      color: '#FFFFFF',
      fontSize: isDesktop ? 40 : 28,
      fontWeight: '800',
      marginTop: 6,
      letterSpacing: -0.8,
    },
    sub: {
      ...typography.body,
      color: 'rgba(255,255,255,0.9)',
      marginTop: spacing.sm,
      lineHeight: 22,
      maxWidth: isDesktop ? 560 : 520,
      fontSize: isDesktop ? 16 : 14,
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
      paddingHorizontal: 12,
      paddingVertical: 7,
      borderRadius: radius.full,
      backgroundColor: 'rgba(255,255,255,0.12)',
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.18)',
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
      backgroundColor: 'rgba(255,255,255,0.2)',
      borderWidth: 2,
      borderColor: 'rgba(255,255,255,0.4)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarText: {
      ...typography.label,
      color: '#FFFFFF',
      fontSize: 15,
      fontWeight: '700',
    },
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
  const { isDesktop, contentMaxWidth, pagePad } = useResponsiveLayout();
  const styles = useMemo(
    () => createStyles(colors, isDesktop, contentMaxWidth, pagePad),
    [colors, isDesktop, contentMaxWidth, pagePad],
  );
  const initials = name.slice(0, 2).toUpperCase();
  const gradientColors = ['#032820', '#0B5D4B', '#00C389'] as const;

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

          <View style={styles.heroBody}>
            <View style={styles.heroCopy}>
              <Text style={styles.greeting}>WELCOME BACK</Text>
              <Text style={styles.name}>{name}</Text>
              <Text style={styles.sub}>{subtitle}</Text>
            </View>
            <View style={styles.pillRow}>
              {pills.map((p) => (
                <View key={p.label} style={styles.pill}>
                  <Ionicons name={p.icon} size={14} color="#FFFFFF" />
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
