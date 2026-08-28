import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { type NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ThemeAppearanceCard } from '@/components/ThemeAppearanceCard';
import { Button, Card, PageHero, Screen, StatusBadge } from '@/components/ui';
import { useAuth, useResponsiveLayout } from '@/hooks';
import { maskPhone, str } from '@/lib/utils';
import type { ProfileStackParamList } from '@/navigation/types';
import { partnersService } from '@/services';
import { radius, spacing, typography } from '@/theme';
import { cardShadow } from '@/theme/elevation';
import { glassSurface, premiumHover } from '@/theme/premium';
import { useAppTheme } from '@/theme/ThemeProvider';

const MENU: { label: string; screen: keyof ProfileStackParamList; icon: keyof typeof Ionicons.glyphMap }[] = [
  { label: 'My Brand Profile', screen: 'BrandingDashboard', icon: 'ribbon' },
  { label: 'Bank Account', screen: 'BankAccount', icon: 'card' },
  { label: 'KYC Status', screen: 'PartnerKycStatus', icon: 'shield-checkmark' },
  { label: 'Documents', screen: 'Documents', icon: 'folder' },
  { label: 'Document Deficiencies', screen: 'DocumentDeficiencies', icon: 'alert-circle' },
  { label: 'Customers', screen: 'CustomersList', icon: 'people' },
  { label: 'Referrals', screen: 'Referrals', icon: 'gift' },
  { label: 'Referral Analytics', screen: 'ReferralAnalytics', icon: 'analytics' },
  { label: 'Support', screen: 'Support', icon: 'headset' },
  { label: 'Settings', screen: 'Settings', icon: 'settings' },
];

export function ProfileScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ProfileStackParamList>>();
  const { user, partnerId, logout } = useAuth();
  const { colors } = useAppTheme();
  const { isDesktop } = useResponsiveLayout();
  const styles = useMemo(() => createStyles(colors, isDesktop), [colors, isDesktop]);

  const partner = useQuery({
    queryKey: ['partner-profile', partnerId],
    queryFn: () => partnersService.getById(partnerId!),
    enabled: !!partnerId,
    retry: false,
  });

  const displayName = str(partner.data?.contactName ?? partner.data?.businessName ?? user?.phone);
  const kycStatus = str(partner.data?.kycStatus ?? 'NOT_STARTED');

  return (
    <Screen scroll padded={false}>
      <PageHero
        eyebrow="Account"
        title={displayName}
        subtitle={partner.data?.businessName ? String(partner.data.businessName) : 'DSA Partner'}
        icon="person"
      />

      <View style={styles.body}>
        <Card elevated>
          <View style={styles.profileRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{displayName.charAt(0).toUpperCase()}</Text>
            </View>
            <View style={styles.profileMeta}>
              <Text style={styles.sub}>{user?.phone ? maskPhone(user.phone) : user?.email}</Text>
              <View style={styles.badgeRow}>
                <StatusBadge status={kycStatus} />
                <StatusBadge status={str(partner.data?.status ?? 'ACTIVE')} />
              </View>
              {partner.data?.partnerCode ? (
                <Text style={styles.code}>Partner Code: {String(partner.data.partnerCode)}</Text>
              ) : null}
            </View>
          </View>
        </Card>

        <ThemeAppearanceCard />

        <Card title="Partner Academy" elevated>
          <Pressable
            style={styles.menuRow}
            onPress={() => navigation.getParent()?.navigate('Academy', { screen: 'AcademyHome' })}
          >
            <View style={styles.menuIcon}>
              <Ionicons name="school" size={20} color={colors.primary} />
            </View>
            <Text style={styles.menuLabel}>Open Academy Hub</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </Pressable>
        </Card>

        <Card title="Account settings" subtitle="Profile, documents & support" elevated>
          <View style={isDesktop ? styles.menuGrid : undefined}>
            {MENU.map((item) => (
              <Pressable
                key={item.screen}
                style={({ pressed }) => [styles.menuRow, isDesktop && styles.menuGridItem, pressed && styles.menuPressed]}
                onPress={() => (navigation.navigate as (name: keyof ProfileStackParamList) => void)(item.screen)}
              >
                <View style={styles.menuIcon}>
                  <Ionicons name={item.icon} size={20} color={colors.primary} />
                </View>
                <Text style={styles.menuLabel}>{item.label}</Text>
                <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
              </Pressable>
            ))}
          </View>
        </Card>

        <Button title="Sign Out" variant="secondary" fullWidth onPress={() => void logout()} />
      </View>
    </Screen>
  );
}

function createStyles(colors: ReturnType<typeof useAppTheme>['colors'], isDesktop: boolean) {
  return StyleSheet.create({
    body: { paddingHorizontal: isDesktop ? 32 : 16 },
    profileRow: {
      flexDirection: isDesktop ? 'row' : 'column',
      alignItems: isDesktop ? 'center' : 'center',
      gap: spacing.lg,
    },
    avatar: {
      width: isDesktop ? 72 : 64,
      height: isDesktop ? 72 : 64,
      borderRadius: radius.xl,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      ...cardShadow(true, colors.primary),
    },
    avatarText: { fontSize: isDesktop ? 32 : 28, fontWeight: '800', color: colors.onPrimary },
    profileMeta: { flex: 1, alignItems: isDesktop ? 'flex-start' : 'center' },
    sub: { ...typography.bodySm, color: colors.textMuted, marginTop: 4 },
    badgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.md },
    code: { ...typography.caption, color: colors.primary, marginTop: spacing.sm, fontWeight: '700' },
    menuGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.sm,
    },
    menuGridItem: {
      width: '48%',
      borderBottomWidth: 0,
      borderRadius: radius.lg,
      borderWidth: 1,
      ...glassSurface(colors, isDesktop),
      ...cardShadow(false, colors.primary),
      ...premiumHover(),
      paddingHorizontal: spacing.md,
    },
    menuRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      paddingVertical: spacing.md,
      borderBottomWidth: isDesktop ? 0 : 1,
      borderBottomColor: colors.border,
    },
    menuPressed: { opacity: 0.9 },
    menuIcon: {
      width: 36,
      height: 36,
      borderRadius: radius.md,
      backgroundColor: `${colors.primary}14`,
      alignItems: 'center',
      justifyContent: 'center',
    },
    menuLabel: { ...typography.body, color: colors.text, flex: 1, fontWeight: '600' },
  });
}
