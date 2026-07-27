import { CommonActions, useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { type NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useEffect, useState, useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useDispatch } from 'react-redux';

import { PremiumAuthShell } from '@/components/auth/PremiumAuthShell';
import { Button, Input } from '@/components/ui';
import { useAuth } from '@/hooks';
import { getApiErrorMessage, normalizePhone } from '@/lib/utils';
import { validateIndianMobile, validateOtp } from '@/lib/validation';
import type { AuthStackParamList } from '@/navigation/types';
import { authService, partnersService } from '@/services';
import { setRequiresPartnerKyc } from '@/store/slices/authSlice';
import { spacing, typography } from '@/theme';

const DEMO_DSA_PHONE = '8888777766';
const DEV_OTP = '123456';
const SHOW_DEMO_LOGIN = (process.env.EXPO_PUBLIC_APP_ENV ?? 'development') !== 'production';

type OtpLoginRoute = RouteProp<AuthStackParamList, 'OtpLogin'>;

export function OtpLoginScreen() {
  const styles = useMemo(() => createStyles(), []);
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

  const goToAppHome = () => {
    navigation.getParent()?.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'Main' }],
      }),
    );
  };

  const completeLogin = async (normalizedPhone: string, otpCode: string) => {
    const tokens = await authService.partnerLogin(normalizedPhone, otpCode);
    await login(tokens.accessToken, tokens.refreshToken);

    const me = await authService.me();
    if (me.partnerId) {
      const partner = await partnersService.getById(me.partnerId);
      if (String(partner.kycStatus) !== 'VERIFIED') {
        dispatch(setRequiresPartnerKyc(true));
        navigation.replace('PartnerKyc');
        return;
      }
    }

    dispatch(setRequiresPartnerKyc(false));
    goToAppHome();
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
    <PremiumAuthShell
      variant="partner"
      footer={
        <View style={styles.links}>
          <Text style={styles.link} onPress={() => navigation.navigate('PartnerRegister')}>
            New Financial Partner? Register here
          </Text>
          <Text style={styles.hint}>
            Sign in with OTP using your registered partner mobile. Same login as kuberfinserve.com/partner-login
          </Text>
        </View>
      }
    >
      {error ? (
        <Text style={styles.error}>
          {/pending approval/i.test(error)
            ? 'Pending approval — wait for Admin to approve your partner application.'
            : error}
        </Text>
      ) : null}

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
          Try demo partner ({DEMO_DSA_PHONE})
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
    hint: {
      ...typography.caption,
      color: '#6B857C',
      textAlign: 'center',
    },
  });
}
