import { LinearGradient } from 'expo-linear-gradient';
import { useMemo, type ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { radius, spacing, typography } from '@/theme';

export type PremiumAuthVariant = 'partner' | 'customer';

const COPY: Record<
  PremiumAuthVariant,
  {
    eyebrow: string;
    title: string;
    subtitle: string;
    badge: string;
    highlights: string[];
    trust: string[];
  }
> = {
  partner: {
    eyebrow: 'Kuber Verified Professional™',
    title: 'Partner Sign In',
    subtitle: 'Build your brand. Grow your business. Create your legacy.',
    badge: 'Verified Partner Access',
    highlights: ['AI Branding Tools', 'Lead Management', 'Verified Profile'],
    trust: ['RBI Regulated Partners', '100% Transparent', 'Secure OTP Login'],
  },
  customer: {
    eyebrow: 'Kuber Finserve',
    title: 'Welcome Back',
    subtitle: 'Loans, insurance & financial services — trusted and transparent.',
    badge: 'Customer Portal',
    highlights: ['Track Applications', 'EMI Calculator', 'Document Vault'],
    trust: ['RBI Regulated', 'Data Protected', 'Secure OTP Login'],
  },
};

interface PremiumAuthShellProps {
  variant: PremiumAuthVariant;
  children: ReactNode;
  footer?: ReactNode;
  contentStyle?: ViewStyle;
}

export function PremiumAuthShell({ variant, children, footer, contentStyle }: PremiumAuthShellProps) {
  const insets = useSafeAreaInsets();
  const copy = COPY[variant];
  const styles = useMemo(() => createStyles(), []);

  return (
    <LinearGradient
      colors={['#0f172a', '#134e4a', '#071a1f']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.root}
    >
      <View style={[styles.glowTop, variant === 'partner' ? styles.glowGold : styles.glowTeal]} />
      <View style={styles.glowBottom} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scroll,
            {
              paddingTop: Math.max(insets.top, spacing.md) + spacing.sm,
              paddingBottom: Math.max(insets.bottom, spacing.md) + spacing.lg,
            },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.hero}>
            <View style={styles.logoRow}>
              <LinearGradient colors={['#22d3a6', '#18c964']} style={styles.logo}>
                <Text style={styles.logoText}>K</Text>
              </LinearGradient>
              <View style={styles.logoMeta}>
                <Text style={styles.eyebrow}>{copy.eyebrow}</Text>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{copy.badge}</Text>
                </View>
              </View>
            </View>

            <Text style={styles.title}>{copy.title}</Text>
            <Text style={styles.subtitle}>{copy.subtitle}</Text>

            <View style={styles.highlights}>
              {copy.highlights.map((item) => (
                <View key={item} style={styles.highlightPill}>
                  <Text style={styles.highlightText}>{item}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={[styles.card, contentStyle]}>{children}</View>

          {footer}

          <View style={styles.trustRow}>
            {copy.trust.map((item) => (
              <View key={item} style={styles.trustPill}>
                <Text style={styles.trustText}>{item}</Text>
              </View>
            ))}
          </View>

          <Text style={styles.footerBrand}>Powered by Kuber Finserve</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

function createStyles() {
  return StyleSheet.create({
    root: { flex: 1 },
    flex: { flex: 1 },
    glowTop: {
      position: 'absolute',
      top: -80,
      right: -40,
      width: 220,
      height: 220,
      borderRadius: 110,
      opacity: 0.35,
    },
    glowGold: { backgroundColor: '#f59e0b' },
    glowTeal: { backgroundColor: '#22d3a6' },
    glowBottom: {
      position: 'absolute',
      bottom: -100,
      left: -60,
      width: 260,
      height: 260,
      borderRadius: 130,
      backgroundColor: '#0d9488',
      opacity: 0.2,
    },
    scroll: {
      flexGrow: 1,
      paddingHorizontal: spacing.lg,
      justifyContent: 'center',
      gap: spacing.lg,
    },
    hero: { gap: spacing.sm },
    logoRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
    logo: {
      width: 52,
      height: 52,
      borderRadius: radius.md,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#000',
      shadowOpacity: 0.25,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 4 },
      elevation: 6,
    },
    logoText: { fontSize: 26, fontWeight: '800', color: '#071a1f' },
    logoMeta: { flex: 1, gap: 6 },
    eyebrow: {
      ...typography.caption,
      color: 'rgba(255,255,255,0.72)',
      textTransform: 'uppercase',
      letterSpacing: 1.2,
      fontWeight: '600',
    },
    badge: {
      alignSelf: 'flex-start',
      backgroundColor: 'rgba(245, 158, 11, 0.18)',
      borderWidth: 1,
      borderColor: 'rgba(245, 158, 11, 0.35)',
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: radius.full,
    },
    badgeText: {
      ...typography.caption,
      color: '#fcd34d',
      fontWeight: '700',
    },
    title: {
      fontSize: 28,
      fontWeight: '800',
      color: '#ffffff',
      letterSpacing: -0.5,
      marginTop: spacing.xs,
    },
    subtitle: {
      ...typography.body,
      color: 'rgba(255,255,255,0.78)',
      lineHeight: 22,
      maxWidth: 340,
    },
    highlights: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.sm,
      marginTop: spacing.sm,
    },
    highlightPill: {
      backgroundColor: 'rgba(255,255,255,0.08)',
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.12)',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: radius.full,
    },
    highlightText: {
      ...typography.caption,
      color: 'rgba(255,255,255,0.9)',
      fontWeight: '600',
    },
    card: {
      backgroundColor: 'rgba(255,255,255,0.96)',
      borderRadius: radius.lg,
      padding: spacing.lg,
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.5)',
      shadowColor: '#000',
      shadowOpacity: 0.18,
      shadowRadius: 24,
      shadowOffset: { width: 0, height: 12 },
      elevation: 10,
      gap: spacing.md,
    },
    trustRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'center',
      gap: spacing.sm,
    },
    trustPill: {
      backgroundColor: 'rgba(255,255,255,0.06)',
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.1)',
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: radius.full,
    },
    trustText: {
      ...typography.caption,
      color: 'rgba(255,255,255,0.65)',
      fontWeight: '500',
    },
    footerBrand: {
      ...typography.caption,
      textAlign: 'center',
      color: 'rgba(255,255,255,0.45)',
      marginTop: spacing.xs,
    },
  });
}
