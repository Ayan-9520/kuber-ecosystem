import { useNavigation } from '@react-navigation/native';
import { type NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useState, useMemo } from 'react';
import { StyleSheet, Text } from 'react-native';
import { useDispatch } from 'react-redux';

import { Button, Input, Screen } from '@/components/ui';
import { getApiErrorMessage, normalizePhone } from '@/lib/utils';
import { validateIndianMobile } from '@/lib/validation';
import type { AuthStackParamList } from '@/navigation/types';
import { authService, partnersService } from '@/services';
import { setRequiresPartnerKyc } from '@/store/slices/authSlice';
import { type AppColors, useAppTheme } from '@/theme/ThemeProvider';
import { spacing } from '@/theme';

export function PartnerRegisterScreen() {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList>>();
  const dispatch = useDispatch();
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
      const normalizedPhone = normalizePhone(phone);
      await partnersService.register({
        businessName: businessName.trim(),
        contactName: contactName.trim(),
        phone: normalizedPhone,
        email: email.trim() || undefined,
        pan: pan.trim().toUpperCase() || undefined,
      });

      await authService.sendOtp(normalizedPhone, 'LOGIN');
      dispatch(setRequiresPartnerKyc(true));
      setSuccess('Registration submitted. Sign in with OTP to complete KYC verification.');
      navigation.navigate('OtpLogin', { phone: normalizedPhone, fromRegister: true });
    } catch (e) {
      setError(getApiErrorMessage(e));
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

      <Button title="Register & Continue" fullWidth loading={loading} onPress={submit} />
      <Button title="Back to Login" variant="ghost" fullWidth onPress={() => navigation.goBack()} />
    </Screen>
  );
}

function createStyles(colors: AppColors) {
  return StyleSheet.create({
  error: { color: colors.danger, marginBottom: spacing.md },
  success: { color: colors.success, marginBottom: spacing.md },
});
}
