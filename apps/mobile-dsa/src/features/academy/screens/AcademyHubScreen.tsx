import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { type NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import {
  ACADEMY_LEVELS,
  ACADEMY_MODULES,
  PARTNER_ACADEMY_STATS,
} from '@/features/academy/data/academy';
import { Card, Screen, StatCard } from '@/components/ui';
import type { AcademyStackParamList } from '@/navigation/types';
import { radius, spacing, typography } from '@/theme';
import { useAppTheme } from '@/theme/ThemeProvider';

export function AcademyHubScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<AcademyStackParamList>>();
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const stats = PARTNER_ACADEMY_STATS;

  return (
    <Screen scroll title="Partner Academy" subtitle="Learn · Earn · Grow">
      <View style={styles.banner}>
        <Text style={[styles.bannerTitle, { color: colors.primary }]}>KuberOne Academy</Text>
        <Text style={[styles.bannerSub, { color: colors.textSecondary }]}>
          Courses, CRM training, certificates and AI tools for partners
        </Text>
      </View>

      <View style={styles.statRow}>
        <StatCard label="Progress" value={`${stats.learningProgress}%`} icon="school" accent />
        <StatCard label="Certificates" value={stats.certificates} icon="ribbon" />
      </View>
      <View style={styles.statRow}>
        <StatCard label="Hours" value={`${stats.learningHours}h`} icon="time" />
        <StatCard label="Rank" value={`#${stats.partnerRank}`} icon="trophy" />
      </View>

      <Card title="Continue learning" subtitle={stats.continueCourse} elevated>
        <Pressable
          style={[styles.primaryBtn, { backgroundColor: colors.primary }]}
          onPress={() => navigation.navigate('AcademyModule', { moduleId: 'learning' })}
        >
          <Text style={styles.primaryBtnText}>Open My Learning</Text>
        </Pressable>
      </Card>

      <Text style={[styles.sectionTitle, { color: colors.text }]}>Academy modules</Text>
      <Text style={[styles.sectionSub, { color: colors.textSecondary }]}>
        Tap any module to open it
      </Text>

      {ACADEMY_MODULES.map((mod) => (
        <Pressable
          key={mod.id}
          onPress={() => navigation.navigate('AcademyModule', { moduleId: mod.id })}
          style={[styles.moduleRow, { backgroundColor: colors.card, borderColor: colors.border }]}
        >
          <View style={[styles.moduleIcon, { backgroundColor: `${colors.primary}18` }]}>
            <Ionicons name={mod.icon as keyof typeof Ionicons.glyphMap} size={20} color={colors.primary} />
          </View>
          <View style={styles.moduleBody}>
            <Text style={[styles.moduleTitle, { color: colors.text }]}>{mod.title}</Text>
            <Text style={[styles.moduleDesc, { color: colors.textSecondary }]}>{mod.description}</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
        </Pressable>
      ))}

      <Card title="Roadmap snapshot" subtitle="Levels 1–10">
        {ACADEMY_LEVELS.slice(0, 4).map((level) => (
          <View key={level.id} style={styles.levelRow}>
            <Text style={[styles.levelLabel, { color: colors.text }]}>
              L{level.id} {level.title}
            </Text>
            <View style={[styles.progressTrack, { backgroundColor: colors.border }]}>
              <View
                style={[styles.progressFill, { width: `${level.progress}%`, backgroundColor: colors.primary }]}
              />
            </View>
          </View>
        ))}
        <Pressable onPress={() => navigation.navigate('AcademyModule', { moduleId: 'learning' })}>
          <Text style={{ color: colors.primary, fontWeight: '700', marginTop: spacing.sm }}>
            View full roadmap →
          </Text>
        </Pressable>
      </Card>
    </Screen>
  );
}

function createStyles(_colors: ReturnType<typeof useAppTheme>['colors']) {
  return StyleSheet.create({
    banner: {
      marginBottom: spacing.md,
      paddingBottom: spacing.sm,
    },
    bannerTitle: {
      ...typography.h3,
      fontWeight: '800',
    },
    bannerSub: {
      ...typography.bodySm,
      marginTop: 4,
    },
    statRow: {
      flexDirection: 'row',
      gap: spacing.sm,
      marginBottom: spacing.sm,
    },
    primaryBtn: {
      marginTop: spacing.sm,
      borderRadius: radius.lg,
      paddingVertical: spacing.md,
      alignItems: 'center',
    },
    primaryBtnText: {
      color: _colors.onPrimary,
      fontWeight: '700',
      fontSize: 15,
    },
    sectionTitle: {
      ...typography.h3,
      fontWeight: '700',
      marginTop: spacing.lg,
    },
    sectionSub: {
      ...typography.bodySm,
      marginBottom: spacing.sm,
    },
    moduleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      padding: spacing.md,
      borderRadius: radius.lg,
      borderWidth: StyleSheet.hairlineWidth,
      marginBottom: spacing.sm,
    },
    moduleIcon: {
      width: 40,
      height: 40,
      borderRadius: radius.md,
      alignItems: 'center',
      justifyContent: 'center',
    },
    moduleBody: { flex: 1 },
    moduleTitle: { fontWeight: '700', fontSize: 15 },
    moduleDesc: { fontSize: 12, marginTop: 2 },
    levelRow: { marginBottom: spacing.sm },
    levelLabel: { fontSize: 13, fontWeight: '600', marginBottom: 4 },
    progressTrack: { height: 8, borderRadius: 999, overflow: 'hidden' },
    progressFill: { height: '100%', borderRadius: 999 },
  });
}
