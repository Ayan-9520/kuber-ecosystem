import { applyDocumentTheme, getSystemPrefersDark, readStoredThemePreference, resolveTheme } from '@kuberone/shared-theme';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';


import { App } from './app/App';
import { store } from './store';
import './styles/global.css';

applyDocumentTheme(resolveTheme(readStoredThemePreference(), getSystemPrefersDark()));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </Provider>
  </StrictMode>,
);
