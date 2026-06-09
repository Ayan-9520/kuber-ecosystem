import { useNavigation } from '@react-navigation/native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { StyleSheet, Text } from 'react-native';

import { Button, Input, Screen } from '@/components/ui';
import { useAuth } from '@/hooks';
import { getApiErrorMessage, normalizePhone } from '@/lib/utils';
import { referralsService } from '@/services';
import { colors, spacing } from '@/theme';

export function CreateReferralScreen() {
  const navigation = useNavigation();
  const queryClient = useQueryClient();
  const { partnerId, user } = useAuth();
  const [refereeName, setRefereeName] = useState('');
  const [refereePhone, setRefereePhone] = useState('');
  const [refereeEmail, setRefereeEmail] = useState('');
  const [requestedAmount, setRequestedAmount] = useState('');
  const [error, setError] = useState('');

  const types = useQuery({
    queryKey: ['referral-types'],
    queryFn: () => referralsService.types({ limit: 20 }),
  });

  const dsaType = types.data?.items.find((t) => t.code === 'DSA') ?? types.data?.items[0];

  const createMutation = useMutation({
    mutationFn: () =>
      referralsService.create({
        referralTypeCode: 'DSA',
        referralTypeId: dsaType?.id,
        referrerPartnerId: partnerId,
        referrerName: String(user?.phone ?? 'DSA Partner'),
        referrerPhone: user?.phone,
        refereeName: refereeName.trim(),
        refereePhone: normalizePhone(refereePhone),
        refereeEmail: refereeEmail.trim() || undefined,
        partnerId,
        requestedAmount: requestedAmount ? Number(requestedAmount) : undefined,
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['referrals'] });
      navigation.goBack();
    },
    onError: (e) => setError(getApiErrorMessage(e)),
  });

  return (
    <Screen title="Create Referral">
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Input label="Referee Name" value={refereeName} onChangeText={setRefereeName} />
      <Input label="Referee Mobile" keyboardType="phone-pad" maxLength={10} value={refereePhone} onChangeText={setRefereePhone} />
      <Input label="Referee Email" keyboardType="email-address" autoCapitalize="none" value={refereeEmail} onChangeText={setRefereeEmail} />
      <Input label="Expected Loan Amount (₹)" keyboardType="numeric" value={requestedAmount} onChangeText={setRequestedAmount} />
      <Button title="Submit Referral" fullWidth loading={createMutation.isPending} onPress={() => createMutation.mutate()} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  error: { color: colors.danger, marginBottom: spacing.md },
});
