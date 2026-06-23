import { type RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Button, Input, Screen } from '@/components/ui';
import { getApiErrorMessage, normalizePhone } from '@/lib/utils';
import type { LeadsStackParamList } from '@/navigation/types';
import { leadsService } from '@/services';
import { radius, spacing, typography } from '@/theme';
import { useAppTheme } from '@/theme/ThemeProvider';

type Route = RouteProp<LeadsStackParamList, 'EditLead'>;

const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'] as const;

function createStyles(colors: ReturnType<typeof useAppTheme>['colors']) {
  return StyleSheet.create({
    error: { color: colors.danger, marginBottom: spacing.md },
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
  });
}

export function EditLeadScreen() {
  const { params } = useRoute<Route>();
  const navigation = useNavigation();
  const queryClient = useQueryClient();
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [prospectName, setProspectName] = useState('');
  const [prospectPhone, setProspectPhone] = useState('');
  const [prospectEmail, setProspectEmail] = useState('');
  const [requestedAmount, setRequestedAmount] = useState('');
  const [priority, setPriority] = useState<(typeof PRIORITIES)[number]>('MEDIUM');
  const [error, setError] = useState('');

  const lead = useQuery({
    queryKey: ['lead', params.id],
    queryFn: () => leadsService.getById(params.id),
  });

  useEffect(() => {
    if (lead.data) {
      setProspectName(String(lead.data.prospectName ?? ''));
      setProspectPhone(String(lead.data.prospectPhone ?? ''));
      setProspectEmail(String(lead.data.prospectEmail ?? ''));
      setRequestedAmount(String(lead.data.requestedAmount ?? ''));
      setPriority((String(lead.data.priority ?? 'MEDIUM').toUpperCase() as (typeof PRIORITIES)[number]) || 'MEDIUM');
    }
  }, [lead.data]);

  const updateMutation = useMutation({
    mutationFn: () =>
      leadsService.update(params.id, {
        prospectName: prospectName.trim(),
        prospectPhone: normalizePhone(prospectPhone),
        prospectEmail: prospectEmail.trim() || null,
        requestedAmount: requestedAmount ? Number(requestedAmount.replace(/,/g, '')) : undefined,
        priority,
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['lead', params.id] });
      await queryClient.invalidateQueries({ queryKey: ['leads'] });
      navigation.goBack();
    },
    onError: (e) => setError(getApiErrorMessage(e)),
  });

  if (lead.isLoading) return <Screen loading><></></Screen>;

  return (
    <Screen title="Edit Lead">
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Input label="Prospect Name" value={prospectName} onChangeText={setProspectName} />
      <Input label="Mobile" keyboardType="phone-pad" maxLength={10} value={prospectPhone} onChangeText={setProspectPhone} />
      <Input label="Email" keyboardType="email-address" autoCapitalize="none" value={prospectEmail} onChangeText={setProspectEmail} />
      <Input label="Loan Amount (₹)" keyboardType="numeric" value={requestedAmount} onChangeText={setRequestedAmount} />

      <Text style={[styles.chipText, { marginBottom: spacing.sm }]}>Priority</Text>
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

      <Button title="Save Changes" fullWidth loading={updateMutation.isPending} onPress={() => updateMutation.mutate()} />
    </Screen>
  );
}
