import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Button, Card, Input, Screen, StatusBadge } from '@/components/ui';
import { useAuth } from '@/hooks';
import {
  flattenProductsWithVariants,
  toFinanceProductSlug,
  type ProductDisplayItem,
} from '@/lib/product-mapper';
import { formatCurrency, formatPercent, getApiErrorMessage } from '@/lib/utils';
import { eligibilityService, productsService } from '@/services';
import { colors, radius, spacing, typography } from '@/theme';

const EMPLOYMENT_TYPES = [
  { value: 'SALARIED', label: 'Salaried' },
  { value: 'SELF_EMPLOYED', label: 'Self Employed' },
  { value: 'BUSINESS_OWNER', label: 'Business Owner' },
  { value: 'PROFESSIONAL', label: 'Professional' },
  { value: 'RETIRED', label: 'Retired' },
  { value: 'OTHER', label: 'Other' },
] as const;

interface EligibilityResult {
  eligibleAmount?: number;
  approvalProbability?: number;
  outcome?: string;
  riskFlags?: string[];
  foir?: number | null;
  ltv?: number | null;
}

export function EligibilityScreen() {
  const { customerId } = useAuth();
  const [income, setIncome] = useState('');
  const [occupation, setOccupation] = useState<string>('SALARIED');
  const [propertyValue, setPropertyValue] = useState('');
  const [vehicleValue, setVehicleValue] = useState('');
  const [turnover, setTurnover] = useState('');
  const [loanAmount, setLoanAmount] = useState('');
  const [selectedProductId, setSelectedProductId] = useState('');

  const productsQuery = useQuery({
    queryKey: ['eligibility-products'],
    queryFn: async () => {
      const [products, variants] = await Promise.all([
        productsService.list({ limit: 50, isActive: true }),
        productsService.variants(),
      ]);
      return flattenProductsWithVariants(products.items, variants.items);
    },
  });

  const loanProducts = productsQuery.data ?? [];
  const selectedProduct: ProductDisplayItem | undefined =
    loanProducts.find((p) => `${p.productId}-${p.variant}` === selectedProductId) ?? loanProducts[0];

  const mutation = useMutation({
    mutationFn: () => {
      const monthlyIncome = Number(income);
      const requestedLoanAmount = loanAmount ? Number(loanAmount) : undefined;
      const selected = selectedProduct ?? loanProducts[0];
      if (!selected) throw new Error('No loan products available');

      return eligibilityService.calculate({
        customerId,
        persist: false,
        productSlug: toFinanceProductSlug(selected.slug, selected.variant),
        monthlyIncome,
        employmentType: occupation,
        propertyValue: propertyValue ? Number(propertyValue) : undefined,
        vehicleValue: vehicleValue ? Number(vehicleValue) : undefined,
        turnover: turnover ? Number(turnover) : undefined,
        requestedLoanAmount,
      });
    },
  });

  const result = mutation.data as EligibilityResult | undefined;
  const riskFlags = result?.riskFlags ?? [];

  const handleCalculate = () => {
    if (!income || Number(income) <= 0) return;
    mutation.mutate();
  };

  return (
    <Screen title="Eligibility Check" subtitle="Instant pre-approval assessment">
      <Card title="Your Details">
        <Input
          label="Monthly Income (₹)"
          value={income}
          onChangeText={setIncome}
          keyboardType="numeric"
          placeholder="e.g. 75000"
        />
        <Text style={styles.fieldLabel}>Occupation</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
          {EMPLOYMENT_TYPES.map((type) => (
            <Pressable
              key={type.value}
              style={[styles.chip, occupation === type.value && styles.chipActive]}
              onPress={() => setOccupation(type.value)}
            >
              <Text style={[styles.chipText, occupation === type.value && styles.chipTextActive]}>
                {type.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        <Input
          label="Property Value (₹)"
          value={propertyValue}
          onChangeText={setPropertyValue}
          keyboardType="numeric"
          placeholder="Optional"
        />
        <Input
          label="Vehicle Value (₹)"
          value={vehicleValue}
          onChangeText={setVehicleValue}
          keyboardType="numeric"
          placeholder="Optional"
        />
        <Input
          label="Annual Turnover (₹)"
          value={turnover}
          onChangeText={setTurnover}
          keyboardType="numeric"
          placeholder="For business loans"
        />
        <Input
          label="Requested Loan Amount (₹)"
          value={loanAmount}
          onChangeText={setLoanAmount}
          keyboardType="numeric"
          placeholder="Optional"
        />

        <Text style={styles.fieldLabel}>Loan Product</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
          {loanProducts.map((p) => {
            const key = `${p.productId}-${p.variant}`;
            return (
              <Pressable
                key={key}
                style={[styles.chip, selectedProductId === key && styles.chipActive]}
                onPress={() => setSelectedProductId(key)}
              >
                <Text style={[styles.chipText, selectedProductId === key && styles.chipTextActive]}>
                  {p.name}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <Button
          title="Check Eligibility"
          fullWidth
          loading={mutation.isPending}
          disabled={!income || Number(income) <= 0}
          onPress={handleCalculate}
        />
      </Card>

      {mutation.isError && (
        <Card>
          <View style={styles.errorRow}>
            <Ionicons name="alert-circle" size={20} color={colors.danger} />
            <Text style={styles.errorText}>{getApiErrorMessage(mutation.error)}</Text>
          </View>
        </Card>
      )}

      {result && (
        <Card title="Eligibility Result">
          <View style={styles.resultHeader}>
            {result.outcome && <StatusBadge status={result.outcome} />}
          </View>

          <View style={styles.resultGrid}>
            <View style={styles.resultItem}>
              <Text style={styles.resultLabel}>Approval Probability</Text>
              <Text style={styles.resultValue}>{formatPercent(result.approvalProbability)}</Text>
            </View>
            <View style={styles.resultItem}>
              <Text style={styles.resultLabel}>Eligible Amount</Text>
              <Text style={styles.resultValue}>{formatCurrency(result.eligibleAmount)}</Text>
            </View>
            {result.foir != null && (
              <View style={styles.resultItem}>
                <Text style={styles.resultLabel}>FOIR</Text>
                <Text style={styles.resultValue}>{formatPercent(result.foir, 1)}</Text>
              </View>
            )}
            {result.ltv != null && (
              <View style={styles.resultItem}>
                <Text style={styles.resultLabel}>LTV</Text>
                <Text style={styles.resultValue}>{formatPercent(result.ltv, 1)}</Text>
              </View>
            )}
          </View>

          {riskFlags.length > 0 && (
            <View style={styles.riskSection}>
              <Text style={styles.riskTitle}>Risk Flags</Text>
              {riskFlags.map((flag) => (
                <View key={flag} style={styles.riskRow}>
                  <Ionicons name="warning" size={16} color={colors.warning} />
                  <Text style={styles.riskText}>{flag}</Text>
                </View>
              ))}
            </View>
          )}
        </Card>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  fieldLabel: { ...typography.label, color: colors.textSecondary, marginBottom: spacing.sm },
  chipRow: { gap: spacing.sm, marginBottom: spacing.md, paddingRight: spacing.md },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: { backgroundColor: 'rgba(34,211,166,0.15)', borderColor: colors.primary },
  chipText: { ...typography.bodySm, color: colors.textMuted },
  chipTextActive: { color: colors.primary, fontWeight: '600' },
  errorRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  errorText: { ...typography.bodySm, color: colors.danger, flex: 1 },
  resultHeader: { marginBottom: spacing.md },
  resultGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  resultItem: {
    width: '47%',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  resultLabel: { ...typography.caption, color: colors.textMuted, fontSize: 10 },
  resultValue: { ...typography.h3, color: colors.primary, marginTop: 4, fontSize: 16 },
  riskSection: { marginTop: spacing.md, paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: colors.border },
  riskTitle: { ...typography.label, color: colors.warning, marginBottom: spacing.sm },
  riskRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm, paddingVertical: spacing.xs },
  riskText: { ...typography.bodySm, color: colors.textSecondary, flex: 1 },
});
