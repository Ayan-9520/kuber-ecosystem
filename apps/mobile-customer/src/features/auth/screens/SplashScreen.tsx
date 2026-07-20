import { LinearGradient } from 'expo-linear-gradient';
import { useMemo } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

import { type AppColors, useAppTheme } from '@/theme/ThemeProvider';
import { typography } from '@/theme';

const logoK1 = require('../../../../assets/logo-k1.png');

export function SplashScreen() {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  return (
    <LinearGradient colors={[colors.background, colors.card, colors.background]} style={styles.container}>
      <View style={styles.logo}>
        <Image source={logoK1} style={styles.logoImage} accessibilityLabel="KuberOne" />
      </View>
      <Text style={styles.brand}>KuberOne</Text>
      <Text style={styles.tagline}>Kuber Finserve</Text>
    </LinearGradient>
  );
}

function createStyles(colors: AppColors) {
  return StyleSheet.create({
    container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    logo: {
      width: 88,
      height: 88,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 16,
      backgroundColor: 'transparent',
    },
    logoImage: { width: 88, height: 88, resizeMode: 'contain' },
    brand: { ...typography.h1, color: colors.text },
    tagline: { ...typography.caption, color: colors.textMuted, marginTop: 8 },
  });
}
