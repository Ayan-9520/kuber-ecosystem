import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { type NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Button, Card, Input, Screen } from '@/components/ui';
import { useAuth } from '@/hooks';
import { DSA_PRODUCT_OPTIONS, sortProductsForDsa } from '@/lib/product-catalog';
import { getApiErrorMessage, normalizePhone } from '@/lib/utils';
import type { LeadsStackParamList } from '@/navigation/types';
import { leadsService, productsService } from '@/services';
import { radius, spacing, typography } from '@/theme';
import { useAppTheme } from '@/theme/ThemeProvider';

const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'] as const;

function createStyles(colors: ReturnType<typeof useAppTheme>['colors']) {
  return StyleSheet.create({
    error: { color: colors.danger, marginBottom: spacing.md },
    sectionLabel: { ...typography.label, color: colors.textMuted, marginBottom: spacing.sm, marginTop: spacing.sm },
    chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.md },
    chip: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: radius.full,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
    },
    chipActive: { borderColor: colors.primary, backgroundColor: `${colors.primary}18` },
    chipText: { ...typography.bodySm, color: colors.textSecondary },
    chipTextActive: { color: colors.primary, fontWeight: '600' },
    hint: { ...typography.caption, color: colors.textMuted, marginBottom: spacing.md },
  });
}

export function CreateLeadScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<LeadsStackParamList>>();
  const queryClient = useQueryClient();
  const { partnerId } = useAuth();
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [prospectName, setProspectName] = useState('');
  const [prospectPhone, setProspectPhone] = useState('');
  const [prospectEmail, setProspectEmail] = useState('');
  const [requestedAmount, setRequestedAmount] = useState('');
  const [productId, setProductId] = useState('');
  const [sourceId, setSourceId] = useState('');
  const [priority, setPriority] = useState<(typeof PRIORITIES)[number]>('MEDIUM');
  const [error, setError] = useState('');

  const sources = useQuery({
    queryKey: ['lead-sources'],
    queryFn: () => leadsService.sources({ limit: 50, channel: 'PARTNER' }),
  });

  const products = useQuery({
    queryKey: ['dsa-products'],
    queryFn: () => productsService.list({ limit: 50, isActive: true }),
  });

  const productOptions = useMemo(
    () => sortProductsForDsa(products.data?.items ?? []),
    [products.data?.items],
  );

  const sourceOptions = sources.data?.items ?? [];
  const defaultSource = sourceOptions.find((s) => s.code === 'DSA') ?? sourceOptions[0];

  useEffect(() => {
    if (!productId && productOptions.length > 0) {
      const preferred =
        productOptions.find((p) => String(p.code).toUpperCase() === 'PL-01') ?? productOptions[0];
      setProductId(String(preferred?.id ?? ''));
    }
    if (!sourceId && defaultSource?.id) {
      setSourceId(String(defaultSource.id));
    }
  }, [productId, productOptions, sourceId, defaultSource?.id]);

  const selectedProduct = productOptions.find((p) => String(p.id) === productId);

  const createMutation = useMutation({
    mutationFn: () =>
      leadsService.create({
        prospectName: prospectName.trim(),
        prospectPhone: normalizePhone(prospectPhone),
        prospectEmail: prospectEmail.trim() || undefined,
        requestedAmount: requestedAmount ? Number(requestedAmount.replace(/,/g, '')) : undefined,
        productId,
        sourceId,
        partnerId,
        priority,
        assignImmediately: true,
        scoringProfile: requestedAmount
          ? {
              loanAmount: Number(requestedAmount.replace(/,/g, '')),
              monthlyIncome: Number(requestedAmount.replace(/,/g, '')) / 20,
            }
          : undefined,
      }),
    onSuccess: async (lead) => {
      await queryClient.invalidateQueries({ queryKey: ['leads'] });
      navigation.replace('LeadDetail', { id: String(lead.id) });
    },
    onError: (e) => setError(getApiErrorMessage(e)),
  });

  const submit = () => {
    if (!prospectName.trim() || prospectPhone.replace(/\D/g, '').length < 10) {
      setError('Name and valid 10-digit mobile are required');
      return;
    }
    if (!productId) {
      setError('Select a loan product');
      return;
    }
    if (!sourceId) {
      setError('Lead source not configured — contact support');
      return;
    }
    setError('');
    createMutation.mutate();
  };

  return (
    <Screen title="New Lead" subtitle="Add prospect to your DSA pipeline">
      <Text style={styles.hint}>Lead will be linked to your partner account automatically.</Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Card title="Prospect Details" elevated>
        <Input label="Full Name *" value={prospectName} onChangeText={setProspectName} placeholder="e.g. Rahul Sharma" />
        <Input
          label="Mobile *"
          keyboardType="phone-pad"
          maxLength={10}
          value={prospectPhone}
          onChangeText={setProspectPhone}
          placeholder="10-digit number"
        />
        <Input
          label="Email (optional)"
          keyboardType="email-address"
          autoCapitalize="none"
          value={prospectEmail}
          onChangeText={setProspectEmail}
        />
        <Input
          label="Expected Loan Amount (₹)"
          keyboardType="numeric"
          value={requestedAmount}
          onChangeText={setRequestedAmount}
          placeholder="e.g. 2500000"
        />
      </Card>

      <Card title="Product *" elevated>
        {products.isLoading ? (
          <Text style={styles.hint}>Loading products...</Text>
        ) : productOptions.length === 0 ? (
          <Text style={styles.error}>Products unavailable. Run seed or contact admin.</Text>
        ) : (
          <>
            <Text style={styles.sectionLabel}>Select product</Text>
            <View style={styles.chipRow}>
              {productOptions.map((product) => {
                const id = String(product.id);
                const label =
                  DSA_PRODUCT_OPTIONS.find((e) => e.code === String(product.code).toUpperCase())?.label ??
                  String(product.name);
                return (
                  <Pressable
                    key={id}
                    style={[styles.chip, productId === id && styles.chipActive]}
                    onPress={() => setProductId(id)}
                  >
                    <Text style={[styles.chipText, productId === id && styles.chipTextActive]}>{label}</Text>
                  </Pressable>
                );
              })}
            </View>
            {selectedProduct ? (
              <Text style={styles.hint}>
                Selected: {String(selectedProduct.name)} ({String(selectedProduct.code)})
              </Text>
            ) : null}
          </>
        )}
      </Card>

      <Card title="Priority" elevated>
        <View style={styles.chipRow}>
          {PRIORITIES.map((p) => (
            <Pressable
              key={p}
              style={[styles.chip, priority === p && styles.chipActive]}
              onPress={() => setPriority(p)}
            >
              <Text style={[styles.chipText, priority === p && styles.chipTextActive]}>{p}</Text>
            </Pressable>
          ))}
        </View>
      </Card>

      <Button
        title="Create Lead"
        fullWidth
        loading={createMutation.isPending}
        onPress={submit}
        icon={<Ionicons name="person-add" size={18} color={colors.onPrimary} />}
      />
    </Screen>
  );
}
