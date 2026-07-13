import { resolveInitialRoute } from '@/navigation/resolveInitialRoute';

describe('resolveInitialRoute (DSA)', () => {
  it('shows onboarding for first-time guests', () => {
    expect(resolveInitialRoute(true, false, false, false)).toBe('Onboarding');
  });

  it('shows auth after onboarding is complete', () => {
    expect(resolveInitialRoute(false, true, false, false)).toBe('Auth');
  });

  it('shows main for authenticated partners', () => {
    expect(resolveInitialRoute(false, true, true, false)).toBe('Main');
  });

  it('shows auth when partner KYC is pending', () => {
    expect(resolveInitialRoute(false, true, true, true)).toBe('Auth');
  });
});
