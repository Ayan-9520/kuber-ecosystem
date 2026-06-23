import { useNavigation } from '@react-navigation/native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Text } from 'react-native';

import { Button, Input, Screen } from '@/components/ui';
import { useAuth } from '@/hooks';
import { getApiErrorMessage, normalizePhone } from '@/lib/utils';
import { partnersService, referralsService } from '@/services';
import { spacing } from '@/theme';
import { useAppTheme } from '@/theme/ThemeProvider';

export function CreateReferralScreen() {
  const navigation = useNavigation();
  const queryClient = useQueryClient();
  const { partnerId, user } = useAuth();
  const { colors } = useAppTheme();
  const [refereeName, setRefereeName] = useState('');
  const [refereePhone, setRefereePhone] = useState('');
  const [refereeEmail, setRefereeEmail] = useState('');
  const [requestedAmount, setRequestedAmount] = useState('');
  const [error, setError] = useState('');

  const partner = useQuery({
    queryKey: ['partner-profile', partnerId],
    queryFn: () => partnersService.getById(partnerId!),
    enabled: !!partnerId,
  });

  const types = useQuery({
    queryKey: ['referral-types'],
    queryFn: () => referralsService.types({ limit: 20 }),
  });

  const dsaType = types.data?.items.find((t) => t.code === 'DSA') ?? types.data?.items[0];
  const referrerName = String(
    partner.data?.contactName ?? partner.data?.businessName ?? user?.phone ?? 'DSA Partner',
  );

  const createMutation = useMutation({
    mutationFn: () =>
      referralsService.create({
        referralTypeCode: 'DSA',
        referralTypeId: dsaType?.id,
        referrerPartnerId: partnerId,
        referrerName,
        referrerPhone: user?.phone,
        refereeName: refereeName.trim(),
        refereePhone: normalizePhone(refereePhone),
        refereeEmail: refereeEmail.trim() || undefined,
        partnerId,
        requestedAmount: requestedAmount ? Number(requestedAmount.replace(/,/g, '')) : undefined,
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['referrals'] });
      await queryClient.invalidateQueries({ queryKey: ['leads'] });
      navigation.goBack();
    },
    onError: (e) => setError(getApiErrorMessage(e)),
  });

  const submit = () => {
    if (!refereeName.trim() || refereePhone.replace(/\D/g, '').length < 10) {
      setError('Referee name and valid mobile required');
      return;
    }
    setError('');
    createMutation.mutate();
  };

  return (
    <Screen title="Create Referral" subtitle={`Referring as ${referrerName}`}>
      {error ? <Text style={{ color: colors.danger, marginBottom: spacing.md }}>{error}</Text> : null}
      <Input label="Referee Name *" value={refereeName} onChangeText={setRefereeName} />
      <Input label="Referee Mobile *" keyboardType="phone-pad" maxLength={10} value={refereePhone} onChangeText={setRefereePhone} />
      <Input label="Referee Email" keyboardType="email-address" autoCapitalize="none" value={refereeEmail} onChangeText={setRefereeEmail} />
      <Input label="Expected Loan Amount (₹)" keyboardType="numeric" value={requestedAmount} onChangeText={setRequestedAmount} />
      <Button title="Submit Referral" fullWidth loading={createMutation.isPending} onPress={submit} />
    </Screen>
  );
}
