import { LinearGradient } from 'expo-linear-gradient';
import { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui';
import { setOnboardingDone } from '@/lib/storage';
import { type AppColors, useAppTheme } from '@/theme/ThemeProvider';
import { spacing, typography } from '@/theme';

const SLIDES = [
  {
    title: 'Grow Your Pipeline',
    desc: 'Submit leads, track status, and convert prospects into sanctioned loans.',
    emoji: '📈',
  },
  {
    title: 'Real-Time Tracking',
    desc: 'Monitor applications from login to disbursement with live timelines.',
    emoji: '🔍',
  },
  {
    title: 'Earn Commissions',
    desc: 'View ledger, payments, pending earnings and recoveries in one place.',
    emoji: '💰',
  },
  {
    title: 'Refer & Support',
    desc: 'Create referrals, manage documents, and escalate support tickets.',
    emoji: '🤝',
  },
];

interface Props {
  onDone: () => void;
}

export function OnboardingScreen({ onDone }: Props) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [index, setIndex] = useState(0);
  const slide = SLIDES[Math.min(index, SLIDES.length - 1)]!;
  const isLast = index >= SLIDES.length - 1;

  const finish = async () => {
    try {
      await setOnboardingDone();
    } catch {
      // Still continue to login if storage write fails on some browsers
    }
    onDone();
  };

  return (
    <LinearGradient colors={[colors.background, '#0A2228']} style={styles.container}>
      <View style={styles.slide}>
        <Text style={styles.emoji}>{slide.emoji}</Text>
        <Text style={styles.title}>{slide.title}</Text>
        <Text style={styles.desc}>{slide.desc}</Text>
      </View>
      <View style={styles.footer}>
        <View style={styles.dots}>
          {SLIDES.map((_, i) => (
            <View key={i} style={[styles.dot, i === index && styles.dotActive]} />
          ))}
        </View>
        {isLast ? (
          <Button title="Get Started" fullWidth onPress={() => void finish()} />
        ) : (
          <Button title="Next" fullWidth onPress={() => setIndex((i) => Math.min(i + 1, SLIDES.length - 1))} />
        )}
        {!isLast ? <Button title="Skip" variant="ghost" fullWidth onPress={() => void finish()} /> : null}
      </View>
    </LinearGradient>
  );
}

function createStyles(colors: AppColors) {
  return StyleSheet.create({
    container: { flex: 1 },
    slide: {
      flex: 1,
      justifyContent: 'center',
      paddingHorizontal: spacing.xl,
      paddingTop: 80,
    },
    emoji: { fontSize: 64, marginBottom: spacing.lg },
    title: { ...typography.h1, color: colors.text, marginBottom: spacing.md },
    desc: { ...typography.body, color: colors.textSecondary },
    footer: { padding: spacing.lg, paddingBottom: spacing.xxl, gap: spacing.sm },
    dots: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: spacing.md },
    dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.border },
    dotActive: { backgroundColor: colors.primary, width: 24 },
  });
}
