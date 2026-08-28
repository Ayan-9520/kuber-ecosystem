import { Ionicons } from '@expo/vector-icons';
import { type BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useQuery } from '@tanstack/react-query';
import { Image, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { useAuth, useResponsiveLayout } from '@/hooks';
import { maskPhone, str } from '@/lib/utils';
import { partnersService } from '@/services';
import { radius, spacing, typography } from '@/theme';
import { useAppTheme } from '@/theme/ThemeProvider';

const logoK1 = require('../../assets/logo-k1.png');

const TAB_ICONS: Record<
  string,
  { active: keyof typeof Ionicons.glyphMap; inactive: keyof typeof Ionicons.glyphMap; label: string }
> = {
  Home: { active: 'home', inactive: 'home-outline', label: 'Home' },
  Academy: { active: 'school', inactive: 'school-outline', label: 'Academy' },
  Leads: { active: 'people', inactive: 'people-outline', label: 'Leads' },
  Applications: { active: 'document-text', inactive: 'document-text-outline', label: 'Apps' },
  Commissions: { active: 'wallet', inactive: 'wallet-outline', label: 'Earnings' },
};

const HIDDEN_FROM_NAV = new Set(['Profile']);

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
  const initials = displayName.slice(0, 2).toUpperCase();
  const profileFocused = state.routes[state.index]?.name === 'Profile';

  const goProfile = () => {
    navigation.navigate('Profile', { screen: 'ProfileHome' });
  };

  return (
    <View
      style={[
        styles.rail,
        {
          width: sidebarWidth,
          backgroundColor: colors.card,
          borderRightColor: colors.borderLight,
        },
      ]}
    >
      <View style={[styles.brand, { borderBottomColor: colors.borderLight }]}>
        <View style={styles.logoPlate}>
          <Image source={logoK1} style={styles.logo} accessibilityLabel="KuberOne" />
        </View>
        <View style={styles.brandCopy}>
          <Text style={[styles.brandName, { color: colors.text }]} numberOfLines={1}>
            KuberOne
          </Text>
          <Text style={[styles.brandTag, { color: colors.textMuted }]} numberOfLines={1}>
            Partner
          </Text>
        </View>
      </View>

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
            const label =
              typeof options.tabBarLabel === 'string'
                ? options.tabBarLabel
                : typeof options.title === 'string'
                  ? options.title
                  : meta.label;

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

            return (
              <Pressable
                key={route.key}
                accessibilityRole="tab"
                accessibilityState={{ selected: focused }}
                onPress={onPress}
                style={({ pressed }) => [
                  styles.item,
                  {
                    backgroundColor: focused ? `${colors.primary}14` : pressed ? colors.surface : 'transparent',
                  },
                  Platform.OS === 'web' && ({ cursor: 'pointer' } as const),
                ]}
              >
                <Ionicons
                  name={focused ? meta.active : meta.inactive}
                  size={17}
                  color={focused ? colors.primary : colors.textSecondary}
                />
                <Text
                  style={[
                    styles.itemLabel,
                    { color: focused ? colors.primary : colors.textSecondary },
                    focused && styles.itemLabelActive,
                  ]}
                  numberOfLines={1}
                >
                  {label}
                </Text>
              </Pressable>
            );
          })}
      </View>

      <View style={[styles.accountBlock, { borderTopColor: colors.borderLight }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Open profile"
          onPress={goProfile}
          style={({ pressed }) => [
            styles.accountRow,
            profileFocused && { backgroundColor: `${colors.primary}10` },
            pressed && { opacity: 0.9 },
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
              {user?.phone ? maskPhone(user.phone) : 'Account'}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={14} color={colors.textMuted} />
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Sign out"
          onPress={() => void logout()}
          style={({ pressed }) => [
            styles.signOut,
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
    paddingTop: spacing.md,
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    marginBottom: spacing.xs,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  logoPlate: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(13,107,87,0.15)',
  },
  logo: { width: 24, height: 24, resizeMode: 'contain' },
  brandCopy: { flex: 1, minWidth: 0 },
  brandName: { fontSize: 14, fontWeight: '700', letterSpacing: -0.2 },
  brandTag: { ...typography.caption, fontSize: 10, marginTop: 1 },
  nav: { flex: 1, paddingHorizontal: spacing.sm, gap: 2, paddingTop: spacing.xs },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: radius.md,
  },
  itemLabel: { fontSize: 13, fontWeight: '500', flexShrink: 1 },
  itemLabelActive: { fontWeight: '700' },
  accountBlock: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: spacing.sm,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
    gap: 4,
  },
  accountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: radius.md,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 11, fontWeight: '800' },
  accountCopy: { flex: 1, minWidth: 0 },
  accountName: { fontSize: 12, fontWeight: '700' },
  accountSub: { fontSize: 10, marginTop: 1 },
  signOut: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  signOutText: { fontSize: 12, fontWeight: '600' },
});
