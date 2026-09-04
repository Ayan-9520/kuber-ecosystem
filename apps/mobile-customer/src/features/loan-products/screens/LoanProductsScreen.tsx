import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { type NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { Button, Card, EmptyState, PageHero, Screen, SectionHeader } from '@/components/ui';
import { useAuth, useResponsiveLayout } from '@/hooks';
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

export function LoanProductsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ProductsStackParamList>>();
  const { customerId, isAuthenticated } = useAuth();
  const { colors } = useAppTheme();
  const { isDesktop, pagePad, listColumns } = useResponsiveLayout();
  const styles = useMemo(
    () => createStyles(colors, isDesktop, pagePad, listColumns),
    [colors, isDesktop, pagePad, listColumns],
  );

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
    <Screen scroll padded={false} loading={productsQuery.isLoading}>
      <PageHero
        eyebrow="Catalogue"
        title="Loan Products"
        subtitle="Explore premium financing options"
        icon="grid"
        actions={
          products.length > 0 ? (
            <View style={styles.countPill}>
              <Text style={styles.countPillText}>{products.length} available</Text>
            </View>
          ) : null
        }
      />

      <View style={styles.body}>
        {products.length === 0 && !productsQuery.isLoading ? (
          <EmptyState
            title="No products available"
            description="Pull to refresh or try again shortly"
            action={<Button title="Refresh" onPress={() => productsQuery.refetch()} />}
          />
        ) : null}

        {recData?.products && recData.products.length > 0 ? (
          <View style={styles.section}>
            <SectionHeader eyebrow="For you" title="Recommended" subtitle="Matched to your profile" />
            <Card elevated>
              {recData.products.slice(0, 2).map((p, idx, arr) => (
                <View
                  key={p.productName}
                  style={[styles.recCard, idx === arr.length - 1 && styles.recCardLast]}
                >
                  <View style={styles.recTop}>
                    <View style={styles.recIcon}>
                      <Ionicons name="sparkles" size={16} color={colors.primary} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.recName}>{p.productName}</Text>
                      <Text style={styles.recSub}>{formatRecommendationReason(p.reason)}</Text>
                    </View>
                  </View>
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
          </View>
        ) : null}

        <View style={styles.section}>
          <SectionHeader eyebrow="Browse" title="All products" subtitle="Home, business, auto & more" />
          <View style={styles.productGrid}>
            {products.map((product) => (
              <View key={`${product.productId}-${product.variant}`} style={styles.productCell}>
                <Card elevated>
                  <View style={styles.productRow}>
                    <View style={styles.iconWrap}>
                      <Ionicons name={product.icon} size={24} color={colors.primary} />
                    </View>
                    <View style={styles.productInfo}>
                      <Text style={styles.productName}>{product.name}</Text>
                      <Text style={styles.productDesc} numberOfLines={2}>
                        {product.description}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.metaRow}>
                    <View style={styles.ratePill}>
                      <Text style={styles.rateText}>
                        {formatRate(product.interestMin, product.interestMax, product.familyCode)}
                      </Text>
                    </View>
                    <Text style={styles.amountText}>Up to {formatCurrency(product.maxAmount)}</Text>
                  </View>
                  <View style={styles.cardActions}>
                    <Pressable
                      style={({ pressed }) => [
                        styles.ghostBtn,
                        pressed && { opacity: 0.88 },
                        Platform.OS === 'web' && ({ cursor: 'pointer' } as const),
                      ]}
                      onPress={() =>
                        navigation.navigate('ProductDetail', {
                          slug: product.slug,
                          name: product.name,
                          variant: product.variant,
                          id: /^[0-9a-f-]{36}$/i.test(product.productId) ? product.productId : undefined,
                          familyCode: product.familyCode,
                        })
                      }
                    >
                      <Text style={styles.ghostBtnText}>Details</Text>
                    </Pressable>
                    <Pressable
                      style={({ pressed }) => [
                        styles.primaryBtn,
                        pressed && { opacity: 0.9 },
                        Platform.OS === 'web' && ({ cursor: 'pointer' } as const),
                      ]}
                      onPress={() => navigateToApplicationWizard(navigation, product)}
                    >
                      <Text style={styles.primaryBtnText}>Apply Now</Text>
                      <Ionicons name="arrow-forward" size={14} color={colors.onPrimary} />
                    </Pressable>
                  </View>
                </Card>
              </View>
            ))}
          </View>
        </View>
      </View>
    </Screen>
  );
}

