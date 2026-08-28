import { useNavigation, useRoute } from '@react-navigation/native';
import { type ReactNode, useMemo } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  type ScrollViewProps,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useResponsiveLayout } from '@/hooks';
import { spacing, typography } from '@/theme';
import { meshBackground } from '@/theme/premium';
import { type AppColors, useAppTheme } from '@/theme/ThemeProvider';

/** Auth/onboarding screens use Screen title because stack header is hidden. */
const KEEP_SCREEN_HEADER_ROUTES = new Set([
  'PartnerRegister',
  'PartnerKyc',
  'OtpLogin',
  'Onboarding',
]);

interface ScreenProps extends ScrollViewProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  headerRight?: ReactNode;
  /** Force Screen header even when stack header is visible (rare). */
  forceHeader?: boolean;
  loading?: boolean;
  scroll?: boolean;
  padded?: boolean;
}

function useShowScreenHeader(
  hasTitle: boolean,
  forceHeader: boolean | undefined,
): boolean {
  const navigation = useNavigation();
  const route = useRoute();
  if (!hasTitle) return false;
  if (forceHeader) return true;
  if (KEEP_SCREEN_HEADER_ROUTES.has(route.name)) return true;
  // Nested stack routes already show the native header — avoid duplicate titles.
  if (navigation.canGoBack()) return false;
  return true;
}

function createStyles(colors: AppColors, contentMaxWidth: number | undefined, pagePad: number, isDesktop: boolean) {
  return StyleSheet.create({
    container: {
      flex: 1,
      ...meshBackground(colors, isDesktop),
    },
    flex: { flex: 1 },
    padded: { paddingHorizontal: pagePad },
    scrollContent: {
      paddingBottom: isDesktop ? spacing.xl + 16 : spacing.xxl,
      width: '100%',
      maxWidth: contentMaxWidth,
      alignSelf: isDesktop ? 'stretch' : 'center',
    },
    bodyShell: {
      width: '100%',
      maxWidth: contentMaxWidth,
      alignSelf: isDesktop ? 'stretch' : 'center',
      flex: 1,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      paddingHorizontal: pagePad,
      paddingTop: isDesktop ? spacing.md : spacing.md,
      paddingBottom: spacing.sm,
      width: '100%',
      maxWidth: contentMaxWidth,
      alignSelf: isDesktop ? 'stretch' : 'center',
    },
    headerLeft: { flex: 1 },
    title: {
      ...typography.h1,
      color: colors.text,
      fontSize: isDesktop ? 22 : 24,
      fontWeight: '700',
      letterSpacing: -0.4,
    },
    subtitle: { ...typography.bodySm, color: colors.textMuted, marginTop: 4, fontSize: isDesktop ? 13 : 13 },
    loading: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 80 },
    empty: { alignItems: 'center', paddingVertical: spacing.xxl, paddingHorizontal: spacing.lg },
    emptyTitle: { ...typography.h3, color: colors.textSecondary, textAlign: 'center' },
    emptyDesc: { ...typography.bodySm, color: colors.textMuted, textAlign: 'center', marginTop: spacing.sm },
    emptyAction: { marginTop: spacing.lg },
  });
}

export function Screen({
  children,
  title,
  subtitle,
  headerRight,
  forceHeader,
  loading,
  scroll = true,
  padded = true,
  style,
  ...rest
}: ScreenProps) {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { colors } = useAppTheme();
  const { contentMaxWidth, pagePad, isDesktop } = useResponsiveLayout();
  const styles = useMemo(
    () => createStyles(colors, contentMaxWidth, pagePad, isDesktop),
    [colors, contentMaxWidth, pagePad, isDesktop],
  );

  const showHeader = useShowScreenHeader(!!(title || subtitle), forceHeader);
  const topInset = navigation.canGoBack() ? 0 : insets.top;

  const header = showHeader && (title || subtitle) && (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        {title && <Text style={styles.title}>{title}</Text>}
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
      {headerRight}
    </View>
  );

  const body = loading ? (
    <View style={styles.loading}>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  ) : (
    children
  );

  const contentStyle = [padded && styles.padded, style];

  if (!scroll) {
    return (
      <View style={[styles.container, { paddingTop: topInset }]}>
        {header}
        <View style={[styles.bodyShell, ...contentStyle]}>{body}</View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: topInset }]}>
      {header}
      <ScrollView
        style={styles.flex}
        contentContainerStyle={[styles.scrollContent, padded && styles.padded]}
        showsVerticalScrollIndicator={false}
        {...rest}
      >
        {body}
      </ScrollView>
    </View>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  const { colors } = useAppTheme();
  const { contentMaxWidth, pagePad, isDesktop } = useResponsiveLayout();
  const styles = useMemo(
    () => createStyles(colors, contentMaxWidth, pagePad, isDesktop),
    [colors, contentMaxWidth, pagePad, isDesktop],
  );

  return (
    <View style={styles.empty}>
      <Text style={styles.emptyTitle}>{title}</Text>
      {description && <Text style={styles.emptyDesc}>{description}</Text>}
      {action && <View style={styles.emptyAction}>{action}</View>}
    </View>
  );
}
