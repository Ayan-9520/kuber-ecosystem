import { Ionicons } from '@expo/vector-icons';
import { type BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { useResponsiveLayout } from '@/hooks';
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
  Profile: { active: 'person', inactive: 'person-outline', label: 'Profile' },
};

/**
 * Desktop left rail for Partner DSA web. Used only when isDesktop;
 * mobile keeps the default bottom tab bar.
 */
export function PartnerDesktopTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const { colors } = useAppTheme();
  const { sidebarWidth } = useResponsiveLayout();

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
          <Text style={[styles.brandName, { color: colors.text }]}>KuberOne</Text>
          <Text style={[styles.brandTag, { color: colors.textMuted }]}>Partner workspace</Text>
        </View>
      </View>

      <View style={styles.nav} accessibilityRole="tablist">
        {state.routes.map((route, index) => {
          const focused = state.index === index;
          const { options } = descriptors[route.key];
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
                  backgroundColor: focused ? `${colors.primary}14` : pressed ? colors.background : 'transparent',
                },
              ]}
            >
              <Ionicons
                name={focused ? meta.active : meta.inactive}
                size={22}
                color={focused ? colors.primary : colors.textSecondary}
              />
              <Text
                style={[
                  styles.itemLabel,
                  { color: focused ? colors.primary : colors.textSecondary },
                ]}
                numberOfLines={1}
              >
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={[styles.footer, { borderTopColor: colors.borderLight }]}>
        <Ionicons name="shield-checkmark-outline" size={14} color={colors.primary} />
        <Text style={[styles.footerText, { color: colors.textMuted }]}>Kuber Finserve · Secure</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  rail: {
    height: '100%',
    borderRightWidth: StyleSheet.hairlineWidth,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    marginBottom: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  logoPlate: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(13,107,87,0.18)',
  },
  logo: { width: 30, height: 30, resizeMode: 'contain' },
  brandCopy: { flex: 1, minWidth: 0 },
  brandName: { fontSize: 16, fontWeight: '800', letterSpacing: -0.3 },
  brandTag: { ...typography.caption, marginTop: 2, fontSize: 11 },
  nav: { flex: 1, paddingHorizontal: spacing.sm, gap: 2 },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: radius.md,
  },
  itemLabel: { fontSize: 13, fontWeight: '700', flexShrink: 1 },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  footerText: { ...typography.caption, fontSize: 10 },
});
