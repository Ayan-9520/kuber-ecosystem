import { render, screen } from '@testing-library/react';

import { OnboardingScreen } from '@/features/auth/screens/OnboardingScreen';
import { OtpLoginScreen } from '@/features/auth/screens/OtpLoginScreen';
import { PartnerKycScreen } from '@/features/auth/screens/PartnerKycScreen';
import { PartnerRegisterScreen } from '@/features/auth/screens/PartnerRegisterScreen';
import { SplashScreen } from '@/features/auth/screens/SplashScreen';
import { renderWithProviders } from '../utils/render';

jest.mock('@/services', () => ({
  authService: {
    sendOtp: jest.fn(async () => ({ message: 'ok' })),
    partnerLogin: jest.fn(async () => ({ accessToken: 'a', refreshToken: 'r' })),
    me: jest.fn(async () => ({ partnerId: 'p1' })),
  },
  partnersService: {
    register: jest.fn(async () => ({ id: 'p1', kycStatus: 'NOT_STARTED' })),
    getById: jest.fn(async () => ({ kycStatus: 'NOT_STARTED' })),
  },
  documentsService: { list: jest.fn(async () => ({ items: [] })) },
}));

describe('DSA auth screens', () => {
  it('Splash — brand', () => {
    render(<SplashScreen />);
    expect(screen.getAllByText(/KuberOne/i).length).toBeGreaterThan(0);
  });

  it('Onboarding renders', () => {
    expect(() => render(<OnboardingScreen onDone={jest.fn()} />)).not.toThrow();
  });

  it('OtpLogin — partner sign in', () => {
    renderWithProviders(<OtpLoginScreen />);
    expect(screen.getByText('KuberOne DSA')).toBeTruthy();
  });

  it('PartnerRegister renders', () => {
    expect(() => renderWithProviders(<PartnerRegisterScreen />)).not.toThrow();
  });

  it('PartnerKyc renders', () => {
    expect(() => renderWithProviders(<PartnerKycScreen />)).not.toThrow();
  });
});
