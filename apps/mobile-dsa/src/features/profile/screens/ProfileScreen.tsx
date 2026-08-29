import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { type NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { ThemeAppearanceCard } from '@/components/ThemeAppearanceCard';
import { Button, Card, PageHero, Screen, SectionHeader, StatusBadge } from '@/components/ui';
import { useAuth, useResponsiveLayout } from '@/hooks';
import { maskPhone, str } from '@/lib/utils';
import type { ProfileStackParamList } from '@/navigation/types';
import { partnersService } from '@/services';
import { radius, spacing, typography } from '@/theme';
import { accentGlow } from '@/theme/premium';
import { useAppTheme } from '@/theme/ThemeProvider';

const MENU: {
  label: string;
  screen: keyof ProfileStackParamList;
  icon: keyof typeof Ionicons.glyphMap;
  hint: string;
}[] = [
  { label: 'My Brand Profile', screen: 'BrandingDashboard', icon: 'ribbon', hint: 'Public partner page' },
  { label: 'Bank Account', screen: 'BankAccount', icon: 'card', hint: 'Payout details' },
  { label: 'KYC Status', screen: 'PartnerKycStatus', icon: 'shield-checkmark', hint: 'Verification progress' },
  { label: 'Documents', screen: 'Documents', icon: 'folder', hint: 'Upload & manage files' },
  { label: 'Document Deficiencies', screen: 'DocumentDeficiencies', icon: 'alert-circle', hint: 'Action required' },
  { label: 'Customers', screen: 'CustomersList', icon: 'people', hint: 'Your client list' },
  { label: 'Referrals', screen: 'Referrals', icon: 'gift', hint: 'Invite partners' },
  { label: 'Referral Analytics', screen: 'ReferralAnalytics', icon: 'analytics', hint: 'Performance insights' },
  { label: 'Support', screen: 'Support', icon: 'headset', hint: 'Get help' },
  { label: 'Settings', screen: 'Settings', icon: 'settings', hint: 'App preferences' },
];

export function ProfileScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ProfileStackParamList>>();
  const { user, partnerId, logout } = useAuth();
  const { colors } = useAppTheme();
  const { isDesktop, pagePad, sectionGap } = useResponsiveLayout();
  const styles = useMemo(() => createStyles(colors, isDesktop, pagePad), [colors, isDesktop, pagePad]);

  const partner = useQuery({
    queryKey: ['partner-profile', partnerId],
    queryFn: () => partnersService.getById(partnerId!),
    enabled: !!partnerId,
    retry: false,
  });

  const displayName = str(partner.data?.contactName ?? partner.data?.businessName ?? user?.phone);
  const businessName = str(partner.data?.businessName);
  const kycStatus = str(partner.data?.kycStatus ?? 'NOT_STARTED');
  const partnerStatus = str(partner.data?.status ?? 'ACTIVE');
  const tier = str(partner.data?.commissionTier ?? 'SILVER');
  const partnerCode = str(partner.data?.partnerCode);
  const initials = displayName.slice(0, 2).toUpperCase();

  return (
    <Screen scroll padded={false}>
      {!isDesktop ? (
        <PageHero
          eyebrow="Account"
          title={displayName}
          subtitle={businessName || 'DSA Partner'}
          icon="person"
        />
      ) : (
        <View style={styles.desktopHead}>
          <SectionHeader title="Account settings" subtitle="Profile, documents and preferences" />
        </View>
      )}

      <View style={[styles.body, { gap: sectionGap }]}>
        <Card variant="glass" elevated style={isDesktop ? [styles.profileHero, accentGlow(colors.primary)] : undefined}>
          <View style={styles.profileRow}>
            <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
              <Text style={[styles.avatarText, { color: colors.onPrimary }]}>{initials}</Text>
            </View>
            <View style={styles.profileMeta}>
              <Text style={[styles.name, { color: colors.text }]}>{displayName}</Text>
              {businessName ? (
                <Text style={[styles.business, { color: colors.textSecondary }]}>{businessName}</Text>
              ) : null}
              <Text style={[styles.sub, { color: colors.textMuted }]}>
                {user?.phone ? maskPhone(user.phone) : user?.email}
                {user?.email && user?.phone ? ` · ${user.email}` : ''}
              </Text>
              <View style={styles.badgeRow}>
                <StatusBadge status={kycStatus} />
                <StatusBadge status={partnerStatus} />
                <View style={[styles.tierBadge, { backgroundColor: `${colors.primary}14` }]}>
                  <Text style={[styles.tierBadgeText, { color: colors.primary }]}>{tier}</Text>
                </View>
              </View>
              {partnerCode ? (
                <Text style={[styles.code, { color: colors.primary }]}>{partnerCode}</Text>
              ) : null}
            </View>
          </View>
        </Card>

        {isDesktop ? (
          <View style={styles.quickGrid}>
            <View style={styles.quickGridItem}>
              <Card title="Partner Academy" subtitle="Courses, certificates and growth tracks">
                <Pressable
                  style={[styles.academyCta, { backgroundColor: `${colors.primary}10`, borderColor: `${colors.primary}28` }]}
                  onPress={() => navigation.getParent()?.navigate('Academy', { screen: 'AcademyHome' })}
                >
                  <View style={[styles.menuIconPlate, { backgroundColor: `${colors.primary}20` }]}>
                    <Ionicons name="school" size={20} color={colors.primary} />
                  </View>
                  <View style={styles.academyCopy}>
                    <Text style={[styles.academyTitle, { color: colors.text }]}>Open Academy Hub</Text>
                    <Text style={[styles.academyHint, { color: colors.textMuted }]}>
                      Continue learning and unlock certifications
                    </Text>
                  </View>
                  <Ionicons name="arrow-forward" size={18} color={colors.primary} />
                </Pressable>
              </Card>
            </View>
            <View style={styles.quickGridItem}>
              <ThemeAppearanceCard />
            </View>
          </View>
        ) : (
          <>
            <ThemeAppearanceCard />
            <Card title="Partner Academy">
              <Pressable
                style={styles.menuRow}
                onPress={() => navigation.getParent()?.navigate('Academy', { screen: 'AcademyHome' })}
              >
                <Ionicons name="school" size={18} color={colors.primary} />
                <Text style={[styles.menuLabel, { color: colors.text }]}>Open Academy Hub</Text>
                <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
              </Pressable>
            </Card>
          </>
        )}

        <Card title="Manage" subtitle={isDesktop ? 'Account tools and compliance' : undefined}>
          <View style={isDesktop ? styles.menuGrid : undefined}>
            {MENU.map((item) => (
              <Pressable
                key={item.screen}
                style={({ pressed }) => [
                  isDesktop ? styles.menuTile : styles.menuRow,
                  isDesktop && { borderColor: colors.borderLight, backgroundColor: pressed ? colors.surface : 'transparent' },
                  Platform.OS === 'web' && isDesktop && ({ cursor: 'pointer' } as const),
                ]}
                onPress={() => (navigation.navigate as (name: keyof ProfileStackParamList) => void)(item.screen)}
              >
                <View style={[styles.menuIconPlate, { backgroundColor: `${colors.primary}14` }]}>
                  <Ionicons name={item.icon} size={18} color={colors.primary} />
                </View>
                <View style={styles.menuTileCopy}>
                  <Text style={[styles.menuLabel, { color: colors.text }]}>{item.label}</Text>
                  {isDesktop ? (
                    <Text style={[styles.menuHint, { color: colors.textMuted }]} numberOfLines={1}>
                      {item.hint}
                    </Text>
                  ) : null}
                </View>
                <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
              </Pressable>
            ))}
          </View>
        </Card>

        {!isDesktop ? (
          <Button title="Sign Out" variant="secondary" fullWidth onPress={() => void logout()} />
        ) : null}
      </View>
    </Screen>
  );
}

