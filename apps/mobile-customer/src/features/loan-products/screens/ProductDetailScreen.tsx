import { Ionicons } from '@expo/vector-icons';
import { type RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { type NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { navigateToApplicationWizard } from '@/lib/application-navigation';
import { getProductFamilyMeta } from '@/lib/product-display';
import { fetchCustomerCatalog } from '@/lib/product-mapper';
import { formatCurrency } from '@/lib/utils';
import type { ProductsStackParamList } from '@/navigation/types';
import { radius, spacing, typography } from '@/theme';
import { type AppColors, useAppTheme } from '@/theme/ThemeProvider';

import { Button, Card, EmptyState, Screen } from '@/components/ui';

type ProductDetailRoute = RouteProp<ProductsStackParamList, 'ProductDetail'>;

function createStyles(colors: AppColors) {
  return StyleSheet.create({
    hero: {
      backgroundColor: colors.card,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: colors.borderLight,
      padding: spacing.lg,
      marginBottom: spacing.md,
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
    },
    heroIcon: {
      width: 64,
      height: 64,
      borderRadius: radius.lg,
      backgroundColor: `${colors.primary}18`,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: `${colors.primary}33`,
    },
    heroStats: { flex: 1, gap: spacing.sm },
    stat: { gap: 2 },
    statLabel: { ...typography.caption, color: colors.textMuted },
    statValue: { ...typography.label, color: colors.text },
    featureRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.xs },
    featureText: { ...typography.body, color: colors.textSecondary, flex: 1 },
    eligibilityGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
    eligibilityItem: {
      width: '47%',
      backgroundColor: colors.surface,
      borderRadius: radius.md,
      padding: spacing.sm,
      borderWidth: 1,
      borderColor: colors.border,
    },
    eligibilityLabel: { ...typography.caption, color: colors.textMuted, fontSize: 10 },
    eligibilityValue: { ...typography.label, color: colors.text, marginTop: 4, fontSize: 12 },
    docGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
    docChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: colors.surface,
      borderRadius: radius.full,
      paddingHorizontal: spacing.sm,
      paddingVertical: 6,
      borderWidth: 1,
      borderColor: colors.border,
    },
    docText: { ...typography.bodySm, color: colors.textSecondary },
    stepRow: { flexDirection: 'row', gap: spacing.md, paddingVertical: spacing.sm },
    stepNum: {
      width: 28,
      height: 28,
      borderRadius: radius.full,
      backgroundColor: `${colors.primary}22`,
      alignItems: 'center',
      justifyContent: 'center',
    },
    stepNumText: { ...typography.label, color: colors.primary, fontSize: 13 },
    stepText: { ...typography.body, color: colors.textSecondary, flex: 1, lineHeight: 20 },
    ctaHint: {
      ...typography.bodySm,
      color: colors.textMuted,
      textAlign: 'center',
      marginTop: spacing.sm,
      marginBottom: spacing.md,
    },
  });
}

export function ProductDetailScreen() {
  const { params } = useRoute<ProductDetailRoute>();
  const navigation = useNavigation<NativeStackNavigationProp<ProductsStackParamList>>();
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const catalogQuery = useQuery({
    queryKey: ['product-catalog-detail', params.slug, params.id],
    queryFn: () => fetchCustomerCatalog(),
  });

  const product = useMemo(() => {
    const items = catalogQuery.data ?? [];
    return (
      items.find((p) => params.id && p.productId === params.id) ??
      items.find(
        (p) =>
          p.slug === params.slug?.toUpperCase() &&
          (!params.variant || p.variant === params.variant),
      ) ??
      items.find((p) => p.slug === params.slug?.toUpperCase())
    );
  }, [catalogQuery.data, params.id, params.slug, params.variant]);

  const meta = getProductFamilyMeta(product?.familyCode ?? params.familyCode ?? '');

  const handleApply = () => {
    if (!product) return;
    navigateToApplicationWizard(navigation, product);
  };

  if (catalogQuery.isLoading) {
    return (
      <Screen loading title="Product Details">
        {null}
      </Screen>
    );
  }

  if (!product) {
    return (
      <Screen>
        <EmptyState
          title="Product not found"
          description="This product may no longer be available"
          action={
            <Button title="Back to Products" variant="secondary" onPress={() => navigation.goBack()} />
          }
        />
      </Screen>
    );
  }

  return (
    <Screen title={product.name} subtitle={product.description}>
      <View style={styles.hero}>
        <View style={styles.heroIcon}>
          <Ionicons name={product.icon} size={32} color={colors.primary} />
        </View>
        <View style={styles.heroStats}>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>{meta.statPrimaryLabel}</Text>
            <Text style={styles.statValue}>{meta.statPrimaryValue(product)}</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>{meta.statSecondaryLabel}</Text>
            <Text style={styles.statValue}>{meta.statSecondaryValue(product)}</Text>
          </View>
        </View>
      </View>

      <Card title={meta.processTitle} elevated>
        {meta.processSteps.map((step, index) => (
          <View key={step} style={styles.stepRow}>
            <View style={styles.stepNum}>
              <Text style={styles.stepNumText}>{index + 1}</Text>
            </View>
            <Text style={styles.stepText}>{step}</Text>
          </View>
        ))}
      </Card>

      <Card title="Key Benefits" elevated>
        {product.features.map((feature) => (
          <View key={feature} style={styles.featureRow}>
            <Ionicons name="checkmark-circle" size={18} color={colors.primary} />
            <Text style={styles.featureText}>{feature}</Text>
          </View>
        ))}
      </Card>

      <Card title="Eligibility Snapshot" subtitle="Indicative criteria — final decision by lender" elevated>
        <View style={styles.eligibilityGrid}>
          <View style={styles.eligibilityItem}>
            <Text style={styles.eligibilityLabel}>Product</Text>
            <Text style={styles.eligibilityValue}>{product.name}</Text>
          </View>
          <View style={styles.eligibilityItem}>
            <Text style={styles.eligibilityLabel}>{meta.fundingLabel}</Text>
            <Text style={styles.eligibilityValue}>{formatCurrency(product.maxAmount)}</Text>
          </View>
          <View style={styles.eligibilityItem}>
            <Text style={styles.eligibilityLabel}>{meta.rateLabel}</Text>
            <Text style={styles.eligibilityValue}>{meta.statPrimaryValue(product)}</Text>
          </View>
          <View style={styles.eligibilityItem}>
            <Text style={styles.eligibilityLabel}>Processing</Text>
            <Text style={styles.eligibilityValue}>100% digital via KuberOne</Text>
          </View>
        </View>
      </Card>

      <Card title="Documents You'll Need" elevated>
        <View style={styles.docGrid}>
          {product.documents.map((doc) => (
            <View key={doc} style={styles.docChip}>
              <Ionicons name="document-text-outline" size={14} color={colors.primary} />
              <Text style={styles.docText}>{doc}</Text>
            </View>
          ))}
        </View>
      </Card>

      <Button
        title={meta.applyLabel}
        fullWidth
        onPress={handleApply}
        icon={<Ionicons name="arrow-forward" size={18} color={colors.onPrimary} />}
      />
      <Text style={styles.ctaHint}>Takes about 5 minutes · No branch visit required</Text>
    </Screen>
  );
}
