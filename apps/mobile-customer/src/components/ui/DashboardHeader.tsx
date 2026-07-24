import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useMemo } from 'react';
import { Image, Platform, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

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

function createStyles(colors: AppColors, isWide: boolean) {
  return StyleSheet.create({
    outer: {
      width: '100%',
      alignItems: 'center',
      marginBottom: spacing.lg,
    },
    wrap: {
      width: '100%',
      maxWidth: isWide ? 1100 : undefined,
      marginHorizontal: isWide ? 0 : spacing.md,
      borderRadius: isWide ? 0 : radius.xl,
      overflow: 'hidden',
      ...(isWide
        ? {}
        : {
            marginTop: spacing.sm,
          }),
    },
    gradient: {
      paddingHorizontal: isWide ? 40 : spacing.lg,
      paddingTop: isWide ? 28 : spacing.lg,
      paddingBottom: isWide ? 36 : spacing.xl,
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
      gap: 12,
      flexShrink: 1,
    },
    logoPlate: {
      width: 52,
      height: 52,
      borderRadius: 14,
      backgroundColor: '#FFFFFF',
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.35)',
    },
    logoImage: {
      width: 40,
      height: 40,
      resizeMode: 'contain',
    },
    brandText: {
      flexShrink: 1,
      gap: 2,
    },
    brandName: {
      color: '#FFFFFF',
      fontSize: isWide ? 22 : 18,
      fontWeight: '800',
      letterSpacing: -0.4,
    },
    brandTag: {
      ...typography.caption,
      color: 'rgba(255,255,255,0.78)',
      letterSpacing: 0.3,
      fontSize: 11,
    },
    actions: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
    iconBtn: {
      width: 42,
      height: 42,
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
    greeting: {
      ...typography.caption,
      color: 'rgba(255,255,255,0.8)',
      letterSpacing: 1.2,
      fontSize: 11,
      fontWeight: '700',
    },
    name: {
      color: '#FFFFFF',
      fontSize: isWide ? 34 : 28,
      fontWeight: '800',
      marginTop: 6,
      letterSpacing: -0.8,
    },
    sub: {
      ...typography.body,
      color: 'rgba(255,255,255,0.9)',
      marginTop: spacing.sm,
      lineHeight: 22,
      maxWidth: 520,
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
  subtitle = 'Your personalised loan & wealth dashboard',
  tagline = 'Premium Finance',
  pills = [
    { icon: 'shield-checkmark', label: 'Secure' },
    { icon: 'flash', label: 'Instant eligibility' },
  ],
}: DashboardHeaderProps) {
  const { colors } = useAppTheme();
  const { width } = useWindowDimensions();
  const isWide = Platform.OS === 'web' && width >= 920;
  const styles = useMemo(() => createStyles(colors, isWide), [colors, isWide]);
  const initials = name.slice(0, 2).toUpperCase();

  // Website-aligned deep green → mint (kuberfinserve brand)
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

          <Text style={styles.greeting}>WELCOME BACK</Text>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.sub}>{subtitle}</Text>

          <View style={styles.pillRow}>
            {pills.map((p) => (
              <View key={p.label} style={styles.pill}>
                <Ionicons name={p.icon} size={14} color="#FFFFFF" />
                <Text style={styles.pillText}>{p.label}</Text>
              </View>
            ))}
          </View>
        </LinearGradient>
      </View>
    </View>
  );
}
