import { Ionicons } from '@expo/vector-icons';
import { CommonActions, type RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { type NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import { StyleSheet, Text, View } from 'react-native';

import { Button, Card, EmptyState, Screen } from '@/components/ui';
import {
  flattenProductsWithVariants,
  mapProductToDisplay,
  type ProductDisplayItem,
  resolveProductFromApi,
} from '@/lib/product-mapper';
import { formatCurrency } from '@/lib/utils';
import type { ProductsStackParamList } from '@/navigation/types';
import { productsService } from '@/services';
import { colors, radius, spacing, typography } from '@/theme';

type ProductDetailRoute = RouteProp<ProductsStackParamList, 'ProductDetail'>;

function hasCompleteParams(params: ProductDetailRoute['params']): boolean {
  return !!(params.slug && params.name && params.variant);
}

export function ProductDetailScreen() {
  const { params } = useRoute<ProductDetailRoute>();
  const navigation = useNavigation<NativeStackNavigationProp<ProductsStackParamList>>();

  const productQuery = useQuery({
    queryKey: ['product-detail', params.id, params.slug, params.name, params.variant],
    queryFn: async (): Promise<ProductDisplayItem | null> => {
      if (hasCompleteParams(params) && params.slug && params.name && params.variant) {
        if (params.id) {
          const resolved = await resolveProductFromApi({
            id: params.id,
            variant: params.variant,
          });
          if (resolved) return resolved;
        }
        return mapProductToDisplay(
          {
            id: params.id ?? params.slug,
            code: params.slug,
            name: params.name,
          },
          { variantCode: params.variant, name: params.name },
        );
      }

      return resolveProductFromApi({
        id: params.id,
        slug: params.slug,
        variant: params.variant,
      });
    },
  });

  const catalogQuery = useQuery({
    queryKey: ['product-catalog-detail'],
    queryFn: async () => {
      const [products, variants] = await Promise.all([
        productsService.list({ limit: 50, isActive: true }),
        productsService.variants(),
      ]);
      return flattenProductsWithVariants(products.items, variants.items);
    },
    enabled: productQuery.isError,
  });

  const product =
    productQuery.data ??
    (params.slug
      ? catalogQuery.data?.find(
          (p) =>
            p.slug === params.slug?.toUpperCase() &&
            (!params.variant || p.variant === params.variant) &&
            (!params.name || p.name === params.name),
        )
      : undefined);

  const handleApply = () => {
    if (!product) return;
    const wizardParams = {
      productSlug: product.slug,
      productName: product.name,
      variant: product.variant,
    };
    const parent = navigation.getParent();
    if (parent) {
      parent.navigate('Applications', { screen: 'ApplicationWizard', params: wizardParams });
      return;
    }
    navigation.dispatch(
      CommonActions.navigate({
        name: 'Applications',
        params: { screen: 'ApplicationWizard', params: wizardParams },
      } as Parameters<typeof CommonActions.navigate>[0]),
    );
  };

  if (productQuery.isLoading) {
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
          description="This loan product may no longer be available"
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
            <Text style={styles.statLabel}>Interest Rate</Text>
            <Text style={styles.statValue}>
              {product.interestMin}% – {product.interestMax}%
            </Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>Max Amount</Text>
            <Text style={styles.statValue}>{formatCurrency(product.maxAmount)}</Text>
          </View>
        </View>
      </View>

      <Card title="Key Features">
        {product.features.map((feature) => (
          <View key={feature} style={styles.featureRow}>
            <Ionicons name="checkmark-circle" size={18} color={colors.primary} />
            <Text style={styles.featureText}>{feature}</Text>
          </View>
        ))}
      </Card>

      <Card title="Eligibility Range" subtitle="Typical qualifying criteria">
        <View style={styles.eligibilityGrid}>
          <View style={styles.eligibilityItem}>
            <Text style={styles.eligibilityLabel}>Loan Type</Text>
            <Text style={styles.eligibilityValue}>{product.slug.replace(/_/g, ' ')}</Text>
          </View>
          <View style={styles.eligibilityItem}>
            <Text style={styles.eligibilityLabel}>Variant</Text>
            <Text style={styles.eligibilityValue}>{product.variant.replace(/_/g, ' ')}</Text>
          </View>
          <View style={styles.eligibilityItem}>
            <Text style={styles.eligibilityLabel}>Max Funding</Text>
            <Text style={styles.eligibilityValue}>{formatCurrency(product.maxAmount)}</Text>
          </View>
          <View style={styles.eligibilityItem}>
            <Text style={styles.eligibilityLabel}>Rate Band</Text>
            <Text style={styles.eligibilityValue}>
              {product.interestMin}% – {product.interestMax}% p.a.
            </Text>
          </View>
        </View>
      </Card>

      <Card title="Required Documents">
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
        title="Apply Now"
        fullWidth
        onPress={handleApply}
        icon={<Ionicons name="arrow-forward" size={18} color={colors.background} />}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  heroIcon: {
    width: 64,
    height: 64,
    borderRadius: radius.lg,
    backgroundColor: 'rgba(34,211,166,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
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
});
