import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';

import { RootNavigator } from '../navigation/RootNavigator';
import { store } from '../store';
import { ThemeProvider, useAppTheme } from '../theme/ThemeProvider';

function ThemedStatusBar() {
  const { resolved } = useAppTheme();
  return <StatusBar style={resolved === 'dark' ? 'light' : 'dark'} />;
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      retry: 1,
      refetchOnWindowFocus: false,
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
