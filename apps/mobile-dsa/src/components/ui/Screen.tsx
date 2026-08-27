import { type ReactNode, useMemo } from 'react';
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  type ScrollViewProps,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useResponsiveLayout } from '@/hooks';
import { spacing, typography } from '@/theme';
import { type AppColors, useAppTheme } from '@/theme/ThemeProvider';

interface ScreenProps extends ScrollViewProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  headerRight?: ReactNode;
  loading?: boolean;
  scroll?: boolean;
  padded?: boolean;
}

function createStyles(colors: AppColors, contentMaxWidth: number | undefined, pagePad: number, isDesktop: boolean) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      ...(isDesktop && Platform.OS === 'web'
        ? ({
            backgroundImage: `radial-gradient(900px 420px at 8% -8%, ${colors.primary}10, transparent), ${colors.background}`,
          } as object)
        : null),
    },
    flex: { flex: 1 },
    padded: { paddingHorizontal: pagePad },
    scrollContent: {
      paddingBottom: isDesktop ? spacing.xxl + 16 : spacing.xxl,
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
      paddingVertical: isDesktop ? spacing.lg : spacing.md,
      width: '100%',
      maxWidth: contentMaxWidth,
      alignSelf: isDesktop ? 'stretch' : 'center',
    },
    headerLeft: { flex: 1 },
    title: { ...typography.h1, color: colors.text, fontSize: isDesktop ? 28 : 24 },
    subtitle: { ...typography.bodySm, color: colors.textMuted, marginTop: 4 },
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
  loading,
  scroll = true,
  padded = true,
  style,
  ...rest
}: ScreenProps) {
  const insets = useSafeAreaInsets();
  const { colors } = useAppTheme();
  const { contentMaxWidth, pagePad, isDesktop } = useResponsiveLayout();
  const styles = useMemo(
    () => createStyles(colors, contentMaxWidth, pagePad, isDesktop),
    [colors, contentMaxWidth, pagePad, isDesktop],
  );

  const header = (title || subtitle) && (
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
      <View style={[styles.container, { paddingTop: insets.top }]}>
        {header}
        <View style={[styles.bodyShell, ...contentStyle]}>{body}</View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
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
