import type { RootStackParamList } from './types';

export function resolveInitialRoute(
  showOnboarding: boolean,
  onboardingComplete: boolean,
  isAuthenticated: boolean,
  requiresProfileCompletion: boolean,
): keyof RootStackParamList {
  if (showOnboarding && !onboardingComplete && !isAuthenticated) return 'Onboarding';
  if (isAuthenticated && !requiresProfileCompletion) return 'Main';
  return 'Auth';
}