function createStyles(
  colors: ReturnType<typeof useAppTheme>['colors'],
  isDesktop: boolean,
  pagePad: number,
) {
  return StyleSheet.create({
    desktopHead: { paddingHorizontal: pagePad, paddingTop: spacing.sm },
    body: { paddingHorizontal: isDesktop ? pagePad : 16 },
    profileHero: { marginBottom: 0 },
    profileRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.lg },
    avatar: {
      width: isDesktop ? 64 : 48,
      height: isDesktop ? 64 : 48,
      borderRadius: isDesktop ? 18 : radius.md,
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarText: { fontSize: isDesktop ? 22 : 20, fontWeight: '800' },
    profileMeta: { flex: 1, minWidth: 0 },
    name: { ...typography.h3, fontSize: isDesktop ? 22 : 16, fontWeight: '800', letterSpacing: -0.3 },
    business: { ...typography.body, fontSize: 14, marginTop: 4, fontWeight: '600' },
    sub: { ...typography.bodySm, marginTop: 6, fontSize: 12 },
    badgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.md },
    tierBadge: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: radius.full,
    },
    tierBadgeText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
    code: { ...typography.caption, marginTop: spacing.md, fontWeight: '700', fontSize: 12, letterSpacing: 0.3 },
    quickGrid: {
      flexDirection: 'row',
      gap: spacing.md,
      alignItems: 'stretch',
    },
    quickGridItem: { flex: 1, minWidth: 0 },
    academyCta: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      padding: spacing.md,
      borderRadius: radius.lg,
      borderWidth: 1,
    },
    academyCopy: { flex: 1, minWidth: 0 },
    academyTitle: { fontSize: 14, fontWeight: '700' },
    academyHint: { fontSize: 12, marginTop: 4 },
    menuGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.sm,
      marginTop: spacing.xs,
    },
    menuTile: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      width: '48.5%',
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.sm,
      borderRadius: radius.lg,
      borderWidth: StyleSheet.hairlineWidth,
    },
    menuTileCopy: { flex: 1, minWidth: 0 },
    menuIconPlate: {
      width: 36,
      height: 36,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
    },
    menuHint: { fontSize: 11, marginTop: 2 },
    menuRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      paddingVertical: spacing.sm,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
      width: '100%',
    },
    menuLabel: { ...typography.body, fontSize: 13, fontWeight: '600' },
  });
}
