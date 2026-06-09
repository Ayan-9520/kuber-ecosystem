import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { type NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import { StyleSheet, Text, View } from 'react-native';

import { Card, Screen } from '@/components/ui';
import { LOAN_PRODUCTS } from '@/constants/products';
import { useAuth } from '@/hooks';
import { formatCurrency } from '@/lib/utils';
import type { ProductsStackParamList } from '@/navigation/types';
import { recommendationsService } from '@/services/recommendations.service';
import { colors, radius, spacing, typography } from '@/theme';

export function LoanProductsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ProductsStackParamList>>();
  const { customerId } = useAuth();

  const recommendations = useQuery({
    queryKey: ['customer-recommendations', customerId],
    queryFn: () => recommendationsService.forCustomer(customerId!),
    enabled: !!customerId,
  });

  const recData = recommendations.data as {
    products?: Array<{ productName: string; reason: string; approvalProbability: number }>;
    lenders?: Array<{ lenderName: string; reason: string }>;
  } | undefined;

  return (
    <Screen title="Loan Products" subtitle="Explore premium financing options">
      {recData?.products && recData.products.length > 0 && (
        <Card>
          <Text style={styles.recTitle}>Recommended For You</Text>
          {recData.products.slice(0, 2).map((p) => (
            <View key={p.productName} style={styles.recItem}>
              <Text style={styles.recName}>{p.productName}</Text>
              <Text style={styles.recSub}>{p.reason}</Text>
            </View>
          ))}
        </Card>
      )}
      {LOAN_PRODUCTS.map((product) => (
          <Card
            key={`${product.slug}-${product.variant}`}
            onPress={() =>
              navigation.navigate('ProductDetail', {
                slug: product.slug,
                name: product.name,
                variant: product.variant,
              })
            }
          >
            <View style={styles.productRow}>
              <View style={styles.iconWrap}>
                <Ionicons
                  name={product.icon as keyof typeof Ionicons.glyphMap}
                  size={24}
                  color={colors.primary}
                />
              </View>
              <View style={styles.productInfo}>
                <Text style={styles.productName}>{product.name}</Text>
                <Text style={styles.productDesc} numberOfLines={2}>
                  {product.description}
                </Text>
                <View style={styles.metaRow}>
                  <Text style={styles.meta}>
                    {product.interestMin}% – {product.interestMax}% p.a.
                  </Text>
                  <Text style={styles.metaDot}>·</Text>
                  <Text style={styles.meta}>Up to {formatCurrency(product.maxAmount)}</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
            </View>
          </Card>
        ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  productRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: 'rgba(34,211,166,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  productInfo: { flex: 1 },
  productName: { ...typography.h3, color: colors.text },
  productDesc: { ...typography.bodySm, color: colors.textMuted, marginTop: 4 },
  metaRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', marginTop: spacing.sm, gap: 4 },
  meta: { ...typography.bodySm, color: colors.primary, fontSize: 12 },
  metaDot: { color: colors.textMuted, fontSize: 12 },
  recTitle: { ...typography.h3, color: colors.text, marginBottom: spacing.sm },
  recItem: { paddingVertical: spacing.xs, borderBottomWidth: 1, borderBottomColor: colors.border },
  recName: { ...typography.bodySm, color: colors.text, fontWeight: '600' },
  recSub: { ...typography.caption, color: colors.textMuted },
});
