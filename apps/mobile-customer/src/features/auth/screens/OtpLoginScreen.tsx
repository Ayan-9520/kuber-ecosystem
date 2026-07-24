import { CommonActions, useNavigation } from '@react-navigation/native';
import { type NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useState, useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useDispatch } from 'react-redux';

import { PremiumAuthShell } from '@/components/auth/PremiumAuthShell';
import { Button, Input } from '@/components/ui';
import { useAuth } from '@/hooks';
import { isCustomerProfileIncomplete } from '@/lib/customer-profile';
import { getApiErrorMessage, normalizePhone } from '@/lib/utils';
import { validateIndianMobile, validateOtp } from '@/lib/validation';
import type { AuthStackParamList } from '@/navigation/types';
import { authService, customerService } from '@/services';
import { setRequiresProfileCompletion } from '@/store/slices/authSlice';
import { spacing, typography } from '@/theme';

const DEMO_CUSTOMER_PHONE = '9876543210';
const DEV_OTP = '123456';
const SHOW_DEMO_LOGIN = (process.env.EXPO_PUBLIC_APP_ENV ?? 'development') !== 'production';

export function OtpLoginScreen() {
  const styles = useMemo(() => createStyles(), []);
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList>>();
  const dispatch = useDispatch();
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

  const goToAppHome = () => {
    navigation.getParent()?.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'Main' }],
      }),
    );
  };

  const completeLogin = async (normalizedPhone: string, otpCode: string) => {
    const tokens = await authService.verifyOtp(normalizedPhone, otpCode, 'LOGIN');
    await login(tokens.accessToken, tokens.refreshToken);

    const me = await authService.me();
    if (me.customerId) {
      const customer = await customerService.getById(me.customerId);
      if (isCustomerProfileIncomplete(customer)) {
        dispatch(setRequiresProfileCompletion(true));
        navigation.replace('ProfileCompletion');
        return;
      }
    }

    dispatch(setRequiresProfileCompletion(false));
    goToAppHome();
  };

  const demoLogin = async () => {
    setError('');
    setLoading(true);
    try {
      const normalized = normalizePhone(DEMO_CUSTOMER_PHONE);
      setPhone(DEMO_CUSTOMER_PHONE);
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
    <PremiumAuthShell
      variant="customer"
      footer={
        <View style={styles.links}>
          <Text style={styles.link} onPress={() => navigation.navigate('Register')}>
            New user? Create account
          </Text>
          <Text style={styles.link} onPress={() => navigation.navigate('ForgotPassword')}>
            Forgot password?
          </Text>
        </View>
      }
    >
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Input
        label="Mobile Number"
        placeholder="10-digit mobile number"
        keyboardType="phone-pad"
        maxLength={10}
        value={phone}
        onChangeText={setPhone}
        editable={!otpSent}
        onLightSurface
      />

      {otpSent && (
        <Input
          label="OTP"
          placeholder="Enter 6-digit OTP"
          keyboardType="number-pad"
          maxLength={6}
          value={otp}
          onChangeText={setOtp}
          onLightSurface
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

      {SHOW_DEMO_LOGIN ? (
        <Text style={styles.devLink} onPress={() => !loading && void demoLogin()}>
          Try demo account ({DEMO_CUSTOMER_PHONE})
        </Text>
      ) : null}
    </PremiumAuthShell>
  );
}

function createStyles() {
  return StyleSheet.create({
    error: {
      ...typography.bodySm,
      color: '#B91C1C',
      textAlign: 'center',
      backgroundColor: 'rgba(220, 38, 38, 0.08)',
      borderWidth: 1,
      borderColor: 'rgba(220, 38, 38, 0.25)',
      padding: spacing.sm,
      borderRadius: 10,
    },
    devLink: {
      ...typography.caption,
      color: '#6B857C',
      textAlign: 'center',
      marginTop: spacing.xs,
      textDecorationLine: 'underline',
    },
    links: { alignItems: 'center', gap: spacing.sm, marginTop: spacing.xs },
    link: {
      ...typography.bodySm,
      color: '#0B5D4B',
      fontWeight: '600',
      textAlign: 'center',
    },
  });
}
