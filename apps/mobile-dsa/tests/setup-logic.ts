(globalThis as { __DEV__?: boolean }).__DEV__ = true;

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(async () => null),
  setItemAsync: jest.fn(async () => undefined),
  deleteItemAsync: jest.fn(async () => undefined),
}));

jest.mock('expo-constants', () => ({
  __esModule: true,
  default: { expoConfig: { extra: { apiBaseUrl: 'http://localhost:4000/api/v1' } } },
}));

jest.mock('@/lib/storage', () => ({
  setOnboardingDone: jest.fn(async () => undefined),
  getOrCreateDeviceId: jest.fn(async () => 'device-test-1'),
  getAccessToken: jest.fn(async () => null),
  getRefreshToken: jest.fn(async () => null),
  setTokens: jest.fn(async () => undefined),
  clearTokens: jest.fn(async () => undefined),
}));
