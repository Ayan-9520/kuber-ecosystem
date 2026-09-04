import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { type NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import { Alert, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { Button, Card, PageHero, Screen, StatusBadge } from '@/components/ui';
import { useAuth, useResponsiveLayout } from '@/hooks';
import { formatDate, maskPhone, str } from '@/lib/utils';
import { CUSTOMER_MOBILE_PROFILE_MENU } from '@/navigation/customerSidebarNav';
import type { ProfileStackParamList } from '@/navigation/types';
import { customerService, kycService } from '@/services';
import { radius, spacing, typography } from '@/theme';
import { glassSurface, premiumHover } from '@/theme/premium';
import { useAppTheme } from '@/theme/ThemeProvider';

type Nav = NativeStackNavigationProp<ProfileStackParamList, 'ProfileHome'>;

export function ProfileScreen() {
  const navigation = useNavigation<Nav>();
  const { user, customerId, logout } = useAuth();
  const { colors } = useAppTheme();
  const { isDesktop, pagePad } = useResponsiveLayout();
  const styles = createStyles(colors, isDesktop, pagePad);

  const customer = useQuery({
    queryKey: ['customer', customerId],
    queryFn: () => customerService.getById(customerId!),
    enabled: !!customerId,
  });

  const profile = useQuery({
    queryKey: ['customer-profile', customerId],
    queryFn: () => customerService.profile(customerId!),
    enabled: !!customerId,
  });

  const kyc = useQuery({
    queryKey: ['kyc-profile', customerId],
    queryFn: () => kycService.profile(customerId),
    enabled: !!customerId,
  });

  const fullName = [customer.data?.firstName, customer.data?.lastName].filter(Boolean).join(' ') || 'Customer';
  const email = str(profile.data?.alternateEmail ?? user?.email);
  const phone = user?.phone ? maskPhone(user.phone) : '—';
  const kycStatus = str(kyc.data?.overallStatus ?? customer.data?.kycStatus ?? 'NOT_STARTED');

  const confirmLogout = () => {
    if (Platform.OS === 'web') {
      const ok =
        typeof window !== 'undefined' ? window.confirm('Are you sure you want to sign out?') : true;
      if (ok) void logout();
      return;
    }
    Alert.alert('Logout', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: () => void logout() },
    ]);
  };

  return (
    <Screen scroll padded={false} loading={customer.isLoading}>
      <PageHero
        eyebrow="Account"
        title="Profile"
        subtitle="Manage your identity & preferences"
        icon="person"
      />

      <View style={styles.body}>
        <Card elevated>
          <View style={styles.avatarRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{fullName.charAt(0).toUpperCase()}</Text>
            </View>
            <View style={styles.avatarInfo}>
              <Text style={styles.name}>{fullName}</Text>
              {email ? <Text style={styles.meta}>{email}</Text> : null}
              <Text style={styles.meta}>{phone}</Text>
              <View style={styles.badgeRow}>
                <StatusBadge status={kycStatus} />
                {customer.data?.customerCode ? (
                  <Text style={styles.code}>ID: {str(customer.data.customerCode)}</Text>
                ) : null}
              </View>
            </View>
          </View>
          {customer.data?.createdAt ? (
            <Text style={styles.since}>Member since {formatDate(customer.data.createdAt as string)}</Text>
          ) : null}
        </Card>

        {!isDesktop ? (
          <>
            <Text style={styles.sectionLabel}>Account menu</Text>
            {CUSTOMER_MOBILE_PROFILE_MENU.map((item) => (
              <Pressable
                key={item.screen}
                style={({ pressed }) => [styles.menuItem, pressed && styles.menuPressed]}
                onPress={() => navigation.navigate(item.screen)}
              >
                <View style={styles.menuIcon}>
                  <Ionicons name={item.icon} size={18} color={colors.primary} />
                </View>
                <View style={styles.menuText}>
                  <Text style={styles.menuLabel}>{item.label}</Text>
                  {item.subtitle ? <Text style={styles.menuSub}>{item.subtitle}</Text> : null}
                </View>
                <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
              </Pressable>
            ))}
          </>
        ) : (
          <Card elevated>
            <Text style={styles.desktopHint}>
              Theme is under Settings. Use the sidebar for KYC, documents, and profile edits.
            </Text>
            <Button
              title="Open Settings"
              variant="secondary"
              style={styles.settingsBtn}
              onPress={() => navigation.navigate('Settings')}
            />
          </Card>
        )}

        {!isDesktop ? (
          <View style={styles.logoutWrap}>
            <Button
              title="Logout"
              variant="danger"
              fullWidth
              onPress={confirmLogout}
              icon={<Ionicons name="log-out-outline" size={18} color={colors.danger} />}
            />
          </View>
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
    body: { paddingHorizontal: pagePad, paddingBottom: spacing.xxl, gap: spacing.md },
    avatarRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg },
    avatar: {
      width: 72,
      height: 72,
      borderRadius: radius.full,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarText: { ...typography.h2, color: colors.onPrimary, fontSize: 28, fontWeight: '800' },
    avatarInfo: { flex: 1, gap: 2 },
    name: { ...typography.h3, color: colors.text, fontWeight: '700', fontSize: 20 },
    meta: { ...typography.bodySm, color: colors.textMuted, marginTop: 2 },
    badgeRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      marginTop: spacing.md,
      flexWrap: 'wrap',
    },
    code: { ...typography.bodySm, color: colors.textSecondary },
    since: { ...typography.bodySm, color: colors.textMuted, marginTop: spacing.lg },
    sectionLabel: {
      ...typography.caption,
      color: colors.textMuted,
      fontWeight: '700',
      letterSpacing: 0.6,
      textTransform: 'uppercase',
      marginTop: spacing.sm,
      marginBottom: spacing.xs,
    },
    menuItem: {
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: radius.lg,
      borderWidth: 1,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.md,
      gap: spacing.md,
      ...glassSurface(colors, isDesktop),
      ...premiumHover(),
    },
    menuPressed: { opacity: 0.9 },
    menuIcon: {
      width: 42,
      height: 42,
      borderRadius: radius.md,
      backgroundColor: `${colors.primary}16`,
      alignItems: 'center',
      justifyContent: 'center',
    },
    menuText: { flex: 1 },
    menuLabel: { ...typography.label, color: colors.text },
    menuSub: { ...typography.bodySm, color: colors.textMuted, marginTop: 2 },
    logoutWrap: { marginTop: spacing.md },
    desktopHint: {
      ...typography.bodySm,
      color: colors.textMuted,
      lineHeight: 22,
    },
    settingsBtn: { marginTop: spacing.md, alignSelf: 'flex-start' },
  });
}
