import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { type NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button, Card, EmptyState, Screen } from '@/components/ui';
import { useAuth } from '@/hooks';
import { navigateToApplicationWizard } from '@/lib/application-navigation';
import { fetchCustomerCatalog } from '@/lib/product-mapper';
import { formatCurrency } from '@/lib/utils';
import type { ProductsStackParamList } from '@/navigation/types';
import { recommendationsService } from '@/services';
import { radius, spacing, typography } from '@/theme';
import { type AppColors, useAppTheme } from '@/theme/ThemeProvider';

function formatRate(min: number, max: number, familyCode: string): string {
  if (familyCode === 'INS') return 'Premium plans from ₹10K/year';
  if (familyCode === 'CC') return 'Joining fee waived on select cards';
  if (min === max) return `${min}% p.a.`;
  return `${min}% – ${max}% p.a.`;
}

function formatRecommendationReason(reason: string): string {
  const cleaned = reason
    .replace(/MATCHES\s+/gi, '')
    .replace(/WITH CONFIGURED LIMITS/gi, '')
    .replace(/₹[\d,]+(\s*-\s*₹[\d,]+)?/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  if (!cleaned || cleaned.length > 80) {
    return 'Strong match based on your profile and eligibility';
  }
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1).toLowerCase();
}

function createStyles(colors: AppColors) {
  return StyleSheet.create({
    hero: {
      backgroundColor: colors.card,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: colors.borderLight,
      padding: spacing.lg,
      marginBottom: spacing.md,
    },
    heroTitle: { ...typography.h3, color: colors.text },
    heroSub: { ...typography.bodySm, color: colors.textMuted, marginTop: 4, lineHeight: 20 },
    recCard: {
      backgroundColor: colors.surface,
      borderRadius: radius.md,
      padding: spacing.md,
      marginBottom: spacing.sm,
      borderWidth: 1,
      borderColor: colors.border,
    },
    recTitle: { ...typography.h3, color: colors.text, marginBottom: spacing.sm },
    recName: { ...typography.label, color: colors.text },
    recSub: { ...typography.bodySm, color: colors.textMuted, marginTop: 4, lineHeight: 18 },
    recBadge: {
      alignSelf: 'flex-start',
      marginTop: spacing.sm,
      paddingHorizontal: spacing.sm,
      paddingVertical: 4,
      borderRadius: radius.full,
      backgroundColor: `${colors.primary}22`,
    },
    recBadgeText: { ...typography.caption, color: colors.primary, fontSize: 10 },
    productRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
    iconWrap: {
      width: 52,
      height: 52,
      borderRadius: radius.lg,
      backgroundColor: `${colors.primary}18`,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: `${colors.primary}33`,
    },
    productInfo: { flex: 1 },
    productName: { ...typography.h3, color: colors.text, fontSize: 17 },
    productDesc: { ...typography.bodySm, color: colors.textMuted, marginTop: 4, lineHeight: 18 },
    metaRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', marginTop: spacing.sm, gap: 6 },
    ratePill: {
      paddingHorizontal: spacing.sm,
      paddingVertical: 4,
      borderRadius: radius.full,
      backgroundColor: `${colors.primary}15`,
    },
    rateText: { ...typography.caption, color: colors.primary, fontSize: 10, textTransform: 'none' },
    amountText: { ...typography.bodySm, color: colors.textSecondary, fontSize: 12 },
    countBadge: {
      marginTop: spacing.xs,
      alignSelf: 'flex-start',
      paddingHorizontal: spacing.sm,
      paddingVertical: 4,
      borderRadius: radius.full,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    countText: { ...typography.caption, color: colors.textMuted, fontSize: 10 },
    cardActions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
    applyBtn: { flex: 1 },
  });
}

export function LoanProductsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ProductsStackParamList>>();
  const { customerId, isAuthenticated } = useAuth();
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const recommendations = useQuery({
    queryKey: ['customer-recommendations', customerId],
    queryFn: () => recommendationsService.forCustomer(customerId!),
    enabled: !!customerId,
  });

  const productsQuery = useQuery({
    queryKey: ['loan-products', isAuthenticated],
    queryFn: () => fetchCustomerCatalog(),
    retry: 2,
    staleTime: 60_000,
  });

  const recData = recommendations.data as {
    products?: Array<{ productName: string; reason: string; approvalProbability: number }>;
  } | undefined;

  const products = productsQuery.data ?? [];

  return (
    <Screen title="Loan Products" subtitle="Explore premium financing options" loading={productsQuery.isLoading}>
      <View style={styles.hero}>
        <Text style={styles.heroTitle}>India's complete finance suite</Text>
        <Text style={styles.heroSub}>
          Home loans, business credit, insurance & cards — apply digitally in minutes.
        </Text>
        {products.length > 0 ? (
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{products.length} products available</Text>
          </View>
        ) : null}
      </View>

      {products.length === 0 && !productsQuery.isLoading ? (
        <EmptyState
          title="No products available"
          description="Pull to refresh or try again shortly"
          action={<Button title="Refresh" onPress={() => productsQuery.refetch()} />}
        />
      ) : null}

      {recData?.products && recData.products.length > 0 && (
        <Card title="Recommended For You" elevated>
          {recData.products.slice(0, 2).map((p) => (
            <View key={p.productName} style={styles.recCard}>
              <Text style={styles.recName}>{p.productName}</Text>
              <Text style={styles.recSub}>{formatRecommendationReason(p.reason)}</Text>
              {p.approvalProbability > 0 ? (
                <View style={styles.recBadge}>
                  <Text style={styles.recBadgeText}>
                    {Math.round(p.approvalProbability)}% approval likelihood
                  </Text>
                </View>
              ) : null}
            </View>
          ))}
        </Card>
      )}

      {products.map((product) => (
        <Card key={`${product.productId}-${product.variant}`} elevated>
          <View style={styles.productRow}>
            <View style={styles.iconWrap}>
              <Ionicons name={product.icon} size={26} color={colors.primary} />
            </View>
            <View style={styles.productInfo}>
              <Text style={styles.productName}>{product.name}</Text>
              <Text style={styles.productDesc} numberOfLines={2}>
                {product.description}
              </Text>
              <View style={styles.metaRow}>
                <View style={styles.ratePill}>
                  <Text style={styles.rateText}>
                    {formatRate(product.interestMin, product.interestMax, product.familyCode)}
                  </Text>
                </View>
                <Text style={styles.amountText}>Up to {formatCurrency(product.maxAmount)}</Text>
              </View>
            </View>
          </View>
          <View style={styles.cardActions}>
            <Button
              title="Details"
              variant="secondary"
              style={styles.applyBtn}
              onPress={() =>
                navigation.navigate('ProductDetail', {
                  slug: product.slug,
                  name: product.name,
                  variant: product.variant,
                  id: /^[0-9a-f-]{36}$/i.test(product.productId) ? product.productId : undefined,
                  familyCode: product.familyCode,
                })
              }
            />
            <Button
              title="Apply Now"
              style={styles.applyBtn}
              onPress={() => navigateToApplicationWizard(navigation, product)}
            />
          </View>
        </Card>
      ))}
    </Screen>
  );
}
