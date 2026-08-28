import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useMemo, type ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useResponsiveLayout } from '@/hooks';
import { radius, spacing, typography } from '@/theme';
import { type AppColors, useAppTheme } from '@/theme/ThemeProvider';

interface PageHeroProps {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  actions?: ReactNode;
}

function createStyles(colors: AppColors, isDesktop: boolean, pagePad: number) {
  return StyleSheet.create({
    outer: {
      paddingHorizontal: pagePad,
      marginBottom: isDesktop ? spacing.md : spacing.lg,
    },
    /** Desktop: compact page title — no giant gradient banner. */
    desktopRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: spacing.md,
      paddingBottom: spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: colors.borderLight,
    },
    desktopLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 },
    desktopIcon: {
      width: 32,
      height: 32,
      borderRadius: radius.md,
      backgroundColor: `${colors.primary}12`,
      alignItems: 'center',
      justifyContent: 'center',
    },
    desktopTitle: {
      ...typography.h3,
      color: colors.text,
      fontSize: 18,
      fontWeight: '700',
      letterSpacing: -0.3,
    },
    desktopSub: {
      ...typography.bodySm,
      color: colors.textSecondary,
      fontSize: 12,
      marginTop: 2,
    },
    shell: {
      borderRadius: radius.lg,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: `${colors.primary}25`,
    },
    gradient: {
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.lg,
    },
    row: {
      flexDirection: 'column',
      gap: spacing.md,
    },
    left: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
    },
    iconPlate: {
      width: 40,
      height: 40,
      borderRadius: radius.md,
      backgroundColor: 'rgba(255,255,255,0.12)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    copy: { flex: 1, minWidth: 0 },
    eyebrow: {
      ...typography.caption,
      color: 'rgba(255,255,255,0.7)',
      letterSpacing: 1,
      fontWeight: '600',
      fontSize: 10,
      textTransform: 'uppercase',
    },
    title: {
      color: '#FFFFFF',
      fontSize: 22,
      fontWeight: '700',
      letterSpacing: -0.4,
      marginTop: 2,
    },
    subtitle: {
      ...typography.bodySm,
      color: 'rgba(255,255,255,0.85)',
      marginTop: 4,
      fontSize: 13,
      lineHeight: 18,
    },
    actions: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.sm,
      alignItems: 'center',
    },
  });
}

export function PageHero({ title, subtitle, eyebrow, icon, actions }: PageHeroProps) {
  const { colors } = useAppTheme();
  const { isDesktop, pagePad } = useResponsiveLayout();
  const styles = useMemo(() => createStyles(colors, isDesktop, pagePad), [colors, isDesktop, pagePad]);

  if (isDesktop) {
    return (
      <View style={styles.outer}>
        <View style={styles.desktopRow}>
          <View style={styles.desktopLeft}>
            {icon ? (
              <View style={styles.desktopIcon}>
                <Ionicons name={icon} size={16} color={colors.primary} />
              </View>
            ) : null}
            <View style={{ flex: 1, minWidth: 0 }}>
              {eyebrow ? (
                <Text style={[styles.eyebrow, { color: colors.textMuted }]}>{eyebrow}</Text>
              ) : null}
              <Text style={styles.desktopTitle}>{title}</Text>
              {subtitle ? <Text style={styles.desktopSub}>{subtitle}</Text> : null}
            </View>
          </View>
          {actions ? <View style={styles.actions}>{actions}</View> : null}
        </View>
      </View>
    );
  }

  const gradientColors = ['#021a14', '#064a3c', '#00a870'] as const;

  return (
    <View style={styles.outer}>
      <View style={styles.shell}>
        <LinearGradient colors={gradientColors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.gradient}>
          <View style={styles.row}>
            <View style={styles.left}>
              {icon ? (
                <View style={styles.iconPlate}>
                  <Ionicons name={icon} size={20} color="#FFFFFF" />
                </View>
              ) : null}
              <View style={styles.copy}>
                {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
                <Text style={styles.title}>{title}</Text>
                {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
              </View>
            </View>
            {actions ? <View style={styles.actions}>{actions}</View> : null}
          </View>
        </LinearGradient>
      </View>
    </View>
  );
}
