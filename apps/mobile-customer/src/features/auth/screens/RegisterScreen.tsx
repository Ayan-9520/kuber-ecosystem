import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import { StyleSheet, Text } from 'react-native';

import { Button, Input, Screen } from '@/components/ui';
import { getApiErrorMessage, normalizePhone } from '@/lib/utils';
import { authService } from '@/services';
import { colors, spacing } from '@/theme';

export function RegisterScreen() {
  const navigation = useNavigation();
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const sendOtp = async () => {
    setError('');
    setLoading(true);
    try {
      await authService.sendOtp(normalizePhone(phone), 'REGISTER');
      setOtpSent(true);
      setSuccess('OTP sent! Use 123456 in development.');
    } catch (e) {
      setError(getApiErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  const verify = async () => {
    setError('');
    setLoading(true);
    try {
      await authService.verifyOtp(normalizePhone(phone), otp, 'REGISTER');
      setSuccess('Registration successful! Please sign in.');
      setTimeout(() => navigation.goBack(), 1500);
    } catch (e) {
      setError(getApiErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen title="Create Account" subtitle="Register with your mobile number">
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {success ? <Text style={styles.success}>{success}</Text> : null}
      <Input label="Mobile" keyboardType="phone-pad" maxLength={10} value={phone} onChangeText={setPhone} editable={!otpSent} />
      {otpSent && <Input label="OTP" keyboardType="number-pad" maxLength={6} value={otp} onChangeText={setOtp} />}
      <Button title={otpSent ? 'Verify & Register' : 'Send OTP'} fullWidth loading={loading} onPress={otpSent ? verify : sendOtp} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  error: { color: colors.danger, marginBottom: spacing.md },
  success: { color: colors.success, marginBottom: spacing.md },
});