function createStyles(colors: AppColors, isDesktop: boolean, pagePad: number, listColumns: number) {
  return StyleSheet.create({
    body: { paddingHorizontal: pagePad, paddingBottom: spacing.xl, gap: spacing.md },
    section: { gap: spacing.sm },
    countPill: {
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: radius.full,
      backgroundColor: `${colors.primary}14`,
      borderWidth: 1,
      borderColor: `${colors.primary}30`,
    },
    countPillText: { fontSize: 11, fontWeight: '700', color: colors.primary },
    recCard: {
      paddingBottom: spacing.md,
      marginBottom: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.borderLight,
    },
    recCardLast: { borderBottomWidth: 0, marginBottom: 0, paddingBottom: 0 },
    recTop: { flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-start' },
    recIcon: {
      width: 32,
      height: 32,
      borderRadius: 10,
      backgroundColor: `${colors.primary}14`,
      alignItems: 'center',
      justifyContent: 'center',
    },
    recName: { ...typography.label, color: colors.text, fontSize: 14 },
    recSub: { ...typography.bodySm, color: colors.textMuted, marginTop: 4, lineHeight: 18 },
    recBadge: {
      alignSelf: 'flex-start',
      marginTop: spacing.sm,
      marginLeft: 40,
      paddingHorizontal: spacing.sm,
      paddingVertical: 4,
      borderRadius: radius.full,
      backgroundColor: `${colors.primary}16`,
    },
    recBadgeText: { ...typography.caption, color: colors.primary, fontSize: 10, fontWeight: '700' },
    productGrid: {
      flexDirection: listColumns > 1 ? 'row' : 'column',
      flexWrap: 'wrap',
      gap: spacing.md,
    },
    productCell: {
      flexBasis: listColumns > 1 ? '48%' : '100%',
      flexGrow: 1,
      minWidth: listColumns > 1 ? 320 : undefined,
    },
    productRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
    iconWrap: {
      width: 48,
      height: 48,
      borderRadius: radius.md,
      backgroundColor: `${colors.primary}14`,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: `${colors.primary}28`,
    },
    productInfo: { flex: 1, minWidth: 0 },
    productName: { ...typography.h3, color: colors.text, fontSize: isDesktop ? 15 : 17, fontWeight: '700' },
    productDesc: { ...typography.bodySm, color: colors.textMuted, marginTop: 4, lineHeight: 18 },
    metaRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', marginTop: spacing.md, gap: 8 },
    ratePill: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: radius.full,
      backgroundColor: `${colors.primary}12`,
      borderWidth: 1,
      borderColor: `${colors.primary}25`,
    },
    rateText: { ...typography.caption, color: colors.primary, fontSize: 11, fontWeight: '700', textTransform: 'none' },
    amountText: { ...typography.bodySm, color: colors.textSecondary, fontSize: 12, fontWeight: '600' },
    cardActions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
    ghostBtn: {
      flex: 1,
      minHeight: 42,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.borderLight,
      backgroundColor: colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
    },
    ghostBtnText: { ...typography.label, color: colors.text, fontSize: 13 },
    primaryBtn: {
      flex: 1.2,
      minHeight: 42,
      borderRadius: radius.md,
      backgroundColor: colors.primary,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
    },
    primaryBtnText: { ...typography.label, color: colors.onPrimary, fontSize: 13, fontWeight: '700' },
  });
}
