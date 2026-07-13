import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { THEME_STORAGE_KEY, tokensFor, type ResolvedTheme } from '@kuberone/shared-theme';

type ThemeContextValue = {
  theme: ResolvedTheme;
  toggleTheme: () => void;
  setTheme: (theme: ResolvedTheme) => void;
  tokens: ReturnType<typeof tokensFor>;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function getInitialTheme(): ResolvedTheme {
  if (typeof window === 'undefined') return 'light';
  const stored = localStorage.getItem(THEME_STORAGE_KEY);
  if (stored === 'dark' || stored === 'light') return stored;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ResolvedTheme>(getInitialTheme);

  const setTheme = useCallback((next: ResolvedTheme) => {
    setThemeState(next);
    localStorage.setItem(THEME_STORAGE_KEY, next);
    document.documentElement.setAttribute('data-theme', next);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  }, [setTheme, theme]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const value = useMemo(
    () => ({
      theme,
      toggleTheme,
      setTheme,
      tokens: tokensFor(theme),
    }),
    [theme, toggleTheme, setTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
