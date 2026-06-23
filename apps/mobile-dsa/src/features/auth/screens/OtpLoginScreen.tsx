import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { type NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState, useMemo } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, View } from 'react-native';
import { useDispatch } from 'react-redux';

import { Button, Input } from '@/components/ui';
import { useAuth } from '@/hooks';
import { getApiErrorMessage, normalizePhone } from '@/lib/utils';
import { validateIndianMobile, validateOtp } from '@/lib/validation';
import type { AuthStackParamList } from '@/navigation/types';
import { authService, partnersService } from '@/services';
import { setRequiresPartnerKyc } from '@/store/slices/authSlice';
import { type AppColors, useAppTheme } from '@/theme/ThemeProvider';
import { spacing, typography } from '@/theme';

const DEMO_DSA_PHONE = '8888777766';
const DEV_OTP = '123456';

type OtpLoginRoute = RouteProp<AuthStackParamList, 'OtpLogin'>;

export function OtpLoginScreen() {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList>>();
  const route = useRoute<OtpLoginRoute>();
  const dispatch = useDispatch();
  const { login } = useAuth();
  const [phone, setPhone] = useState(route.params?.phone ?? '');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(!!route.params?.phone);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (route.params?.phone) {
      setPhone(route.params.phone);
      setOtpSent(true);
    }
  }, [route.params?.phone]);

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

  const completeLogin = async (normalizedPhone: string, otpCode: string) => {
    const tokens = await authService.partnerLogin(normalizedPhone, otpCode);
    await login(tokens.accessToken, tokens.refreshToken);

    const me = await authService.me();
    if (me.partnerId) {
      const partner = await partnersService.getById(me.partnerId);
      if (String(partner.kycStatus) !== 'VERIFIED') {
        dispatch(setRequiresPartnerKyc(true));
        return;
      }
    }

    dispatch(setRequiresPartnerKyc(false));
  };

  const demoLogin = async () => {
    setError('');
    setLoading(true);
    try {
      const normalized = normalizePhone(DEMO_DSA_PHONE);
      setPhone(DEMO_DSA_PHONE);
      setOtp(DEV_OTP);
      setOtpSent(true);
      try {
        await authService.sendOtp(normalized, 'LOGIN');
      } catch {
        /* dev bypass accepts 123456 without a prior send */
      }
      await completeLogin(normalized, DEV_OTP);
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
      await completeLogin(normalizePhone(phone), otp);
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
          <View style={styles.logo}>
            <Text style={styles.logoText}>K</Text>
          </View>
          <Text style={styles.title}>KuberOne DSA</Text>
          <Text style={styles.subtitle}>Partner sign in with OTP</Text>
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        {__DEV__ ? (
          <>
            <Text style={styles.hint}>Dev: OTP {DEV_OTP} · Demo {DEMO_DSA_PHONE}</Text>
            <Button
              title="Quick Demo Login"
              variant="secondary"
              fullWidth
              style={{ marginBottom: spacing.md }}
              loading={loading}
              onPress={() => void demoLogin()}
            />
          </>
        ) : null}

        <Input
          label="Mobile Number"
          placeholder="10-digit mobile number"
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
          <Button
            title="Change Number"
            variant="ghost"
            fullWidth
            onPress={() => {
              setOtpSent(false);
              setOtp('');
            }}
          />
        )}

        <View style={styles.links}>
          <Text style={styles.link} onPress={() => navigation.navigate('PartnerRegister')}>
            New DSA partner? Register
          </Text>
          <Text style={styles.hint}>Registered partner mobile se OTP login karein</Text>
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

function createStyles(colors: AppColors) {
  return StyleSheet.create({
  container: { flex: 1 },
  inner: { flex: 1, justifyContent: 'center', padding: spacing.lg },
  brand: { alignItems: 'center', marginBottom: spacing.xl },
  logo: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  logoText: { fontSize: 28, fontWeight: '800', color: colors.background },
  title: { ...typography.h2, color: colors.text },
  subtitle: { ...typography.bodySm, color: colors.textMuted, marginTop: 4 },
  error: { color: colors.danger, marginBottom: spacing.md, textAlign: 'center' },
  links: { marginTop: spacing.lg, alignItems: 'center', gap: spacing.sm },
  link: { ...typography.bodySm, color: colors.primary },
  hint: { ...typography.caption, color: colors.textMuted },
});
}
