import { LinearGradient } from 'expo-linear-gradient';
import { useMemo, type ReactNode } from 'react';
import {
  Image,
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

/** Clear K1 mark — no white plate on dark auth screens */
const logoK1 = require('../../../assets/logo-k1.png');

export type PremiumAuthVariant = 'partner' | 'customer';

const COPY: Record<
  PremiumAuthVariant,
  {
    brand: string;
    title: string;
    subtitle: string;
    badge: string;
    highlights: string[];
    trust: string[];
  }
> = {
  partner: {
    brand: 'KuberOne',
    title: 'Partner Sign In',
    subtitle: 'Sign in with OTP after Admin approval. Same login as the Partner App.',
    badge: 'DSA & Partner Access',
    highlights: ['AI Branding Tools', 'Lead Management', 'Verified Profile'],
    trust: ['RBI Regulated Partners', '100% Transparent', 'Secure OTP Login'],
  },
  customer: {
    brand: 'KuberOne',
    title: 'Customer Sign In',
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
  const styles = useMemo(() => createStyles(variant), [variant]);

  return (
    <LinearGradient
      colors={['#071a1f', '#0d2428', '#102b2e', '#071a1f']}
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
          <View style={[styles.card, contentStyle]}>
            <View style={styles.brandBlock}>
              <Image source={logoK1} style={styles.logoImage} accessibilityLabel={copy.brand} />
              <Text style={styles.brandName}>{copy.brand}</Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{copy.badge}</Text>
              </View>
              <Text style={styles.title}>{copy.title}</Text>
              <Text style={styles.subtitle}>{copy.subtitle}</Text>
            </View>

            <View style={styles.form}>{children}</View>
          </View>

          {footer}

          <View style={styles.highlights}>
            {copy.highlights.map((item) => (
              <View key={item} style={styles.highlightPill}>
                <Text style={styles.highlightText}>{item}</Text>
              </View>
            ))}
          </View>

          <View style={styles.trustRow}>
            {copy.trust.map((item) => (
              <View key={item} style={styles.trustPill}>
                <Text style={styles.trustText}>{item}</Text>
              </View>
            ))}
          </View>

          <Text style={styles.footerBrand}>Powered by KuberFinserve</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

function createStyles(variant: PremiumAuthVariant) {
  const accent = variant === 'partner' ? '#fcd34d' : '#22d3a6';
  const accentBorder = variant === 'partner' ? 'rgba(245, 158, 11, 0.35)' : 'rgba(34, 211, 166, 0.35)';
  const accentBg = variant === 'partner' ? 'rgba(245, 158, 11, 0.14)' : 'rgba(34, 211, 166, 0.12)';

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
      opacity: 0.28,
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
      opacity: 0.18,
    },
    scroll: {
      flexGrow: 1,
      paddingHorizontal: spacing.lg,
      justifyContent: 'center',
      gap: spacing.md,
    },
    card: {
      backgroundColor: 'rgba(16, 43, 46, 0.92)',
      borderRadius: 20,
      padding: spacing.lg,
      borderWidth: 1,
      borderColor: 'rgba(34, 211, 166, 0.22)',
      shadowColor: '#000',
      shadowOpacity: 0.4,
      shadowRadius: 28,
      shadowOffset: { width: 0, height: 16 },
      elevation: 12,
      gap: spacing.lg,
    },
    brandBlock: {
      alignItems: 'center',
      gap: spacing.sm,
    },
    logoImage: {
      width: 72,
      height: 72,
      resizeMode: 'contain',
    },
    brandName: {
      fontSize: 22,
      fontWeight: '800',
      color: '#ffffff',
      letterSpacing: -0.3,
      marginTop: 2,
    },
    badge: {
      alignSelf: 'center',
      backgroundColor: accentBg,
      borderWidth: 1,
      borderColor: accentBorder,
      paddingHorizontal: 12,
      paddingVertical: 5,
      borderRadius: radius.full,
      marginTop: 2,
    },
    badgeText: {
      ...typography.caption,
      color: accent,
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: 0.8,
      fontSize: 10,
    },
    title: {
      fontSize: 24,
      fontWeight: '800',
      color: '#ffffff',
      letterSpacing: -0.4,
      textAlign: 'center',
      marginTop: spacing.sm,
    },
    subtitle: {
      ...typography.bodySm,
      color: 'rgba(199, 210, 217, 0.9)',
      lineHeight: 20,
      textAlign: 'center',
      maxWidth: 320,
    },
    form: {
      gap: spacing.md,
    },
    highlights: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'center',
      gap: spacing.sm,
    },
    highlightPill: {
      backgroundColor: 'rgba(255,255,255,0.06)',
      borderWidth: 1,
      borderColor: 'rgba(34, 211, 166, 0.15)',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: radius.full,
    },
    highlightText: {
      ...typography.caption,
      color: 'rgba(255,255,255,0.85)',
      fontWeight: '600',
    },
    trustRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'center',
      gap: spacing.sm,
    },
    trustPill: {
      backgroundColor: 'rgba(255,255,255,0.04)',
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.08)',
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: radius.full,
    },
    trustText: {
      ...typography.caption,
      color: 'rgba(255,255,255,0.55)',
      fontWeight: '500',
    },
    footerBrand: {
      ...typography.caption,
      textAlign: 'center',
      color: 'rgba(255,255,255,0.4)',
      marginTop: spacing.xs,
    },
  });
}
