import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, type RenderOptions } from '@testing-library/react';
import { configureStore, type PreloadedState } from '@reduxjs/toolkit';
import React, { type ReactElement } from 'react';
import { Provider } from 'react-redux';

import { authReducer, type AuthState } from '@/store/slices/authSlice';

type RootState = { auth: AuthState };

interface ExtendedRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  preloadedState?: PreloadedState<RootState>;
}

export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  });
}

export function renderWithProviders(ui: ReactElement, options: ExtendedRenderOptions = {}) {
  const { preloadedState, ...renderOptions } = options;
  const store = configureStore({
    reducer: { auth: authReducer },
    preloadedState,
  });
  const queryClient = createTestQueryClient();

  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      </Provider>
    );
  }

  return { store, queryClient, ...render(ui, { wrapper: Wrapper, ...renderOptions }) };
}
