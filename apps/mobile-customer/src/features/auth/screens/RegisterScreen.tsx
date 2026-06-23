import { useNavigation } from '@react-navigation/native';
import { type NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useState, useMemo } from 'react';
import { StyleSheet, Text } from 'react-native';
import { useDispatch } from 'react-redux';

import { Button, Input, Screen } from '@/components/ui';
import { useAuth } from '@/hooks';
import { getApiErrorMessage, normalizePhone } from '@/lib/utils';
import type { AuthStackParamList } from '@/navigation/types';
import { authService } from '@/services';
import { setRequiresProfileCompletion } from '@/store/slices/authSlice';
import { type AppColors, useAppTheme } from '@/theme/ThemeProvider';
import { spacing } from '@/theme';

export function RegisterScreen() {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList>>();
  const dispatch = useDispatch();
  const { login } = useAuth();
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
      setSuccess('OTP sent to your mobile number.');
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
      const tokens = await authService.verifyOtp(normalizePhone(phone), otp, 'REGISTER');
      await login(tokens.accessToken, tokens.refreshToken);
      dispatch(setRequiresProfileCompletion(true));
      setSuccess('Registration successful! Complete your profile.');
      navigation.navigate('ProfileCompletion');
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

function createStyles(colors: AppColors) {
  return StyleSheet.create({
  error: { color: colors.danger, marginBottom: spacing.md },
  success: { color: colors.success, marginBottom: spacing.md },
});
}
