import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { StyleSheet, Text } from 'react-native';

import { Button, Input, Screen } from '@/components/ui';
import { useAuth } from '@/hooks';
import { getApiErrorMessage } from '@/lib/utils';
import { customerService } from '@/services';
import { colors, spacing } from '@/theme';

export function EditProfileScreen() {
  const queryClient = useQueryClient();
  const { customerId, user } = useAuth();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const customer = useQuery({
    queryKey: ['customer', customerId],
    queryFn: () => customerService.getById(customerId!),
    enabled: !!customerId,
  });

  const profile = useQuery({
    queryKey: ['customer-profile', customerId],
    queryFn: () => customerService.profile(customerId!),
    enabled: !!customerId,
  });

  useEffect(() => {
    if (customer.data) {
      setFirstName(String(customer.data.firstName ?? ''));
      setLastName(String(customer.data.lastName ?? ''));
    }
    if (profile.data?.alternateEmail || user?.email) {
      setEmail(String(profile.data?.alternateEmail ?? user?.email ?? ''));
    }
  }, [customer.data, profile.data, user?.email]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!customerId) throw new Error('Customer profile not linked');
      if (!firstName.trim()) throw new Error('First name is required');

      await customerService.update(customerId, {
        firstName: firstName.trim(),
        lastName: lastName.trim() || undefined,
      });

      await customerService.upsertProfile({
        customerId,
        alternateEmail: email.trim() || undefined,
      });
    },
    onSuccess: async () => {
      setSuccess('Profile updated successfully');
      setError('');
      await queryClient.invalidateQueries({ queryKey: ['customer', customerId] });
      await queryClient.invalidateQueries({ queryKey: ['customer-profile', customerId] });
    },
    onError: (e) => {
      setSuccess('');
      setError(getApiErrorMessage(e));
    },
  });

  const save = () => {
    setError('');
    setSuccess('');
    saveMutation.mutate();
  };

  return (
    <Screen
      title="Edit Profile"
      subtitle="Update your personal information"
      loading={customer.isLoading || profile.isLoading}
    >
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {success ? <Text style={styles.success}>{success}</Text> : null}

      <Input label="First Name" value={firstName} onChangeText={setFirstName} autoCapitalize="words" />
      <Input label="Last Name" value={lastName} onChangeText={setLastName} autoCapitalize="words" />
      <Input
        label="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
      />

      <Button
        title="Save Changes"
        fullWidth
        loading={saveMutation.isPending}
        onPress={save}
        disabled={!firstName.trim()}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  error: { color: colors.danger, marginBottom: spacing.md },
  success: { color: colors.success, marginBottom: spacing.md },
});
