import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { type NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useMemo } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import {
  ACADEMY_LEVELS,
  ACADEMY_MODULES,
  PARTNER_ACADEMY_STATS,
} from '@/features/academy/data/academy';
import { Card, PageHero, Screen, SectionHeader, StatCard } from '@/components/ui';
import { useResponsiveLayout } from '@/hooks';
import type { AcademyStackParamList } from '@/navigation/types';
import { radius, spacing, typography } from '@/theme';
import { cardShadow } from '@/theme/elevation';
import { glassSurface, premiumHover } from '@/theme/premium';
import { useAppTheme } from '@/theme/ThemeProvider';

export function AcademyHubScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<AcademyStackParamList>>();
  const { colors } = useAppTheme();
  const { isDesktop } = useResponsiveLayout();
  const styles = useMemo(() => createStyles(colors, isDesktop), [colors, isDesktop]);
  const stats = PARTNER_ACADEMY_STATS;

  return (
    <Screen scroll padded={false}>
      <PageHero
        eyebrow="Growth"
        title="Partner Academy"
        subtitle="Courses, CRM training, certificates and AI tools for partners"
        icon="school"
        actions={
          <Pressable
            style={styles.heroBtn}
            onPress={() => navigation.navigate('AcademyModule', { moduleId: 'learning' })}
          >
            <Text style={styles.heroBtnText}>Continue learning</Text>
          </Pressable>
        }
      />

      <View style={styles.body}>
        <View style={styles.statGrid}>
          <StatCard label="Progress" value={`${stats.learningProgress}%`} icon="school" accent />
          <StatCard label="Certificates" value={stats.certificates} icon="ribbon" />
          <StatCard label="Hours" value={`${stats.learningHours}h`} icon="time" />
          <StatCard label="Rank" value={`#${stats.partnerRank}`} icon="trophy" />
        </View>

        <SectionHeader title="Academy modules" subtitle="Tap any module to open it" eyebrow="Curriculum" />

        <View style={styles.moduleGrid}>
          {ACADEMY_MODULES.map((mod) => (
            <Pressable
              key={mod.id}
              onPress={() => navigation.navigate('AcademyModule', { moduleId: mod.id })}
              style={({ pressed }) => [styles.moduleRow, pressed && styles.modulePressed]}
            >
              <View style={styles.moduleIcon}>
                <Ionicons name={mod.icon as keyof typeof Ionicons.glyphMap} size={22} color={colors.primary} />
              </View>
              <View style={styles.moduleBody}>
                <Text style={styles.moduleTitle}>{mod.title}</Text>
                <Text style={styles.moduleDesc}>{mod.description}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
            </Pressable>
          ))}
        </View>

        <Card title="Roadmap snapshot" subtitle="Levels 1–10" elevated>
          {ACADEMY_LEVELS.slice(0, 4).map((level) => (
            <View key={level.id} style={styles.levelRow}>
              <Text style={styles.levelLabel}>
                L{level.id} {level.title}
              </Text>
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${level.progress}%` }]} />
              </View>
            </View>
          ))}
          <Pressable onPress={() => navigation.navigate('AcademyModule', { moduleId: 'learning' })}>
            <Text style={styles.link}>View full roadmap →</Text>
          </Pressable>
        </Card>
      </View>
    </Screen>
  );
}

function createStyles(colors: ReturnType<typeof useAppTheme>['colors'], isDesktop: boolean) {
  return StyleSheet.create({
    body: { paddingHorizontal: isDesktop ? 32 : 16 },
    heroBtn: {
      backgroundColor: 'rgba(255,255,255,0.16)',
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.28)',
      borderRadius: radius.full,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.sm,
    },
    heroBtnText: { color: '#FFFFFF', fontWeight: '800', fontSize: 13 },
    statGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.sm,
      marginBottom: spacing.md,
    },
    moduleGrid: {
      flexDirection: isDesktop ? 'row' : 'column',
      flexWrap: 'wrap',
      gap: spacing.md,
      marginBottom: spacing.lg,
    },
    moduleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      padding: spacing.lg,
      borderRadius: radius.xl,
      borderWidth: 1,
      width: isDesktop ? '48%' : '100%',
      ...glassSurface(colors, isDesktop),
      ...cardShadow(false, colors.primary),
      ...premiumHover(),
      ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as const) : null),
    },
    modulePressed: { opacity: 0.92, transform: [{ scale: 0.995 }] },
    moduleIcon: {
      width: 48,
      height: 48,
      borderRadius: radius.lg,
      backgroundColor: `${colors.primary}18`,
      borderWidth: 1,
      borderColor: `${colors.primary}28`,
      alignItems: 'center',
      justifyContent: 'center',
    },
    moduleBody: { flex: 1, minWidth: 0 },
    moduleTitle: { ...typography.label, color: colors.text, fontSize: 15, fontWeight: '800' },
    moduleDesc: { ...typography.bodySm, color: colors.textSecondary, marginTop: 4, lineHeight: 18 },
    levelRow: { marginBottom: spacing.md },
    levelLabel: { ...typography.label, color: colors.text, marginBottom: 6, fontWeight: '700' },
    progressTrack: { height: 8, backgroundColor: colors.border, borderRadius: 4, overflow: 'hidden' },
    progressFill: { height: '100%', backgroundColor: colors.primary, borderRadius: 4 },
    link: { color: colors.primary, fontWeight: '800', marginTop: spacing.sm },
  });
}
