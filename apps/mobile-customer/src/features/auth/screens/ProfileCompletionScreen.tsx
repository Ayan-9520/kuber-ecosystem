import { useState } from 'react';
import { StyleSheet, Text } from 'react-native';

import { Button, Input, Screen } from '@/components/ui';
import { useAuth } from '@/hooks';
import { getApiErrorMessage } from '@/lib/utils';
import { customerService } from '@/services';
import { colors, spacing } from '@/theme';

export function ProfileCompletionScreen() {
  const { customerId, user } = useAuth();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState(user?.email ?? '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const save = async () => {
    if (!customerId) {
      setError('Customer profile not linked. Contact support.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await customerService.update(customerId, { firstName, lastName });
      await customerService.upsertProfile({
        customerId,
        alternateEmail: email || undefined,
        preferredLanguage: 'en',
        preferredContactChannel: 'SMS',
      });
      setDone(true);
    } catch (e) {
      setError(getApiErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <Screen title="Profile Complete" subtitle="You're all set to explore KuberOne">
        <Text style={styles.ok}>Your profile has been updated successfully.</Text>
      </Screen>
    );
  }

  return (
    <Screen title="Complete Profile" subtitle="Help us personalize your experience">
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Input label="First Name" value={firstName} onChangeText={setFirstName} />
      <Input label="Last Name" value={lastName} onChangeText={setLastName} />
      <Input label="Email (optional)" keyboardType="email-address" value={email} onChangeText={setEmail} autoCapitalize="none" />
      <Button title="Save Profile" fullWidth loading={loading} onPress={save} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  error: { color: colors.danger, marginBottom: spacing.md },
  ok: { color: colors.success },
});
