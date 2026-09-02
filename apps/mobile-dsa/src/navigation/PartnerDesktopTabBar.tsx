import { Ionicons } from '@expo/vector-icons';
import { type BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useQuery } from '@tanstack/react-query';
import { Image, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { useAuth, useResponsiveLayout } from '@/hooks';
import { maskPhone, str } from '@/lib/utils';
import { PARTNER_SIDEBAR_ACCOUNT_NAV } from '@/navigation/partnerSidebarNav';
import type { ProfileStackParamList } from '@/navigation/types';
import { partnersService } from '@/services';
import { radius, spacing, typography } from '@/theme';
import { glassSurface } from '@/theme/premium';
import { useAppTheme } from '@/theme/ThemeProvider';

const logoK1 = require('../../assets/logo-k1.png');

const TAB_ICONS: Record<
  string,
  { active: keyof typeof Ionicons.glyphMap; inactive: keyof typeof Ionicons.glyphMap; label: string }
> = {
  Home: { active: 'home', inactive: 'home-outline', label: 'Home' },
  Academy: { active: 'school', inactive: 'school-outline', label: 'Academy' },
  Leads: { active: 'people', inactive: 'people-outline', label: 'Leads' },
  Applications: { active: 'document-text', inactive: 'document-text-outline', label: 'Applications' },
  Commissions: { active: 'wallet', inactive: 'wallet-outline', label: 'Earnings' },
};

const HIDDEN_FROM_NAV = new Set(['Profile']);

function activeProfileScreen(state: BottomTabBarProps['state']): keyof ProfileStackParamList {
  const profileTab = state.routes.find((r) => r.name === 'Profile');
  const nested = profileTab?.state;
  if (!nested?.routes?.length) return 'ProfileHome';
  const idx = nested.index ?? 0;
  return (nested.routes[idx]?.name ?? 'ProfileHome') as keyof ProfileStackParamList;
}

export function PartnerDesktopTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const { colors } = useAppTheme();
  const { sidebarWidth } = useResponsiveLayout();
  const { user, partnerId, logout } = useAuth();

  const partner = useQuery({
    queryKey: ['sidebar-partner', partnerId],
    queryFn: () => partnersService.getById(partnerId!),
    enabled: !!partnerId,
    staleTime: 120_000,
  });

  const displayName = str(partner.data?.contactName ?? partner.data?.businessName ?? user?.phone ?? 'Partner');
  const businessName = str(partner.data?.businessName);
  const partnerCode = str(partner.data?.partnerCode);
  const tier = str(partner.data?.commissionTier ?? 'SILVER');
  const initials = displayName.slice(0, 2).toUpperCase();
  const profileScreen = activeProfileScreen(state);
  const onProfileTab = state.routes[state.index]?.name === 'Profile';
  const profileHomeFocused = onProfileTab && profileScreen === 'ProfileHome';

  const goProfileHome = () => {
    navigation.navigate('Profile', { screen: 'ProfileHome' });
  };

  const goAccountScreen = (screen: keyof ProfileStackParamList) => {
    navigation.navigate('Profile', { screen });
  };

  const renderNavItem = (
    key: string,
    label: string,
    iconActive: keyof typeof Ionicons.glyphMap,
    iconInactive: keyof typeof Ionicons.glyphMap,
    focused: boolean,
    onPress: () => void,
  ) => (
    <Pressable
      key={key}
      accessibilityRole="button"
      accessibilityState={{ selected: focused }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.item,
        focused && [
          styles.itemActive,
          {
            backgroundColor: `${colors.primary}14`,
            borderColor: `${colors.primary}35`,
          },
        ],
        !focused && pressed && { backgroundColor: colors.surface },
        Platform.OS === 'web' && ({ cursor: 'pointer' } as const),
      ]}
    >
      {focused ? <View style={[styles.activeBar, { backgroundColor: colors.primary }]} /> : null}
      <View style={[styles.iconPlate, { backgroundColor: focused ? `${colors.primary}18` : colors.surface }]}>
        <Ionicons
          name={focused ? iconActive : iconInactive}
          size={18}
          color={focused ? colors.primary : colors.textSecondary}
        />
      </View>
      <Text
        style={[
          styles.itemLabel,
          { color: focused ? colors.text : colors.textSecondary },
          focused && styles.itemLabelActive,
        ]}
        numberOfLines={1}
      >
        {label}
      </Text>
    </Pressable>
  );

  return (
    <View
      style={[
        styles.rail,
        glassSurface(colors, true),
        {
          width: sidebarWidth,
          borderRightColor: colors.borderLight,
        },
      ]}
    >
      <View style={[styles.brandShell, { borderBottomColor: colors.borderLight }]}>
        <View
          style={[
            styles.brandGlow,
            Platform.OS === 'web' && {
              backgroundImage: `linear-gradient(135deg, ${colors.primary}22 0%, transparent 55%)`,
            },
          ]}
        />
        <View style={styles.brand}>
          <View style={[styles.logoPlate, { borderColor: `${colors.primary}30` }]}>
            <Image source={logoK1} style={styles.logo} accessibilityLabel="KuberOne" />
          </View>
          <View style={styles.brandCopy}>
            <Text style={[styles.brandName, { color: colors.text }]} numberOfLines={1}>
              KuberOne
            </Text>
            <Text style={[styles.brandTag, { color: colors.primary }]} numberOfLines={1}>
              Partner Network
            </Text>
          </View>
        </View>
        {partnerCode ? (
          <View style={[styles.codePill, { backgroundColor: `${colors.primary}12`, borderColor: `${colors.primary}28` }]}>
            <Text style={[styles.codeText, { color: colors.primary }]} numberOfLines={1}>
              {partnerCode}
            </Text>
          </View>
        ) : null}
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={[styles.navLabel, { color: colors.textMuted }]}>Workspace</Text>

        <View style={styles.nav} accessibilityRole="tablist">
          {state.routes
            .filter((route) => !HIDDEN_FROM_NAV.has(route.name))
            .map((route) => {
              const index = state.routes.findIndex((r) => r.key === route.key);
              const focused = state.index === index;
              const descriptor = descriptors[route.key];
              const options = descriptor?.options ?? {};
              const meta = TAB_ICONS[route.name] ?? {
                active: 'ellipse' as const,
                inactive: 'ellipse-outline' as const,
                label: options.title ?? route.name,
              };

              const onPress = () => {
                const event = navigation.emit({
                  type: 'tabPress',
                  target: route.key,
                  canPreventDefault: true,
                });
                if (!focused && !event.defaultPrevented) {
                  navigation.navigate(route.name, route.params);
                }
              };

              return renderNavItem(route.key, meta.label, meta.active, meta.inactive, focused, onPress);
            })}
        </View>

        <Text style={[styles.navLabel, styles.accountNavLabel, { color: colors.textMuted }]}>Account</Text>
        <View style={styles.nav}>
          {PARTNER_SIDEBAR_ACCOUNT_NAV.map((item) => {
            const focused = onProfileTab && profileScreen === item.screen;
            return renderNavItem(
              item.screen,
              item.label,
              item.icon,
              item.iconOutline,
              focused,
              () => goAccountScreen(item.screen),
            );
          })}
        </View>
      </ScrollView>

      <View style={[styles.accountBlock, { borderTopColor: colors.borderLight }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Open profile overview"
          onPress={goProfileHome}
          style={({ pressed }) => [
            styles.accountCard,
            {
              backgroundColor: profileHomeFocused ? `${colors.primary}10` : colors.surface,
              borderColor: profileHomeFocused ? `${colors.primary}35` : colors.borderLight,
            },
            pressed && { opacity: 0.92 },
            Platform.OS === 'web' && ({ cursor: 'pointer' } as const),
          ]}
        >
          <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
            <Text style={[styles.avatarText, { color: colors.onPrimary }]}>{initials}</Text>
          </View>
          <View style={styles.accountCopy}>
            <Text style={[styles.accountName, { color: colors.text }]} numberOfLines={1}>
              {displayName}
            </Text>
            <Text style={[styles.accountSub, { color: colors.textMuted }]} numberOfLines={1}>
              {businessName || (user?.phone ? maskPhone(user.phone) : 'Partner account')}
            </Text>
            <View style={[styles.tierPill, { backgroundColor: `${colors.primary}14` }]}>
              <Text style={[styles.tierText, { color: colors.primary }]}>{tier} tier</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={14} color={colors.textMuted} />
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Sign out"
          onPress={() => void logout()}
          style={({ pressed }) => [
            styles.signOut,
            { borderColor: colors.borderLight },
            pressed && { opacity: 0.85 },
            Platform.OS === 'web' && ({ cursor: 'pointer' } as const),
          ]}
        >
          <Ionicons name="log-out-outline" size={15} color={colors.textSecondary} />
          <Text style={[styles.signOutText, { color: colors.textSecondary }]}>Sign out</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  rail: {
    height: '100%',
    borderRightWidth: StyleSheet.hairlineWidth,
  },
  brandShell: {
    position: 'relative',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    marginBottom: spacing.xs,
    borderBottomWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  brandGlow: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.9,
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoPlate: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  logo: { width: 26, height: 26, resizeMode: 'contain' },
  brandCopy: { flex: 1, minWidth: 0 },
  brandName: { fontSize: 15, fontWeight: '800', letterSpacing: -0.3 },
  brandTag: { ...typography.caption, fontSize: 10, marginTop: 2, fontWeight: '700', letterSpacing: 0.4 },
  codePill: {
    alignSelf: 'flex-start',
    marginTop: spacing.sm,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.full,
    borderWidth: 1,
  },
  codeText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.3 },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: spacing.sm },
  navLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    paddingHorizontal: spacing.md,
    marginBottom: spacing.xs,
  },
  accountNavLabel: { marginTop: spacing.md },
  nav: { paddingHorizontal: spacing.sm, gap: 4 },
  item: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 9,
    paddingHorizontal: 10,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'transparent',
    overflow: 'hidden',
  },
  itemActive: {},
  activeBar: {
    position: 'absolute',
    left: 0,
    top: 8,
    bottom: 8,
    width: 3,
    borderRadius: radius.full,
  },
  iconPlate: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemLabel: { fontSize: 13, fontWeight: '500', flexShrink: 1 },
  itemLabelActive: { fontWeight: '700' },
  accountBlock: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: spacing.sm,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    gap: 8,
  },
  accountCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: radius.lg,
    borderWidth: 1,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 12, fontWeight: '800' },
  accountCopy: { flex: 1, minWidth: 0 },
  accountName: { fontSize: 13, fontWeight: '700' },
  accountSub: { fontSize: 11, marginTop: 2 },
  tierPill: {
    alignSelf: 'flex-start',
    marginTop: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  tierText: { fontSize: 9, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.4 },
  signOut: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
  },
  signOutText: { fontSize: 12, fontWeight: '600' },
});
