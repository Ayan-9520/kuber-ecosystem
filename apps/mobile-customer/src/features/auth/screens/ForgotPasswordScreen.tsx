import { useState } from 'react';
import { StyleSheet, Text } from 'react-native';

import { Button, Input, Screen } from '@/components/ui';
import { getApiErrorMessage, normalizePhone } from '@/lib/utils';
import { authService } from '@/services';
import { colors, spacing } from '@/theme';

export function ForgotPasswordScreen() {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const sendOtp = async () => {
    setError('');
    setLoading(true);
    try {
      await authService.sendOtp(normalizePhone(phone), 'RESET_PASSWORD');
      setOtpSent(true);
      setMessage('Reset OTP sent to your phone.');
    } catch (e) {
      setError(getApiErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  const reset = async () => {
    setError('');
    setLoading(true);
    try {
      await authService.verifyOtp(normalizePhone(phone), otp, 'RESET_PASSWORD');
      setMessage('Password reset complete. Sign in with OTP.');
    } catch (e) {
      setError(getApiErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen title="Reset Password" subtitle="We'll send an OTP to verify your identity">
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {message ? <Text style={styles.ok}>{message}</Text> : null}
      <Input label="Mobile" keyboardType="phone-pad" maxLength={10} value={phone} onChangeText={setPhone} editable={!otpSent} />
      {otpSent && <Input label="OTP" keyboardType="number-pad" maxLength={6} value={otp} onChangeText={setOtp} />}
      <Button title={otpSent ? 'Reset Password' : 'Send OTP'} fullWidth loading={loading} onPress={otpSent ? reset : sendOtp} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  error: { color: colors.danger, marginBottom: spacing.md },
  ok: { color: colors.success, marginBottom: spacing.md },
});
