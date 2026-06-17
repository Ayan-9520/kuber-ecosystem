import { secureDelete, secureGet, secureSet } from './secureStorage';

const KEYS = {
  accessToken: 'kuberone_access_token',
  refreshToken: 'kuberone_refresh_token',
  deviceId: 'kuberone_device_id',
  onboardingDone: 'kuberone_onboarding_done',
} as const;

export async function getAccessToken(): Promise<string | null> {
  return secureGet(KEYS.accessToken);
}

export async function getRefreshToken(): Promise<string | null> {
  return secureGet(KEYS.refreshToken);
}

export async function setTokens(accessToken: string, refreshToken: string): Promise<void> {
  await secureSet(KEYS.accessToken, accessToken);
  await secureSet(KEYS.refreshToken, refreshToken);
}

export async function clearTokens(): Promise<void> {
  await secureDelete(KEYS.accessToken);
  await secureDelete(KEYS.refreshToken);
}

export async function getOrCreateDeviceId(): Promise<string> {
  let id = await secureGet(KEYS.deviceId);
  if (!id) {
    id = `mobile-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    await secureSet(KEYS.deviceId, id);
  }
  return id;
}

export async function isOnboardingDone(): Promise<boolean> {
  const v = await secureGet(KEYS.onboardingDone);
  return v === 'true';
}

export async function setOnboardingDone(): Promise<void> {
  await secureSet(KEYS.onboardingDone, 'true');
}
