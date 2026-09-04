import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Button, Card, Input, PageHero, Screen, StatusBadge } from '@/components/ui';
import { useAuth, useResponsiveLayout } from '@/hooks';
import {
  fetchCustomerCatalog,
  toFinanceProductSlug,
  uniqueProductsForPicker,
  type ProductDisplayItem,
} from '@/lib/product-mapper';
import { formatCurrency, formatPercent, getApiErrorMessage } from '@/lib/utils';
import { eligibilityService } from '@/services';
import { type AppColors, useAppTheme } from '@/theme/ThemeProvider';
import { radius, spacing, typography } from '@/theme';

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
  const { colors } = useAppTheme();
  const { customerId } = useAuth();
  const { isDesktop, pagePad } = useResponsiveLayout();
  const styles = useMemo(
    () => createStyles(colors, isDesktop, pagePad),
    [colors, isDesktop, pagePad],
  );

  const [income, setIncome] = useState('');
  const [occupation, setOccupation] = useState<string>('SALARIED');
  const [propertyValue, setPropertyValue] = useState('');
  const [vehicleValue, setVehicleValue] = useState('');
  const [turnover, setTurnover] = useState('');
  const [loanAmount, setLoanAmount] = useState('');
  const [selectedProductId, setSelectedProductId] = useState('');

  const productsQuery = useQuery({
    queryKey: ['eligibility-products-v2'],
    queryFn: async () => {
      const catalog = await fetchCustomerCatalog();
      // One chip per product name — never show 4× "Home Loan"
      const byName = new Map<string, ProductDisplayItem>();
      for (const item of uniqueProductsForPicker(catalog)) {
        const key = item.name.trim().toLowerCase();
        if (!byName.has(key)) byName.set(key, item);
      }
      return Array.from(byName.values());
    },
    staleTime: 60_000,
  });

  const loanProducts = productsQuery.data ?? [];

  useEffect(() => {
    if (!selectedProductId && loanProducts.length > 0) {
      setSelectedProductId(loanProducts[0].id);
    }
  }, [loanProducts, selectedProductId]);

  const selectedProduct: ProductDisplayItem | undefined =
    loanProducts.find((p) => p.id === selectedProductId) ??
    loanProducts.find((p) => p.productId === selectedProductId) ??
    loanProducts[0];

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
    <Screen scroll padded={false} loading={productsQuery.isLoading}>
      <PageHero
        eyebrow="Tools"
        title="Eligibility"
        subtitle="Instant pre-approval assessment"
        icon="checkmark-done"
      />

      <View style={styles.body}>
        <Card elevated title="Your details">
          <View style={styles.fieldGrid}>
            <View style={styles.fieldCol}>
              <Input
                label="Monthly Income (₹)"
                value={income}
                onChangeText={setIncome}
                keyboardType="numeric"
                placeholder="e.g. 75000"
              />
            </View>
            <View style={styles.fieldCol}>
              <Input
                label="Requested Loan Amount (₹)"
                value={loanAmount}
                onChangeText={setLoanAmount}
                keyboardType="numeric"
                placeholder="Optional"
              />
            </View>
          </View>

          <Text style={styles.fieldLabel}>Occupation</Text>
          <View style={styles.chipWrap}>
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
          </View>

          <View style={styles.fieldGrid}>
            <View style={styles.fieldCol}>
              <Input
                label="Property Value (₹)"
                value={propertyValue}
                onChangeText={setPropertyValue}
                keyboardType="numeric"
                placeholder="Optional"
              />
            </View>
            <View style={styles.fieldCol}>
              <Input
                label="Vehicle Value (₹)"
                value={vehicleValue}
                onChangeText={setVehicleValue}
                keyboardType="numeric"
                placeholder="Optional"
              />
            </View>
            <View style={styles.fieldCol}>
              <Input
                label="Annual Turnover (₹)"
                value={turnover}
                onChangeText={setTurnover}
                keyboardType="numeric"
                placeholder="For business loans"
              />
            </View>
          </View>

          <Text style={styles.fieldLabel}>Loan Product</Text>
          <View style={styles.chipWrap}>
            {loanProducts.map((p) => (
              <Pressable
                key={p.id}
                style={[
                  styles.chip,
                  (selectedProductId === p.id || selectedProductId === p.productId) &&
                    styles.chipActive,
                ]}
                onPress={() => setSelectedProductId(p.id)}
              >
                <Text
                  style={[
                    styles.chipText,
                    (selectedProductId === p.id || selectedProductId === p.productId) &&
                      styles.chipTextActive,
                  ]}
                >
                  {p.name}
                </Text>
              </Pressable>
            ))}
          </View>

          <Button
            title="Check Eligibility"
            fullWidth
            loading={mutation.isPending}
            disabled={!income || Number(income) <= 0 || loanProducts.length === 0}
            onPress={handleCalculate}
          />
        </Card>

        {mutation.isError ? (
          <Card elevated>
            <View style={styles.errorRow}>
              <Ionicons name="alert-circle" size={20} color={colors.danger} />
              <Text style={styles.errorText}>{getApiErrorMessage(mutation.error)}</Text>
            </View>
          </Card>
        ) : null}

        {result ? (
          <Card elevated title="Eligibility result">
            <View style={styles.resultHeader}>
              {result.outcome ? <StatusBadge status={result.outcome} /> : null}
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
              {result.foir != null ? (
                <View style={styles.resultItem}>
                  <Text style={styles.resultLabel}>FOIR</Text>
                  <Text style={styles.resultValue}>{formatPercent(result.foir, 1)}</Text>
                </View>
              ) : null}
              {result.ltv != null ? (
                <View style={styles.resultItem}>
                  <Text style={styles.resultLabel}>LTV</Text>
                  <Text style={styles.resultValue}>{formatPercent(result.ltv, 1)}</Text>
                </View>
              ) : null}
            </View>

            {riskFlags.length > 0 ? (
              <View style={styles.riskSection}>
                <Text style={styles.riskTitle}>Risk Flags</Text>
                {riskFlags.map((flag) => (
                  <View key={flag} style={styles.riskRow}>
                    <Ionicons name="warning" size={16} color={colors.warning} />
                    <Text style={styles.riskText}>{flag}</Text>
                  </View>
                ))}
              </View>
            ) : null}
          </Card>
        ) : null}
      </View>
    </Screen>
  );
}

