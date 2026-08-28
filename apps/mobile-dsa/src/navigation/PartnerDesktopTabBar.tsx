import { Ionicons } from '@expo/vector-icons';
import { type BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { LinearGradient } from 'expo-linear-gradient';
import { Image, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { useResponsiveLayout } from '@/hooks';
import { radius, spacing, typography } from '@/theme';
import { premiumHover } from '@/theme/premium';
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
          borderRightColor: `${colors.primary}22`,
          ...(Platform.OS === 'web'
            ? ({
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
                boxShadow: '4px 0 32px rgba(2, 20, 16, 0.08)',
              } as object)
            : null),
        },
      ]}
    >
      <View style={[styles.brand, { borderBottomColor: `${colors.primary}18` }]}>
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
                focused && styles.itemFocused,
                {
                  backgroundColor: focused
                    ? `${colors.primary}16`
                    : pressed
                      ? `${colors.primary}08`
                      : 'transparent',
                  borderColor: focused ? `${colors.primary}40` : 'transparent',
                },
                premiumHover(),
                Platform.OS === 'web' && ({ cursor: 'pointer' } as const),
              ]}
            >
              {focused ? (
                <LinearGradient
                  colors={[`${colors.primary}40`, colors.primary]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 0, y: 1 }}
                  style={styles.activeBar}
                />
              ) : null}
              <View style={[styles.iconCircle, focused && { backgroundColor: `${colors.primary}22` }]}>
                <Ionicons
                  name={focused ? meta.active : meta.inactive}
                  size={20}
                  color={focused ? colors.primary : colors.textSecondary}
                />
              </View>
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

      <View style={[styles.footer, { borderTopColor: `${colors.primary}18`, backgroundColor: `${colors.primary}06` }]}>
        <Ionicons name="shield-checkmark" size={14} color={colors.primary} />
        <Text style={[styles.footerText, { color: colors.textMuted }]}>Kuber Finserve · Secure</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  rail: {
    height: '100%',
    borderRightWidth: 1,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    marginBottom: spacing.sm,
    borderBottomWidth: 1,
  },
  logoPlate: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(13,107,87,0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  logo: { width: 32, height: 32, resizeMode: 'contain' },
  brandCopy: { flex: 1, minWidth: 0 },
  brandName: { fontSize: 17, fontWeight: '800', letterSpacing: -0.4 },
  brandTag: { ...typography.caption, marginTop: 2, fontSize: 10, letterSpacing: 0.4, textTransform: 'uppercase' },
  nav: { flex: 1, paddingHorizontal: spacing.md, gap: 4 },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 11,
    paddingHorizontal: 12,
    borderRadius: radius.lg,
    borderWidth: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  itemFocused: {},
  activeBar: {
    position: 'absolute',
    left: 0,
    top: 8,
    bottom: 8,
    width: 3,
    borderRadius: 2,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemLabel: { fontSize: 13, fontWeight: '600', flexShrink: 1 },
  itemLabelActive: { fontWeight: '800' },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderRadius: radius.md,
  },
  footerText: { ...typography.caption, fontSize: 10, fontWeight: '600' },
});
