import {
  THEME_STORAGE_KEY,
  resolveTheme,
  tokensFor,
  type ResolvedTheme,
  type ThemePreference,
  type ThemeTokens,
} from '@kuberone/shared-theme';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { Appearance } from 'react-native';

import { secureGet, secureSet } from '@/lib/secureStorage';

export type AppColors = {
  primary: string;
  primaryHover: string;
  onPrimary: string;
  accent: string;
  background: string;
  card: string;
  surface: string;
  surfaceHover: string;
  border: string;
  borderLight: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  danger: string;
  warning: string;
  success: string;
  info: string;
  overlay: string;
};

type ThemeContextValue = {
  preference: ThemePreference;
  resolved: ResolvedTheme;
  colors: AppColors;
  setPreference: (preference: ThemePreference) => void;
  toggle: () => void;
  ready: boolean;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function tokensToColors(tokens: ThemeTokens): AppColors {
  return {
    primary: tokens.primary,
    primaryHover: tokens.primaryHover,
    onPrimary: tokens.onPrimary,
    accent: tokens.accent,
    background: tokens.background,
    card: tokens.card,
    surface: tokens.surface,
    surfaceHover: tokens.surfaceHover,
    border: tokens.border,
    borderLight: tokens.borderLight,
    text: tokens.text,
    textSecondary: tokens.textSecondary,
    textMuted: tokens.textMuted,
    danger: tokens.danger,
    warning: tokens.warning,
    success: tokens.success,
    info: tokens.info,
    overlay: tokens.overlay,
  };
}

function nextPreference(current: ThemePreference): ThemePreference {
  return current === 'light' ? 'dark' : 'light';
}

function normalizePreference(stored: string | null): ThemePreference {
  if (stored === 'light' || stored === 'dark') return stored;
  // Legacy "system" → dark (app default)
  return 'dark';
}

async function readPreference(): Promise<ThemePreference> {
  try {
    const stored = await secureGet(THEME_STORAGE_KEY);
    return normalizePreference(stored);
  } catch {
    /* ignore */
  }
  return 'dark';
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [preference, setPreferenceState] = useState<ThemePreference>('dark');
  const [systemDark, setSystemDark] = useState(() => Appearance.getColorScheme() === 'dark');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    void readPreference().then((stored) => {
      setPreferenceState(stored);
      setReady(true);
    });
  }, []);

  useEffect(() => {
    const sub = Appearance.addChangeListener(({ colorScheme }) => {
      setSystemDark(colorScheme === 'dark');
    });
    return () => sub.remove();
  }, []);

  const resolved = useMemo(() => resolveTheme(preference, systemDark), [preference, systemDark]);
  const colors = useMemo(() => tokensToColors(tokensFor(resolved)), [resolved]);

  const setPreference = useCallback((next: ThemePreference) => {
    const normalized = next === 'system' ? 'dark' : next;
    setPreferenceState(normalized);
    void secureSet(THEME_STORAGE_KEY, normalized);
  }, []);

  const toggle = useCallback(() => {
    setPreference(nextPreference(preference));
  }, [preference, setPreference]);

  const value = useMemo(
    () => ({ preference, resolved, colors, setPreference, toggle, ready }),
    [preference, resolved, colors, setPreference, toggle, ready],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useAppTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useAppTheme must be used within ThemeProvider');
  return ctx;
}
