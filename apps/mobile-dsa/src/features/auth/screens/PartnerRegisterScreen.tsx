import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import { StyleSheet, Text } from 'react-native';

import { Button, Input, Screen } from '@/components/ui';
import { getApiErrorMessage, normalizePhone } from '@/lib/utils';
import { validateIndianMobile } from '@/lib/validation';
import { authService } from '@/services';
import { colors, spacing } from '@/theme';

export function PartnerRegisterScreen() {
  const navigation = useNavigation();
  const [businessName, setBusinessName] = useState('');
  const [contactName, setContactName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [pan, setPan] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const submit = async () => {
    const phoneErr = validateIndianMobile(phone);
    if (phoneErr) {
      setError(phoneErr);
      return;
    }
    if (!contactName.trim() || !businessName.trim()) {
      setError('Business and contact name are required');
      return;
    }

    setError('');
    setLoading(true);
    try {
      await authService.sendOtp(normalizePhone(phone), 'LOGIN');
      setSuccess(
        'Your mobile is registered with Kuber Finserve. Complete OTP login to access the app. If login fails, contact your relationship manager to onboard your DSA account.',
      );
    } catch (e) {
      setError(
        `${getApiErrorMessage(e)}. Contact Kuber Finserve to register as a DSA partner with: ${businessName}, ${contactName}, ${email || 'N/A'}, PAN: ${pan || 'N/A'}.`,
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen title="Partner Registration" subtitle="Apply to join the KuberOne DSA network">
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {success ? <Text style={styles.success}>{success}</Text> : null}

      <Input label="Business Name" value={businessName} onChangeText={setBusinessName} />
      <Input label="Contact Name" value={contactName} onChangeText={setContactName} />
      <Input label="Mobile" keyboardType="phone-pad" maxLength={10} value={phone} onChangeText={setPhone} />
      <Input label="Email" keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={setEmail} />
      <Input label="PAN (optional)" autoCapitalize="characters" maxLength={10} value={pan} onChangeText={setPan} />

      <Button title="Check & Continue" fullWidth loading={loading} onPress={submit} />
      <Button title="Back to Login" variant="ghost" fullWidth onPress={() => navigation.goBack()} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  error: { color: colors.danger, marginBottom: spacing.md },
  success: { color: colors.success, marginBottom: spacing.md },
});
