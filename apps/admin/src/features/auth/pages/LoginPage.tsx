import { useMutation } from '@tanstack/react-query';
import { useState, type FormEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { Button, Input } from '@/components/ui';
import { useAuth } from '@/hooks/usePermissions';
import { tokenStorage } from '@/lib/token-storage';
import { getApiErrorMessage } from '@/lib/utils';
import { authService } from '@/services/auth.service';

type AuthTab = 'password' | 'otp';
type AuthMode = 'login' | 'forgot';

function mapMeToUser(me: Awaited<ReturnType<typeof authService.me>>) {
  return {
    id: me.id,
    sub: me.id,
    userType: me.userType as never,
    email: me.email ?? undefined,
    phone: me.phone ?? undefined,
    roles: me.roles,
    permissions: me.permissions,
    dataScope: me.dataScope as never,
    sessionId: '',
    branchId: me.branchId,
    regionId: me.regionId,
    employeeId: me.employeeId,
    customerId: me.customerId,
    partnerId: me.partnerId,
  };
}

async function completeLogin(accessToken: string, refreshToken: string, setCredentials: ReturnType<typeof useAuth>['setCredentials']) {
  tokenStorage.setTokens(accessToken, refreshToken);
  const me = await authService.me();
  setCredentials({ accessToken, user: mapMeToUser(me) });
}

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setCredentials } = useAuth();

  const [tab, setTab] = useState<AuthTab>('password');
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState(import.meta.env.DEV ? 'admin@kuberone.com' : '');
  const [password, setPassword] = useState(import.meta.env.DEV ? 'Admin@123' : '');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const sessionExpired = (location.state as { sessionExpired?: boolean } | null)?.sessionExpired;

  const passwordLogin = useMutation({
    mutationFn: () => authService.login(email, password),
    onSuccess: async (tokens) => {
      await completeLogin(tokens.accessToken, tokens.refreshToken, setCredentials);
      navigate('/dashboard', { replace: true });
    },
    onError: (err) => setError(getApiErrorMessage(err)),
  });

  const sendOtp = useMutation({
    mutationFn: () => authService.sendOtp(phone, mode === 'forgot' ? 'RESET_PASSWORD' : 'LOGIN'),
    onSuccess: () => {
      setOtpSent(true);
      setSuccess('OTP sent successfully');
      setError('');
    },
    onError: (err) => setError(getApiErrorMessage(err)),
  });

  const verifyOtp = useMutation({
    mutationFn: () => authService.verifyOtp(phone, otp, mode === 'forgot' ? 'RESET_PASSWORD' : 'LOGIN'),
    onSuccess: async (tokens) => {
      await completeLogin(tokens.accessToken, tokens.refreshToken, setCredentials);
      navigate('/dashboard', { replace: true });
    },
    onError: (err) => setError(getApiErrorMessage(err)),
  });

  const handlePasswordSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError('');
    passwordLogin.mutate();
  };

  const handleOtpSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (!otpSent) {
      sendOtp.mutate();
    } else {
      verifyOtp.mutate();
    }
  };

  const resetOtpFlow = () => {
    setOtpSent(false);
    setOtp('');
    setSuccess('');
    setError('');
  };

  const switchTab = (next: AuthTab) => {
    setTab(next);
    setMode('login');
    resetOtpFlow();
    setError('');
  };

  const isLoading = passwordLogin.isPending || sendOtp.isPending || verifyOtp.isPending;

  return (
    <div className="auth-layout">
      <div className="auth-card">
        <div className="auth-brand">
          <div className="brand-mark">K</div>
          <h1 className="auth-title">KuberOne Admin</h1>
          <p className="auth-subtitle">Sign in to your employee account</p>
        </div>

        {sessionExpired && (
          <div className="alert alert-error">Your session has expired. Please sign in again.</div>
        )}
        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        {mode === 'login' && (
          <div className="auth-tabs">
            <button
              type="button"
              className={`auth-tab${tab === 'password' ? ' active' : ''}`}
              onClick={() => switchTab('password')}
            >
              Email & Password
            </button>
            <button
              type="button"
              className={`auth-tab${tab === 'otp' ? ' active' : ''}`}
              onClick={() => switchTab('otp')}
            >
              OTP Login
            </button>
          </div>
        )}

        {mode === 'forgot' && (
          <div style={{ marginBottom: '1rem' }}>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => {
                setMode('login');
                resetOtpFlow();
              }}
            >
              ← Back to login
            </button>
            <h2 className="auth-title" style={{ fontSize: '1.125rem', marginTop: '0.5rem' }}>
              Reset Password
            </h2>
            <p className="auth-subtitle">Enter your phone number to receive a reset OTP</p>
          </div>
        )}

        {tab === 'password' && mode === 'login' ? (
          <form className="auth-form" onSubmit={handlePasswordSubmit}>
            <Input
              label="Work Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@kuberfinserve.com"
              required
              autoComplete="email"
            />
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              autoComplete="current-password"
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => {
                  setMode('forgot');
                  setTab('otp');
                  resetOtpFlow();
                }}
              >
                Forgot password?
              </button>
            </div>
            <Button type="submit" loading={isLoading} style={{ width: '100%' }}>
              Sign In
            </Button>
          </form>
        ) : (
          <form className="auth-form" onSubmit={handleOtpSubmit}>
            <Input
              label="Phone Number"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 98765 43210"
              required
              disabled={otpSent}
            />
            {otpSent && (
              <Input
                label="OTP"
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter 6-digit OTP"
                required
                maxLength={6}
                inputMode="numeric"
              />
            )}
            <Button type="submit" loading={isLoading} style={{ width: '100%' }}>
              {otpSent ? (mode === 'forgot' ? 'Reset & Sign In' : 'Verify & Sign In') : 'Send OTP'}
            </Button>
            {otpSent && (
              <Button type="button" variant="ghost" onClick={resetOtpFlow} style={{ width: '100%' }}>
                Resend OTP
              </Button>
            )}
          </form>
        )}

        <div className="auth-footer">
          Kuber Finserve · Secure employee access
        </div>
      </div>
    </div>
  );
}
