import { type RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { StyleSheet, Text } from 'react-native';

import { Button, Input, Screen } from '@/components/ui';
import { getApiErrorMessage, normalizePhone } from '@/lib/utils';
import type { LeadsStackParamList } from '@/navigation/types';
import { leadsService } from '@/services';
import { colors, spacing } from '@/theme';

type Route = RouteProp<LeadsStackParamList, 'EditLead'>;

export function EditLeadScreen() {
  const { params } = useRoute<Route>();
  const navigation = useNavigation();
  const queryClient = useQueryClient();
  const [prospectName, setProspectName] = useState('');
  const [prospectPhone, setProspectPhone] = useState('');
  const [prospectEmail, setProspectEmail] = useState('');
  const [requestedAmount, setRequestedAmount] = useState('');
  const [priority, setPriority] = useState('');
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
      setPriority(String(lead.data.priority ?? 'MEDIUM'));
    }
  }, [lead.data]);

  const updateMutation = useMutation({
    mutationFn: () =>
      leadsService.update(params.id, {
        prospectName: prospectName.trim(),
        prospectPhone: normalizePhone(prospectPhone),
        prospectEmail: prospectEmail.trim() || null,
        requestedAmount: requestedAmount ? Number(requestedAmount) : undefined,
        priority: priority || 'MEDIUM',
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
      <Input label="Priority (LOW/MEDIUM/HIGH/URGENT)" autoCapitalize="characters" value={priority} onChangeText={setPriority} />
      <Button title="Save Changes" fullWidth loading={updateMutation.isPending} onPress={() => updateMutation.mutate()} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  error: { color: colors.danger, marginBottom: spacing.md },
});
