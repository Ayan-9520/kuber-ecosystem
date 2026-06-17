import { render, screen } from '@testing-library/react';

import { ForgotPasswordScreen } from '@/features/auth/screens/ForgotPasswordScreen';
import { OnboardingScreen } from '@/features/auth/screens/OnboardingScreen';
import { OtpLoginScreen } from '@/features/auth/screens/OtpLoginScreen';
import { ProfileCompletionScreen } from '@/features/auth/screens/ProfileCompletionScreen';
import { RegisterScreen } from '@/features/auth/screens/RegisterScreen';
import { SplashScreen } from '@/features/auth/screens/SplashScreen';
import { renderWithProviders } from '../utils/render';

jest.mock('@/services', () => ({
  authService: {
    sendOtp: jest.fn(async () => ({ message: 'ok' })),
    verifyOtp: jest.fn(async () => ({ accessToken: 'a', refreshToken: 'r' })),
    resetPassword: jest.fn(),
  },
  customerService: {
    update: jest.fn(),
    upsertProfile: jest.fn(),
  },
}));

describe('Customer auth screens', () => {
  it('Splash — renders brand', () => {
    render(<SplashScreen />);
    expect(screen.getByText('KuberOne')).toBeTruthy();
    expect(screen.getByText('Kuber Finserve')).toBeTruthy();
  });

  it('Onboarding — renders get started', () => {
    render(<OnboardingScreen onDone={jest.fn()} />);
    expect(screen.getByText('Next')).toBeTruthy();
  });

  it('OtpLogin — renders welcome and send OTP', () => {
    renderWithProviders(<OtpLoginScreen />);
    expect(screen.getAllByText('Welcome to KuberOne').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Send OTP').length).toBeGreaterThan(0);
  });

  it('Register — renders create account', () => {
    renderWithProviders(<RegisterScreen />);
    expect(screen.getByText('Create Account')).toBeTruthy();
  });

  it('ForgotPassword — renders reset flow', () => {
    render(<ForgotPasswordScreen />);
    expect(screen.getByText('Reset Password')).toBeTruthy();
  });

  it('ProfileCompletion — renders profile form', () => {
    renderWithProviders(<ProfileCompletionScreen />);
    expect(screen.getByText('Complete Profile')).toBeTruthy();
  });
});
