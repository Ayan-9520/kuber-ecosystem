import * as SecureStore from 'expo-secure-store';

const KEYS = {
  accessToken: 'kuberone_access_token',
  refreshToken: 'kuberone_refresh_token',
  deviceId: 'kuberone_device_id',
  onboardingDone: 'kuberone_onboarding_done',
} as const;

export async function getAccessToken(): Promise<string | null> {
  return SecureStore.getItemAsync(KEYS.accessToken);
}

export async function getRefreshToken(): Promise<string | null> {
  return SecureStore.getItemAsync(KEYS.refreshToken);
}

export async function setTokens(accessToken: string, refreshToken: string): Promise<void> {
  await SecureStore.setItemAsync(KEYS.accessToken, accessToken);
  await SecureStore.setItemAsync(KEYS.refreshToken, refreshToken);
}

export async function clearTokens(): Promise<void> {
  await SecureStore.deleteItemAsync(KEYS.accessToken);
  await SecureStore.deleteItemAsync(KEYS.refreshToken);
}

export async function getOrCreateDeviceId(): Promise<string> {
  let id = await SecureStore.getItemAsync(KEYS.deviceId);
  if (!id) {
    id = `mobile-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    await SecureStore.setItemAsync(KEYS.deviceId, id);
  }
  return id;
}

export async function isOnboardingDone(): Promise<boolean> {
  const v = await SecureStore.getItemAsync(KEYS.onboardingDone);
  return v === 'true';
}

export async function setOnboardingDone(): Promise<void> {
  await SecureStore.setItemAsync(KEYS.onboardingDone, 'true');
}
