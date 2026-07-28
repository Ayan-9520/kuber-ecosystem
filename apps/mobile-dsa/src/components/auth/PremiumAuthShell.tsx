import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useMemo, useRef, type ReactNode } from 'react';
import {
  Animated,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { spacing, typography } from '@/theme';

const logoK1 = require('../../../assets/logo-k1.png');

export type PremiumAuthVariant = 'partner' | 'customer';

const COPY: Record<
  PremiumAuthVariant,
  {
    brand: string;
    title: string;
    subtitle: string;
    badge: string;
    headline: string;
    support: string;
    points: string[];
  }
> = {
  partner: {
    brand: 'KuberOne',
    title: 'Partner Sign In',
    subtitle: 'Secure OTP access for verified Financial Partners.',
    badge: 'Partner Portal',
    headline: 'Grow with KuberOne',
    support: 'Lead tools, branding, and payouts — one secure partner workspace.',
    points: ['Verified partner profile', 'Lead & application desk', 'AI branding studio'],
  },
  customer: {
    brand: 'KuberOne',
    title: 'Customer Sign In',
    subtitle: 'Loans, insurance & financial services — trusted and transparent.',
    badge: 'Customer Portal',
    headline: 'Finance, simplified',
    support: 'Track applications, manage documents, and stay in control.',
    points: ['Application tracking', 'EMI tools', 'Secure document vault'],
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
  const { width } = useWindowDimensions();
  const copy = COPY[variant];
  const isWide = Platform.OS === 'web' && width >= 920;
  const styles = useMemo(() => createStyles(variant, isWide), [variant, isWide]);
  const fade = useRef(new Animated.Value(0)).current;
  const rise = useRef(new Animated.Value(18)).current;

  useEffect(() => {
    const useNativeDriver = Platform.OS !== 'web';
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 520, useNativeDriver }),
      Animated.timing(rise, { toValue: 0, duration: 520, useNativeDriver }),
    ]).start();
  }, [fade, rise]);

  const brandPanel = (
    <LinearGradient
      colors={['#032820', '#0B5D4B', '#053d32']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.brandPanel}
    >
      <View style={styles.logoPlate}>
        <Image source={logoK1} style={styles.logoHero} accessibilityLabel={copy.brand} />
      </View>
      <Text style={styles.brandName}>{copy.brand}</Text>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>{copy.badge}</Text>
      </View>
      <Text style={styles.headline}>{copy.headline}</Text>
      <Text style={styles.support}>{copy.support}</Text>
      <View style={styles.pointList}>
        {copy.points.map((item) => (
          <View key={item} style={styles.pointRow}>
            <View style={styles.pointDot} />
            <Text style={styles.pointText}>{item}</Text>
          </View>
        ))}
      </View>
      <Text style={styles.footerBrand}>Powered by KuberFinserve</Text>
    </LinearGradient>
  );

  const formPanel = (
    <View style={[styles.formPanel, contentStyle]}>
      {!isWide ? (
        <View style={styles.mobileBrand}>
          <View style={styles.logoPlateMobile}>
            <Image source={logoK1} style={styles.logoMobile} accessibilityLabel={copy.brand} />
          </View>
          <Text style={styles.brandNameMobile}>{copy.brand}</Text>
          <View style={[styles.badge, styles.badgeCenter]}>
            <Text style={styles.badgeText}>{copy.badge}</Text>
          </View>
        </View>
      ) : null}
      <Text style={styles.formTitle}>{copy.title}</Text>
      <Text style={styles.formSubtitle}>{copy.subtitle}</Text>
      <View style={styles.formBody}>{children}</View>
      {footer}
    </View>
  );

  return (
    <LinearGradient
      colors={['#F4F7F6', '#E8F5F0', '#F4F7F6']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.root}
    >
      <View style={[styles.orb, styles.orbTop]} />
      <View style={[styles.orb, styles.orbBottom]} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scroll,
            {
              paddingTop: Math.max(insets.top, spacing.md),
              paddingBottom: Math.max(insets.bottom, spacing.lg),
            },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Animated.View
            style={[
              styles.stage,
              isWide ? styles.stageWide : styles.stageNarrow,
              { opacity: fade, transform: [{ translateY: rise }] },
            ]}
          >
            {isWide ? brandPanel : null}
            {formPanel}
            {!isWide ? <Text style={styles.footerBrandMobile}>Powered by KuberFinserve</Text> : null}
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

function createStyles(variant: PremiumAuthVariant, isWide: boolean) {
  const accent = variant === 'partner' ? '#D4A017' : '#00C389';
  const accentSoft = variant === 'partner' ? 'rgba(212, 160, 23, 0.18)' : 'rgba(0, 195, 137, 0.14)';

  return StyleSheet.create({
    root: { flex: 1 },
    flex: { flex: 1 },
    orb: {
      position: 'absolute',
      borderRadius: 999,
    },
    orbTop: {
      top: -140,
      right: -90,
      width: 340,
      height: 340,
      backgroundColor: '#00C389',
      opacity: 0.12,
    },
    orbBottom: {
      bottom: -160,
      left: -110,
      width: 380,
      height: 380,
      backgroundColor: '#0B5D4B',
      opacity: 0.1,
    },
    scroll: {
      flexGrow: 1,
      justifyContent: 'center',
      paddingHorizontal: isWide ? 40 : spacing.lg,
    },
    stage: {
      width: '100%',
      maxWidth: isWide ? 1040 : 440,
      alignSelf: 'center',
    },
    stageWide: {
      flexDirection: 'row',
      alignItems: 'stretch',
      minHeight: 560,
      borderRadius: 28,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: '#D7E5DF',
      backgroundColor: '#FFFFFF',
      shadowColor: '#032820',
      shadowOpacity: 0.1,
      shadowRadius: 28,
      shadowOffset: { width: 0, height: 16 },
      elevation: 8,
    },
    stageNarrow: {
      gap: spacing.lg,
    },
    brandPanel: {
      flex: 1.05,
      paddingVertical: 48,
      paddingHorizontal: 44,
      justifyContent: 'center',
      gap: 10,
    },
    logoPlate: {
      width: 96,
      height: 96,
      borderRadius: 22,
      backgroundColor: '#FFFFFF',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 8,
    },
    logoHero: {
      width: 72,
      height: 72,
      resizeMode: 'contain',
    },
    logoPlateMobile: {
      width: 76,
      height: 76,
      borderRadius: 18,
      backgroundColor: '#FFFFFF',
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: '#D7E5DF',
    },
    brandName: {
      fontSize: 34,
      fontWeight: '800',
      color: '#ffffff',
      letterSpacing: -0.8,
    },
    badge: {
      alignSelf: 'flex-start',
      marginTop: 4,
      marginBottom: 8,
      paddingHorizontal: 12,
      paddingVertical: 5,
      borderRadius: 999,
      backgroundColor: accentSoft,
    },
    badgeCenter: {
      alignSelf: 'center',
      backgroundColor: 'rgba(0, 195, 137, 0.12)',
    },
    badgeText: {
      color: accent,
      fontSize: 11,
      fontWeight: '700',
      letterSpacing: 1.1,
      textTransform: 'uppercase',
    },
    headline: {
      marginTop: 12,
      fontSize: 28,
      lineHeight: 34,
      fontWeight: '700',
      color: 'rgba(255,255,255,0.98)',
      letterSpacing: -0.4,
      maxWidth: 360,
    },
    support: {
      ...typography.body,
      color: 'rgba(232, 245, 240, 0.88)',
      lineHeight: 24,
      maxWidth: 360,
      marginTop: 4,
    },
    pointList: {
      marginTop: 22,
      gap: 12,
    },
    pointRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    pointDot: {
      width: 7,
      height: 7,
      borderRadius: 4,
      backgroundColor: accent,
    },
    pointText: {
      fontSize: 14,
      color: 'rgba(255, 255, 255, 0.92)',
      fontWeight: '500',
    },
    footerBrand: {
      marginTop: 28,
      fontSize: 12,
      color: 'rgba(255,255,255,0.45)',
      letterSpacing: 0.2,
    },
    formPanel: {
      flex: 1,
      paddingVertical: isWide ? 44 : spacing.xl,
      paddingHorizontal: isWide ? 40 : spacing.lg,
      backgroundColor: '#FFFFFF',
      borderRadius: isWide ? 0 : 24,
      borderWidth: isWide ? 0 : 1,
      borderColor: '#D7E5DF',
      gap: spacing.md,
      ...(isWide
        ? {}
        : {
            shadowColor: '#032820',
            shadowOpacity: 0.08,
            shadowRadius: 20,
            shadowOffset: { width: 0, height: 10 },
            elevation: 4,
          }),
    },
    mobileBrand: {
      alignItems: 'center',
      gap: 6,
      marginBottom: 4,
    },
    logoMobile: {
      width: 68,
      height: 68,
      resizeMode: 'contain',
    },
    brandNameMobile: {
      fontSize: 24,
      fontWeight: '800',
      color: '#032820',
      letterSpacing: -0.4,
    },
    formTitle: {
      fontSize: isWide ? 26 : 22,
      fontWeight: '800',
      color: '#032820',
      letterSpacing: -0.4,
      textAlign: isWide ? 'left' : 'center',
    },
    formSubtitle: {
      ...typography.bodySm,
      color: '#3D5A52',
      lineHeight: 21,
      textAlign: isWide ? 'left' : 'center',
      marginTop: -4,
      marginBottom: 4,
    },
    formBody: {
      gap: spacing.md,
      marginTop: 4,
    },
    footerBrandMobile: {
      textAlign: 'center',
      fontSize: 12,
      color: '#6B857C',
    },
  });
}
