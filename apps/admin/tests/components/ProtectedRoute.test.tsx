import { screen } from '@testing-library/react';
import { Route, Routes } from 'react-router-dom';
import { vi } from 'vitest';

import { ProtectedRoute } from '@/components/guards/ProtectedRoute';
import { renderWithProviders } from '../utils/render';

vi.mock('@/hooks/useAuthBootstrap', () => ({
  useAuthBootstrap: vi.fn(),
}));

import { useAuthBootstrap } from '@/hooks/useAuthBootstrap';

describe('ProtectedRoute', () => {
  it('shows spinner while loading', () => {
    vi.mocked(useAuthBootstrap).mockReturnValue({
      isAuthenticated: false,
      isLoading: true,
      user: null,
    });
    renderWithProviders(
      <Routes>
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<div>Secret</div>} />
        </Route>
      </Routes>,
    );
    expect(screen.queryByText('Secret')).not.toBeInTheDocument();
  });

  it('blocks unauthenticated users from protected content', () => {
    vi.mocked(useAuthBootstrap).mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
      user: null,
    });
    renderWithProviders(
      <Routes>
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<div>Secret</div>} />
        </Route>
        <Route path="/login" element={<div>Login Page</div>} />
      </Routes>,
    );
    expect(screen.queryByText('Secret')).not.toBeInTheDocument();
  });

  it('renders outlet when authenticated', () => {
    vi.mocked(useAuthBootstrap).mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: { id: '1' } as never,
    });
    renderWithProviders(
      <Routes>
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<div>Secret Dashboard</div>} />
        </Route>
      </Routes>,
    );
    expect(screen.getByText('Secret Dashboard')).toBeInTheDocument();
  });
});
