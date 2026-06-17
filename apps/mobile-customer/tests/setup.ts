import '@testing-library/jest-dom';

(globalThis as { __DEV__?: boolean }).__DEV__ = true;

jest.mock('@/lib/storage', () => ({
  setOnboardingDone: jest.fn(async () => undefined),
  getOrCreateDeviceId: jest.fn(async () => 'device-test-1'),
  getAccessToken: jest.fn(async () => null),
  getRefreshToken: jest.fn(async () => null),
  setTokens: jest.fn(async () => undefined),
  clearTokens: jest.fn(async () => undefined),
}));

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(async () => null),
  setItemAsync: jest.fn(async () => undefined),
  deleteItemAsync: jest.fn(async () => undefined),
}));

jest.mock('expo-linear-gradient', () => ({
  LinearGradient: ({ children }: { children?: unknown }) => children,
}));

jest.mock('expo-constants', () => ({
  __esModule: true,
  default: { expoConfig: { version: '1.0.0' }, manifest: { version: '1.0.0' } },
}));

jest.mock('expo-document-picker', () => ({
  getDocumentAsync: jest.fn(async () => ({ canceled: true, assets: [] })),
}));

jest.mock('expo-speech', () => ({
  speak: jest.fn(),
  stop: jest.fn(),
  isSpeakingAsync: jest.fn(async () => false),
}));

jest.mock('expo-file-system', () => ({
  readAsStringAsync: jest.fn(),
  uploadAsync: jest.fn(),
  documentDirectory: '/tmp/',
}));

jest.mock('@expo/vector-icons', () => ({
  Ionicons: () => null,
}));

jest.mock('@react-native-community/netinfo', () => ({
  __esModule: true,
  default: {
    addEventListener: jest.fn(() => jest.fn()),
    fetch: jest.fn(async () => ({ isConnected: true, isInternetReachable: true })),
  },
}));

jest.mock('react-native-safe-area-context', () => ({
  SafeAreaProvider: ({ children }: { children?: unknown }) => children,
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
    replace: jest.fn(),
    popToTop: jest.fn(),
    getParent: () => ({ navigate: jest.fn() }),
  }),
  useRoute: () => ({ params: { id: 'test-id' } }),
  NavigationContainer: ({ children }: { children?: unknown }) => children,
  DarkTheme: { colors: {} },
}));

jest.mock('@tanstack/react-query', () => {
  const actual = jest.requireActual('@tanstack/react-query');
  return {
    ...actual,
    useQuery: jest.fn(({ queryKey }: { queryKey?: unknown[] }) => {
      const key = String(queryKey?.[0] ?? '');
      let data: unknown = { items: [], meta: { total: 0 } };
      if (key === 'loan-products' || key === 'eligibility-products') {
        data = [];
      } else if (key === 'customer-recommendations' || key === 'recommendations') {
        data = { products: [] };
      }
      return {
        data,
        isLoading: false,
        isError: false,
        refetch: jest.fn(),
      };
    }),
    useMutation: jest.fn(() => ({ mutate: jest.fn(), mutateAsync: jest.fn(), isPending: false, data: null })),
    useQueryClient: jest.fn(() => ({ invalidateQueries: jest.fn(), setQueryData: jest.fn() })),
  };
});

jest.mock('@/theme/ThemeProvider', () => ({
  useAppTheme: () => ({
    colors: {
      primary: '#22D3A6',
      onPrimary: '#071A1F',
      background: '#071A1F',
      card: '#102B2E',
      surface: '#0D2428',
      border: '#1A3D42',
      borderLight: '#234A50',
      text: '#FFFFFF',
      textSecondary: '#C7D2D9',
      textMuted: '#8B9AAB',
      danger: '#EF4444',
      warning: '#F59E0B',
      success: '#18C964',
      info: '#38BDF8',
    },
    preference: 'dark',
    resolved: 'dark',
    setPreference: jest.fn(),
    toggle: jest.fn(),
    ready: true,
  }),
  ThemeProvider: ({ children }: { children?: unknown }) => children,
}));

jest.mock('@/hooks', () => ({
  useAuth: () => ({
    user: { id: 'u1', phone: '9876543210', customerId: 'c1' },
    customerId: 'c1',
    login: jest.fn(),
    logout: jest.fn(),
    hasPermission: () => true,
  }),
  useHasPermission: () => true,
  useAuthBootstrap: () => ({ ready: true, showOnboarding: false }),
}));
