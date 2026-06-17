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

function createStyles(colors: AppColors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    flex: { flex: 1 },
    padded: { paddingHorizontal: spacing.md },
    scrollContent: { paddingBottom: spacing.xxl },
    header: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.md,
    },
    headerLeft: { flex: 1 },
    title: { ...typography.h1, color: colors.text, fontSize: 24 },
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
  const styles = useMemo(() => createStyles(colors), [colors]);

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
        <View style={[styles.flex, ...contentStyle]}>{body}</View>
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
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.empty}>
      <Text style={styles.emptyTitle}>{title}</Text>
      {description && <Text style={styles.emptyDesc}>{description}</Text>}
      {action && <View style={styles.emptyAction}>{action}</View>}
    </View>
  );
}
