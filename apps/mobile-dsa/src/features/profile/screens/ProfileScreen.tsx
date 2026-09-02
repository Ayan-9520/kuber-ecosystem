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
import { PARTNER_MOBILE_PROFILE_MENU } from '@/navigation/partnerSidebarNav';
import type { ProfileStackParamList } from '@/navigation/types';
import { partnersService } from '@/services';
import { radius, spacing, typography } from '@/theme';
import { accentGlow } from '@/theme/premium';
import { useAppTheme } from '@/theme/ThemeProvider';

const SIDEBAR_HINT_DESKTOP =
  'Documents, KYC, bank and brand settings are in the left sidebar under Account.';

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
          <SectionHeader title="Profile" subtitle="Your partner identity and preferences" />
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
          <ThemeAppearanceCard />
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
            <Card title="Account">
              {PARTNER_MOBILE_PROFILE_MENU.map((item) => (
                <Pressable
                  key={item.screen}
                  style={styles.menuRow}
                  onPress={() => (navigation.navigate as (name: keyof ProfileStackParamList) => void)(item.screen)}
                >
                  <Ionicons name={item.icon} size={18} color={colors.primary} />
                  <Text style={[styles.menuLabel, { color: colors.text }]}>{item.label}</Text>
                  <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
                </Pressable>
              ))}
            </Card>
          </>
        )}

        {isDesktop ? (
          <Card title="Quick tip" variant="glass">
            <Text style={[styles.sidebarHint, { color: colors.textSecondary }]}>{SIDEBAR_HINT_DESKTOP}</Text>
          </Card>
        ) : null}

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
    sidebarHint: { ...typography.bodySm, lineHeight: 20 },
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
