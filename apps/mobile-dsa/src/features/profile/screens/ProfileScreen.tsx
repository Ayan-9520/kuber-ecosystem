import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { type NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ThemeAppearanceCard } from '@/components/ThemeAppearanceCard';
import { Button, Card, PageHero, Screen, SectionHeader, StatusBadge } from '@/components/ui';
import { useAuth, useResponsiveLayout } from '@/hooks';
import { maskPhone, str } from '@/lib/utils';
import type { ProfileStackParamList } from '@/navigation/types';
import { partnersService } from '@/services';
import { radius, spacing, typography } from '@/theme';
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
  const { isDesktop, pagePad } = useResponsiveLayout();
  const styles = useMemo(() => createStyles(colors, isDesktop, pagePad), [colors, isDesktop, pagePad]);

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
      {!isDesktop ? (
        <PageHero
          eyebrow="Account"
          title={displayName}
          subtitle={partner.data?.businessName ? String(partner.data.businessName) : 'DSA Partner'}
          icon="person"
        />
      ) : (
        <View style={styles.desktopHead}>
          <SectionHeader title="Account settings" subtitle="Profile, documents & preferences" />
        </View>
      )}

      <View style={styles.body}>
        {!isDesktop ? (
          <Card>
            <View style={styles.profileRow}>
              <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
                <Text style={[styles.avatarText, { color: colors.onPrimary }]}>
                  {displayName.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={styles.profileMeta}>
                <Text style={[styles.name, { color: colors.text }]}>{displayName}</Text>
                <Text style={[styles.sub, { color: colors.textMuted }]}>
                  {user?.phone ? maskPhone(user.phone) : user?.email}
                </Text>
                <View style={styles.badgeRow}>
                  <StatusBadge status={kycStatus} />
                  <StatusBadge status={str(partner.data?.status ?? 'ACTIVE')} />
                </View>
                {partner.data?.partnerCode ? (
                  <Text style={[styles.code, { color: colors.primary }]}>
                    Partner Code: {String(partner.data.partnerCode)}
                  </Text>
                ) : null}
              </View>
            </View>
          </Card>
        ) : (
          <Card>
            <View style={styles.desktopMetaRow}>
              <View style={styles.badgeRow}>
                <StatusBadge status={kycStatus} />
                <StatusBadge status={str(partner.data?.status ?? 'ACTIVE')} />
              </View>
              {partner.data?.partnerCode ? (
                <Text style={[styles.code, { color: colors.primary }]}>
                  {String(partner.data.partnerCode)}
                </Text>
              ) : null}
            </View>
          </Card>
        )}

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

        <Card title="Manage">
          <View style={isDesktop ? styles.menuGrid : undefined}>
            {MENU.map((item) => (
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
    profileRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
    desktopMetaRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md },
    avatar: {
      width: 48,
      height: 48,
      borderRadius: radius.md,
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarText: { fontSize: 20, fontWeight: '800' },
    profileMeta: { flex: 1 },
    name: { ...typography.h3, fontSize: 16, fontWeight: '700' },
    sub: { ...typography.bodySm, marginTop: 2, fontSize: 12 },
    badgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.sm },
    code: { ...typography.caption, marginTop: spacing.sm, fontWeight: '600', fontSize: 11 },
    menuGrid: { flexDirection: 'row', flexWrap: 'wrap' },
    menuRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      paddingVertical: spacing.sm,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
      width: isDesktop ? '50%' : '100%',
      paddingRight: isDesktop ? spacing.md : 0,
    },
    menuLabel: { ...typography.body, flex: 1, fontSize: 13, fontWeight: '500' },
  });
}
