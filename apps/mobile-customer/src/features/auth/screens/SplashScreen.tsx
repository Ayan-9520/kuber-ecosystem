import { LinearGradient } from 'expo-linear-gradient';
import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { type AppColors, useAppTheme } from '@/theme/ThemeProvider';
import { typography } from '@/theme';

export function SplashScreen() {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  return (
    <LinearGradient colors={[colors.background, colors.card, colors.background]} style={styles.container}>
      <View style={styles.logo}>
        <Text style={styles.logoText}>K</Text>
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
    width: 72,
    height: 72,
    borderRadius: 18,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  logoText: { fontSize: 36, fontWeight: '800', color: colors.background },
  brand: { ...typography.h1, color: colors.text },
  tagline: { ...typography.caption, color: colors.textMuted, marginTop: 8 },
});
}
