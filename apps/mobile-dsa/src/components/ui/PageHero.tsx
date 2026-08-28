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
      marginBottom: isDesktop ? spacing.xl : spacing.lg,
    },
    shell: {
      borderRadius: isDesktop ? radius.xl : radius.lg,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: `${colors.primary}30`,
    },
    gradient: {
      paddingHorizontal: isDesktop ? 32 : spacing.lg,
      paddingVertical: isDesktop ? 28 : spacing.lg,
    },
    row: {
      flexDirection: isDesktop ? 'row' : 'column',
      alignItems: isDesktop ? 'center' : 'flex-start',
      justifyContent: 'space-between',
      gap: spacing.lg,
    },
    left: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      flex: 1,
      minWidth: 0,
    },
    iconPlate: {
      width: isDesktop ? 56 : 48,
      height: isDesktop ? 56 : 48,
      borderRadius: radius.lg,
      backgroundColor: 'rgba(255,255,255,0.14)',
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.22)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    copy: { flex: 1, minWidth: 0 },
    eyebrow: {
      ...typography.caption,
      color: 'rgba(255,255,255,0.75)',
      letterSpacing: 1.2,
      fontWeight: '700',
      fontSize: 10,
      textTransform: 'uppercase',
    },
    title: {
      color: '#FFFFFF',
      fontSize: isDesktop ? 30 : 24,
      fontWeight: '800',
      letterSpacing: -0.6,
      marginTop: 4,
    },
    subtitle: {
      ...typography.bodySm,
      color: 'rgba(255,255,255,0.88)',
      marginTop: 6,
      fontSize: isDesktop ? 15 : 13,
      lineHeight: 21,
      maxWidth: 560,
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
  const gradientColors = ['#021a14', '#064a3c', '#00a870'] as const;

  return (
    <View style={styles.outer}>
      <View style={styles.shell}>
        <LinearGradient colors={gradientColors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.gradient}>
          <View style={styles.row}>
            <View style={styles.left}>
              {icon ? (
                <View style={styles.iconPlate}>
                  <Ionicons name={icon} size={isDesktop ? 26 : 22} color="#FFFFFF" />
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
