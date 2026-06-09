import { useNavigation } from '@react-navigation/native';
import { type NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, View } from 'react-native';

import { Button, Input } from '@/components/ui';
import { useAuth } from '@/hooks';
import { getApiErrorMessage, normalizePhone } from '@/lib/utils';
import { validateIndianMobile, validateOtp } from '@/lib/validation';
import type { AuthStackParamList } from '@/navigation/types';
import { authService } from '@/services';
import { colors, spacing, typography } from '@/theme';

export function OtpLoginScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList>>();
  const { login } = useAuth();
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const sendOtp = async () => {
    const phoneErr = validateIndianMobile(phone);
    if (phoneErr) {
      setError(phoneErr);
      return;
    }
    setError('');
    setLoading(true);
    try {
      await authService.sendOtp(normalizePhone(phone), 'LOGIN');
      setOtpSent(true);
    } catch (e) {
      setError(getApiErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  const verify = async () => {
    const otpErr = validateOtp(otp);
    if (otpErr) {
      setError(otpErr);
      return;
    }
    setError('');
    setLoading(true);
    try {
      const tokens = await authService.verifyOtp(normalizePhone(phone), otp, 'LOGIN');
      await login(tokens.accessToken, tokens.refreshToken);
    } catch (e) {
      setError(getApiErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={[colors.background, colors.card]} style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.inner}>
        <View style={styles.brand}>
          <View style={styles.logo}><Text style={styles.logoText}>K</Text></View>
          <Text style={styles.title}>Welcome to KuberOne</Text>
          <Text style={styles.subtitle}>Sign in with your mobile number</Text>
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Input
          label="Mobile Number"
          placeholder="9876543210"
          keyboardType="phone-pad"
          maxLength={10}
          value={phone}
          onChangeText={setPhone}
          editable={!otpSent}
        />

        {otpSent && (
          <Input
            label="OTP"
            placeholder="Enter 6-digit OTP"
            keyboardType="number-pad"
            maxLength={6}
            value={otp}
            onChangeText={setOtp}
          />
        )}

        <Button
          title={otpSent ? 'Verify & Sign In' : 'Send OTP'}
          fullWidth
          loading={loading}
          onPress={otpSent ? verify : sendOtp}
        />

        {otpSent && (
          <Button title="Change Number" variant="ghost" fullWidth onPress={() => { setOtpSent(false); setOtp(''); }} />
        )}

        <View style={styles.links}>
          <Text style={styles.link} onPress={() => navigation.navigate('Register')}>New user? Register</Text>
          <Text style={styles.link} onPress={() => navigation.navigate('ForgotPassword')}>Forgot password?</Text>
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  inner: { flex: 1, justifyContent: 'center', padding: spacing.lg },
  brand: { alignItems: 'center', marginBottom: spacing.xl },
  logo: { width: 56, height: 56, borderRadius: 14, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.md },
  logoText: { fontSize: 28, fontWeight: '800', color: colors.background },
  title: { ...typography.h2, color: colors.text },
  subtitle: { ...typography.bodySm, color: colors.textMuted, marginTop: 4 },
  error: { color: colors.danger, marginBottom: spacing.md, textAlign: 'center' },
  links: { marginTop: spacing.lg, alignItems: 'center', gap: spacing.sm },
  link: { ...typography.bodySm, color: colors.primary },
});
