import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { type NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useEffect, useState, useMemo, useRef } from 'react';
import { ActivityIndicator, Platform, StyleSheet, Text, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

import { PremiumAuthShell } from '@/components/auth/PremiumAuthShell';
import { Button, Input } from '@/components/ui';
import { useAuth } from '@/hooks';
import { API_BASE_URL, setMemoryAccessToken } from '@/lib/api';
import { partnerNeedsKyc } from '@/lib/partnerSession';
import { clearTokens, getAccessToken, getRefreshToken, setTokens } from '@/lib/storage';
import { getApiErrorMessage, normalizePhone } from '@/lib/utils';
import { validateOtp } from '@/lib/validation';
import type { AuthStackParamList } from '@/navigation/types';
import { authService, partnerBrandingService } from '@/services';
import type { RootState } from '@/store';
import { setRequiresPartnerKyc } from '@/store/slices/authSlice';
import { spacing, typography } from '@/theme';

const DEMO_DSA_PHONE = '8888777766';
const DEV_OTP = '123456';
const SHOW_DEMO_LOGIN = (process.env.EXPO_PUBLIC_APP_ENV ?? 'development') !== 'production';

type OtpLoginRoute = RouteProp<AuthStackParamList, 'OtpLogin'>;

function readSsoTokensFromUrl(): { accessToken: string; refreshToken: string; screen?: string } | null {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return null;
  const hash = window.location.hash?.replace(/^#/, '') ?? '';
  const query = window.location.search?.replace(/^\?/, '') ?? '';
  const params = new URLSearchParams(hash || query);
  const accessToken = params.get('access_token')?.trim() || params.get('token')?.trim();
  const refreshToken = params.get('refresh_token')?.trim() || '';
  if (!accessToken) return null;
  return {
    accessToken,
    refreshToken: refreshToken || accessToken,
    screen: params.get('screen') ?? undefined,
  };
}

function clearSsoParamsFromUrl() {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return;
  const path = window.location.pathname || '/login';
  window.history.replaceState(null, '', path);
}

function normalizeIdentifier(raw: string): string {
  return raw.trim().replace(/\.+$/, '').trim();
}

export function OtpLoginScreen() {
  const styles = useMemo(() => createStyles(), []);
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList>>();
  const route = useRoute<OtpLoginRoute>();
  const dispatch = useDispatch();
  const { login } = useAuth();
  const isAuthenticated = useSelector((s: RootState) => s.auth.isAuthenticated);
  const [identifier, setIdentifier] = useState(route.params?.phone ?? '');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(!!route.params?.phone);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [restoring, setRestoring] = useState(false);
  const ssoTried = useRef(false);
  const sessionRescueTried = useRef(false);

  useEffect(() => {
    if (route.params?.phone) {
      setIdentifier(route.params.phone);
      setOtpSent(true);
    }
  }, [route.params?.phone]);

  // Warm Cloudflare / Vercel proxy so first OTP / login is less likely to 502.
  useEffect(() => {
    const controller = new AbortController();
    const base = API_BASE_URL.replace(/\/api\/v1\/?$/, '') || '';
    const healthUrl = base ? `${base}/health/live` : '/health';
    void fetch(healthUrl, { method: 'GET', signal: controller.signal }).catch(() => undefined);
    return () => controller.abort();
  }, []);

  const finishWithTokens = async (accessToken: string, refreshToken: string) => {
    setMemoryAccessToken(accessToken);
    await setTokens(accessToken, refreshToken);

    const me = await authService.me();
    if (me.userType !== 'PARTNER') {
      setMemoryAccessToken(null);
      await clearTokens();
      throw new Error('This app is for verified Financial Partners only');
    }

    const needsKyc = await partnerNeedsKyc(me.partnerId);
    dispatch(setRequiresPartnerKyc(needsKyc));
    await login(accessToken, refreshToken, me);
    void partnerBrandingService.getMyProfile().catch(() => undefined);
  };

  // Website SSO: kuberfinserve.com → partner.kuberone.online/login#access_token=…&refresh_token=…
  useEffect(() => {
    if (ssoTried.current) return;
    const sso = readSsoTokensFromUrl();
    if (!sso) return;
    ssoTried.current = true;
    setRestoring(true);
    setLoading(true);
    setError('');
    void (async () => {
      try {
        await finishWithTokens(sso.accessToken, sso.refreshToken);
        clearSsoParamsFromUrl();
      } catch (e) {
        clearSsoParamsFromUrl();
        setError(getApiErrorMessage(e));
      } finally {
        setLoading(false);
        setRestoring(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- one-shot SSO on mount
  }, []);

  // Keep existing session when partner revisits /login — do not force OTP again.
  useEffect(() => {
    if (ssoTried.current || sessionRescueTried.current || isAuthenticated) return;
    if (readSsoTokensFromUrl()) return;

    sessionRescueTried.current = true;
    setRestoring(true);
    setLoading(true);
    void (async () => {
      try {
        const accessToken = await getAccessToken();
        const refreshToken = await getRefreshToken();
        if (!accessToken || !refreshToken) return;

        setMemoryAccessToken(accessToken);
        const me = await authService.me();
        if (me.userType !== 'PARTNER') {
          setMemoryAccessToken(null);
          await clearTokens();
          return;
        }

        await finishWithTokens(accessToken, refreshToken);
      } catch {
        setMemoryAccessToken(null);
        await clearTokens();
      } finally {
        setLoading(false);
        setRestoring(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- one-shot session restore
  }, [isAuthenticated]);

  if (isAuthenticated || restoring) {
    return (
      <PremiumAuthShell variant="partner">
        <View style={styles.restoring}>
          <ActivityIndicator size="large" color="#0D6B57" />
          <Text style={styles.restoringText}>Opening your dashboard…</Text>
        </View>
      </PremiumAuthShell>
    );
  }

  const sendOtp = async () => {
    const id = normalizeIdentifier(identifier);
    if (id.length < 3) {
      setError('Enter mobile, email, or Partner Code');
      return;
    }
    setError('');
    setInfo('');
    setLoading(true);
    try {
      const result = await authService.partnerOtpRequest(id);
      setOtpSent(true);
      const hintParts: string[] = [];
      if (result.email_sent && result.email_hint) hintParts.push(`email ${result.email_hint}`);
      if (result.phone_hint) hintParts.push(`mobile ${result.phone_hint}`);
      const where =
        hintParts.length > 0
          ? `OTP sent to ${hintParts.join(' · ')}.`
          : result.message || 'OTP sent.';
      const bypass = result.phone_bypass_otp || result.dev_otp;
      setInfo(
        bypass
          ? `${where} Check email for real code. Phone bypass: ${bypass}`
          : `${where} Check your email for the code.`,
      );
    } catch (e) {
      setError(getApiErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  const completeLogin = async (id: string, otpCode: string) => {
    const tokens = await authService.partnerOtpVerify(id, otpCode);
    await finishWithTokens(tokens.accessToken, tokens.refreshToken);
  };

  const demoLogin = async () => {
    setError('');
    setLoading(true);
    try {
      const normalized = normalizePhone(DEMO_DSA_PHONE);
      setIdentifier(DEMO_DSA_PHONE);
      setOtp(DEV_OTP);
      setOtpSent(true);
      try {
        await authService.partnerOtpRequest(normalized);
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
      await completeLogin(normalizeIdentifier(identifier), otp);
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
            Mobile, email, or Partner Code + OTP. OTP goes to that partner's registered mobile
            (SMS after gateway purchase) and email when SMTP is on. Same login as
            kuberfinserve.com/partner-login.
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

      {info ? <Text style={styles.info}>{info}</Text> : null}

      <Input
        label="Mobile / Email / Partner Code"
        placeholder="9876543210 · email · DSA-XXXXXX"
        keyboardType="default"
        autoCapitalize="none"
        value={identifier}
        onChangeText={setIdentifier}
        editable={!otpSent && !loading}
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
          title="Change ID"
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
    info: {
      ...typography.caption,
      color: '#0D6B57',
      marginBottom: spacing.sm,
      lineHeight: 18,
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
    restoring: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: spacing.xl,
      gap: spacing.md,
    },
    restoringText: {
      ...typography.body,
      color: '#64748B',
      textAlign: 'center',
    },
  });
}
