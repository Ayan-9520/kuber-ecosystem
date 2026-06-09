import { useNavigation } from '@react-navigation/native';
import { type NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { StyleSheet, Text } from 'react-native';

import { Button, Input, Screen } from '@/components/ui';
import { useAuth } from '@/hooks';
import { getApiErrorMessage, normalizePhone } from '@/lib/utils';
import type { LeadsStackParamList } from '@/navigation/types';
import { leadsService, productsService } from '@/services';
import { colors, spacing } from '@/theme';

export function CreateLeadScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<LeadsStackParamList>>();
  const queryClient = useQueryClient();
  const { partnerId } = useAuth();
  const [prospectName, setProspectName] = useState('');
  const [prospectPhone, setProspectPhone] = useState('');
  const [prospectEmail, setProspectEmail] = useState('');
  const [requestedAmount, setRequestedAmount] = useState('');
  const [productId, setProductId] = useState('');
  const [sourceId, setSourceId] = useState('');
  const [error, setError] = useState('');

  const sources = useQuery({
    queryKey: ['lead-sources'],
    queryFn: () => leadsService.sources({ limit: 50, channel: 'PARTNER' }),
  });

  const products = useQuery({
    queryKey: ['products'],
    queryFn: () => productsService.list({ limit: 50 }),
    retry: false,
  });

  const existingLeads = useQuery({
    queryKey: ['leads-products-fallback'],
    queryFn: () => leadsService.list({ limit: 50 }),
    enabled: products.isError,
  });

  const productOptions = products.data?.items.length
    ? products.data.items
    : [...new Map(
        (existingLeads.data?.items ?? [])
          .filter((l) => l.productId)
          .map((l) => [String(l.productId), { id: l.productId, name: l.productName ?? 'Product' }]),
      ).values()];

  const sourceOptions = sources.data?.items ?? [];
  const defaultSource = sourceOptions.find((s) => s.code === 'DSA') ?? sourceOptions[0];
  const defaultProduct = productOptions[0];

  const createMutation = useMutation({
    mutationFn: () =>
      leadsService.create({
        prospectName: prospectName.trim(),
        prospectPhone: normalizePhone(prospectPhone),
        prospectEmail: prospectEmail.trim() || undefined,
        requestedAmount: requestedAmount ? Number(requestedAmount) : undefined,
        productId: productId || defaultProduct?.id,
        sourceId: sourceId || defaultSource?.id,
        partnerId,
        priority: 'MEDIUM',
        assignImmediately: true,
        scoringProfile: requestedAmount
          ? { loanAmount: Number(requestedAmount), monthlyIncome: Number(requestedAmount) / 20 }
          : undefined,
      }),
    onSuccess: async (lead) => {
      await queryClient.invalidateQueries({ queryKey: ['leads'] });
      navigation.replace('LeadDetail', { id: String(lead.id) });
    },
    onError: (e) => setError(getApiErrorMessage(e)),
  });

  const submit = () => {
    if (!prospectName.trim() || prospectPhone.length < 10) {
      setError('Name and valid mobile are required');
      return;
    }
    if (!productId && !defaultProduct?.id) {
      setError('No product available. Create a lead from admin or contact support.');
      return;
    }
    if (!sourceId && !defaultSource?.id) {
      setError('Lead source not configured');
      return;
    }
    setError('');
    createMutation.mutate();
  };

  return (
    <Screen title="Create Lead" subtitle="Submit a new prospect to your pipeline">
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Input label="Prospect Name" value={prospectName} onChangeText={setProspectName} />
      <Input label="Mobile" keyboardType="phone-pad" maxLength={10} value={prospectPhone} onChangeText={setProspectPhone} />
      <Input label="Email (optional)" keyboardType="email-address" autoCapitalize="none" value={prospectEmail} onChangeText={setProspectEmail} />
      <Input label="Loan Amount (₹)" keyboardType="numeric" value={requestedAmount} onChangeText={setRequestedAmount} />

      {productOptions.length > 0 && (
        <Input
          label={`Product (${String(defaultProduct?.name ?? 'select')})`}
          placeholder="Product ID (auto-selected if blank)"
          value={productId}
          onChangeText={setProductId}
        />
      )}

      {sourceOptions.length > 0 && (
        <Input
          label={`Source (${String(defaultSource?.name ?? 'DSA')})`}
          placeholder="Source ID (auto-selected if blank)"
          value={sourceId}
          onChangeText={setSourceId}
        />
      )}

      <Button title="Create Lead" fullWidth loading={createMutation.isPending} onPress={submit} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  error: { color: colors.danger, marginBottom: spacing.md },
});
