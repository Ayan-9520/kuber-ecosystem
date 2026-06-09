import { LinearGradient } from 'expo-linear-gradient';
import { useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Button } from '@/components/ui';
import { setOnboardingDone } from '@/lib/storage';
import { colors, spacing, typography } from '@/theme';

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
  const [index, setIndex] = useState(0);
  const listRef = useRef<FlatList>(null);
  const width = Dimensions.get('window').width;

  const finish = async () => {
    await setOnboardingDone();
    onDone();
  };

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const i = Math.round(e.nativeEvent.contentOffset.x / width);
    setIndex(i);
  };

  return (
    <LinearGradient colors={[colors.background, '#0A2228']} style={styles.container}>
      <FlatList
        ref={listRef}
        data={SLIDES}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        keyExtractor={(_, i) => String(i)}
        renderItem={({ item }) => (
          <View style={[styles.slide, { width }]}>
            <Text style={styles.emoji}>{item.emoji}</Text>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.desc}>{item.desc}</Text>
          </View>
        )}
      />
      <View style={styles.footer}>
        <View style={styles.dots}>
          {SLIDES.map((_, i) => (
            <View key={i} style={[styles.dot, i === index && styles.dotActive]} />
          ))}
        </View>
        {index < SLIDES.length - 1 ? (
          <Button
            title="Next"
            fullWidth
            onPress={() => listRef.current?.scrollToIndex({ index: index + 1, animated: true })}
          />
        ) : (
          <Button title="Get Started" fullWidth onPress={finish} />
        )}
        {index < SLIDES.length - 1 && (
          <Button title="Skip" variant="ghost" fullWidth onPress={finish} />
        )}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  slide: { flex: 1, justifyContent: 'center', paddingHorizontal: spacing.xl, paddingTop: 80 },
  emoji: { fontSize: 64, marginBottom: spacing.lg },
  title: { ...typography.h1, color: colors.text, marginBottom: spacing.md },
  desc: { ...typography.body, color: colors.textSecondary },
  footer: { padding: spacing.lg, paddingBottom: spacing.xxl, gap: spacing.sm },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: spacing.md },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.border },
  dotActive: { backgroundColor: colors.primary, width: 24 },
});