function createStyles(colors: AppColors, isDesktop: boolean, pagePad: number) {
  return StyleSheet.create({
    body: {
      paddingHorizontal: pagePad,
      paddingBottom: spacing.xl,
      gap: spacing.md,
      maxWidth: isDesktop ? 920 : undefined,
      width: '100%',
      alignSelf: 'center',
    },
    fieldGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.md,
    },
    fieldCol: {
      flexGrow: 1,
      flexBasis: isDesktop ? '45%' : '100%',
      minWidth: isDesktop ? 240 : undefined,
    },
    fieldLabel: { ...typography.label, color: colors.textSecondary, marginBottom: spacing.sm },
    chipWrap: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.sm,
      marginBottom: spacing.md,
    },
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
      width: isDesktop ? '23%' : '47%',
      minWidth: 120,
      flexGrow: 1,
      backgroundColor: colors.surface,
      borderRadius: radius.md,
      padding: spacing.sm,
      borderWidth: 1,
      borderColor: colors.border,
    },
    resultLabel: { ...typography.caption, color: colors.textMuted, fontSize: 10 },
    resultValue: { ...typography.h3, color: colors.primary, marginTop: 4, fontSize: 16 },
    riskSection: {
      marginTop: spacing.md,
      paddingTop: spacing.md,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    riskTitle: { ...typography.label, color: colors.warning, marginBottom: spacing.sm },
    riskRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: spacing.sm,
      paddingVertical: spacing.xs,
    },
    riskText: { ...typography.bodySm, color: colors.textSecondary, flex: 1 },
  });
}
