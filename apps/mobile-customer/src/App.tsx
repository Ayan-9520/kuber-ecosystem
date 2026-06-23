import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';

import { RootNavigator } from './navigation/RootNavigator';
import { store } from './store';
import { ThemeProvider, useAppTheme } from './theme/ThemeProvider';

function ThemedStatusBar() {
  const { resolved } = useAppTheme();
  return <StatusBar style={resolved === 'dark' ? 'light' : 'dark'} />;
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      gcTime: 5 * 60_000,
      retry: (failureCount, error) => {
        if (error instanceof AxiosError) {
          const status = error.response?.status;
          if (status === 429 || status === 401 || status === 403 || status === 404) return false;
        }
        return failureCount < 1;
      },
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
  },
});

export function App() {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <SafeAreaProvider>
            <ThemedStatusBar />
            <RootNavigator />
          </SafeAreaProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </Provider>
  );
}
