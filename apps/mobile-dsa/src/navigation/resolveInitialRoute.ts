import type { RootStackParamList } from './types';

export function resolveInitialRoute(
  showOnboarding: boolean,
  onboardingComplete: boolean,
  isAuthenticated: boolean,
  requiresPartnerKyc: boolean,
): keyof RootStackParamList {
  if (showOnboarding && !onboardingComplete && !isAuthenticated) return 'Onboarding';
  if (isAuthenticated && !requiresPartnerKyc) return 'Main';
  return 'Auth';
}
