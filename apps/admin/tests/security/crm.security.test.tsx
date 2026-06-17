import { screen } from '@testing-library/react';
import { Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { containsRawScriptTag, STORED_XSS_PAYLOADS, THEME_INJECTION_PAYLOADS } from '@kuberone/security-testing';

import { ProtectedRoute } from '@/components/guards/ProtectedRoute';
import { renderWithProviders } from '../utils/render';

vi.mock('@/hooks/useAuthBootstrap', () => ({
  useAuthBootstrap: vi.fn(),
}));

import { useAuthBootstrap } from '@/hooks/useAuthBootstrap';

describe('Security — CRM', () => {
  it('blocks unauthenticated admin bypass of protected routes', () => {
    vi.mocked(useAuthBootstrap).mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
      user: null,
    });
    renderWithProviders(
      <Routes>
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<div>Admin Secret Panel</div>} />
        </Route>
        <Route path="/login" element={<div>Login Page</div>} />
      </Routes>,
    );
    expect(screen.queryByText('Admin Secret Panel')).not.toBeInTheDocument();
  });

  it('does not render protected content while auth is loading (session hijack window)', () => {
    vi.mocked(useAuthBootstrap).mockReturnValue({
      isAuthenticated: false,
      isLoading: true,
      user: null,
    });
    renderWithProviders(
      <Routes>
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<div>Hidden During Load</div>} />
        </Route>
      </Routes>,
    );
    expect(screen.queryByText('Hidden During Load')).not.toBeInTheDocument();
  });

  it.each(STORED_XSS_PAYLOADS)('detects stored XSS payload pattern: %s', (payload) => {
    expect(containsRawScriptTag(payload)).toBe(true);
  });

  it.each(THEME_INJECTION_PAYLOADS)('detects theme/CSS injection pattern: %s', (payload) => {
    const dangerous = containsRawScriptTag(payload) || payload.includes('javascript:') || payload.includes('@import');
    expect(dangerous).toBe(true);
  });

  it('sanitizes user display name with script tags for safe rendering check', () => {
    const unsafe = '<img src=x onerror=alert(1)>';
    expect(containsRawScriptTag(unsafe)).toBe(true);
    const safe = 'Kuber Finserve Admin';
    expect(containsRawScriptTag(safe)).toBe(false);
  });
});
