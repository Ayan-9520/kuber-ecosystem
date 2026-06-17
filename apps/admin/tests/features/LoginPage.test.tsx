import { screen } from '@testing-library/react';
import { vi } from 'vitest';

import { LoginPage } from '@/features/auth/pages/LoginPage';
import { renderWithProviders } from '../utils/render';

vi.mock('@/hooks/usePermissions', () => ({
  useAuth: () => ({
    setCredentials: vi.fn(),
    user: null,
    isAuthenticated: false,
  }),
}));

vi.mock('@/services/auth.service', () => ({
  authService: {
    login: vi.fn(),
    me: vi.fn(),
  },
}));

describe('LoginPage', () => {
  it('renders login form fields', () => {
    renderWithProviders(<LoginPage />);
    expect(screen.getByLabelText('Work Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sign In' })).toBeInTheDocument();
  });
});
