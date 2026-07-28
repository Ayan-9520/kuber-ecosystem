import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { type NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useEffect, useState, useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useDispatch } from 'react-redux';

import { PremiumAuthShell } from '@/components/auth/PremiumAuthShell';
import { Button, Input } from '@/components/ui';
import { useAuth } from '@/hooks';
import { API_BASE_URL, setMemoryAccessToken } from '@/lib/api';
import { clearTokens, setTokens } from '@/lib/storage';
import { getApiErrorMessage, normalizePhone } from '@/lib/utils';
import { validateIndianMobile, validateOtp } from '@/lib/validation';
import type { AuthStackParamList } from '@/navigation/types';
import { authService, partnersService, partnerBrandingService } from '@/services';
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

  // Drop stale session tokens on the login screen so bootstrap /auth/me does not 401-spam.
  useEffect(() => {
    setMemoryAccessToken(null);
    void clearTokens();
  }, []);

  // Warm Cloudflare / Vercel proxy so first OTP / login is less likely to 502.
  useEffect(() => {
    const controller = new AbortController();
    const base = API_BASE_URL.replace(/\/api\/v1\/?$/, '') || '';
    const healthUrl = base ? `${base}/health` : '/health';
    void fetch(healthUrl, { method: 'GET', signal: controller.signal }).catch(() => undefined);
    return () => controller.abort();
  }, []);

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

  /**
   * Resolve KYC *before* setting Redux auth.
   * RootNavigator remounts on isAuthenticated — setting KYC first avoids bounce / double login.
   */
  const completeLogin = async (normalizedPhone: string, otpCode: string) => {
    const tokens = await authService.partnerLogin(normalizedPhone, otpCode);

    setMemoryAccessToken(tokens.accessToken);
    await setTokens(tokens.accessToken, tokens.refreshToken);

    const me = await authService.me();
    if (me.userType !== 'PARTNER') {
      setMemoryAccessToken(null);
      await clearTokens();
      throw new Error('This app is for verified Financial Partners only');
    }

    let needsKyc = false;
    if (me.partnerId) {
      try {
        const partner = await partnersService.getById(me.partnerId);
        needsKyc = String(partner.kycStatus) !== 'VERIFIED';
      } catch {
        needsKyc = false;
      }
    }

    dispatch(setRequiresPartnerKyc(needsKyc));
    // Setting credentials remounts navigator to Main or PartnerKyc — no manual navigate needed.
    await login(tokens.accessToken, tokens.refreshToken, me);

    // Auto-create Verified Professional draft profile (same template; partner fills content later).
    void partnerBrandingService.getMyProfile().catch(() => undefined);
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
      ...typography.caption,
      color: '#B91C1C',
      marginBottom: spacing.sm,
    },
    links: {
      gap: spacing.sm,
      alignItems: 'center',
    },
    link: {
      ...typography.caption,
      color: '#0D6B57',
      fontWeight: '600',
      textAlign: 'center',
    },
    hint: {
      ...typography.caption,
      color: '#64748B',
      textAlign: 'center',
      lineHeight: 18,
      paddingHorizontal: spacing.md,
    },
    devLink: {
      ...typography.caption,
      color: '#0D6B57',
      fontWeight: '700',
      textAlign: 'center',
      marginTop: spacing.md,
      textTransform: 'uppercase',
      letterSpacing: 0.4,
    },
  });
}
