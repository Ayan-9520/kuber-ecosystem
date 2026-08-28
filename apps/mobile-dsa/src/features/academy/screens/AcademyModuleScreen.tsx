import { useMemo } from 'react';
import { type RouteProp, useRoute } from '@react-navigation/native';
import { StyleSheet, Text, View } from 'react-native';

import {
  ACADEMY_LEVELS,
  ACADEMY_MODULES,
  type AcademyModuleId,
} from '@/features/academy/data/academy';
import { Card, Screen } from '@/components/ui';
import type { AcademyStackParamList } from '@/navigation/types';
import { spacing, typography } from '@/theme';
import { useAppTheme } from '@/theme/ThemeProvider';

const MODULE_CONTENT: Record<AcademyModuleId, string[]> = {
  learning: ACADEMY_LEVELS.map((l) => `Level ${l.id}: ${l.title} (${l.progress}% complete)`),
  certifications: [
    'Bronze — Foundation complete',
    'Silver — Home Loan / LAP tracks',
    'Gold — Business + Insurance + CRM',
    'Platinum — Digital + AI',
    'Diamond — Leadership + Master Partner',
  ],
  downloads: ['Starter Kit', 'Partner Handbook', 'Eligibility checklists', 'Bank document packs', 'Sales decks'],
  crm: ['Lead Entry', 'Lead Pipeline', 'Document Upload', 'Commission Reports', 'Task Management', 'Reports'],
  marketing: ['WhatsApp templates', 'Instagram creatives', 'Festival posts', 'Sales deck', 'Proposal formats'],
  scripts: ['Telephone', 'WhatsApp', 'CA / GST / Builder scripts', 'Objection handling', 'Closing', 'Referrals'],
  videos: ['Foundation series', 'Home loan underwriting', 'LAP legal checks', 'CRM walkthroughs'],
  ai: [
    'Suggest WhatsApp message',
    'Generate proposal',
    'Explain Home Loan / LAP',
    'Handle rate objections',
    'Draft Instagram caption',
  ],
  community: ['Discussion forum', 'Monthly webinar', 'Success stories', 'Recognition wall'],
  leaderboard: ['Top Revenue', 'Top Learning', 'Top Referrals', 'Top Marketing', 'Top Consultant'],
  support: ['Academy helpdesk', 'CRM login help', 'Certificate unlock issues', 'Commission queries'],
  profile: ['Photo & KYC', 'Certificates', 'Learning progress', 'Commission summary', 'Referral link', 'Wallet'],
};

export function AcademyModuleScreen() {
  const route = useRoute<RouteProp<AcademyStackParamList, 'AcademyModule'>>();
  const moduleId = route.params?.moduleId ?? 'learning';
  const mod = ACADEMY_MODULES.find((m) => m.id === moduleId) ?? ACADEMY_MODULES[0]!
  const items = MODULE_CONTENT[mod.id] ?? []
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(), []);

  return (
    <Screen scroll title={mod.title} subtitle={mod.description} forceHeader>
      <Card title="Activated in KuberOne" subtitle="Partner Academy feature">
        <Text style={[styles.body, { color: colors.textSecondary }]}>
          This module is live on your partner dashboard. Content syncs with Partner Academy curriculum used
          across KuberFinserve and Admin.
        </Text>
      </Card>
      <Card title="Included">
        {items.map((item) => (
          <View key={item} style={styles.itemRow}>
            <Text style={{ color: colors.primary, fontWeight: '700' }}>•</Text>
            <Text style={[styles.itemText, { color: colors.text }]}>{item}</Text>
          </View>
        ))}
      </Card>
    </Screen>
  );
}

function createStyles() {
  return StyleSheet.create({
    body: { ...typography.body, lineHeight: 20 },
    itemRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.sm },
    itemText: { flex: 1, fontSize: 14, lineHeight: 20 },
  });
}
