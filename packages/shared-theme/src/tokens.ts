export type ResolvedTheme = 'light' | 'dark';

export type ThemeTokens = {
  primary: string;
  primaryHover: string;
  accent: string;
  onPrimary: string;
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
  chartGrid: string;
  chartTooltipBg: string;
  chartTooltipBorder: string;
};

export const THEME_STORAGE_KEY = 'kuberone-theme-preference';

export const darkThemeTokens: ThemeTokens = {
  primary: '#22D3A6',
  primaryHover: '#1EB892',
  accent: '#18C964',
  onPrimary: '#071A1F',
  background: '#071A1F',
  card: '#102B2E',
  surface: '#0D2428',
  surfaceHover: '#143338',
  border: '#1A3D42',
  borderLight: '#234A50',
  text: '#FFFFFF',
  textSecondary: '#C7D2D9',
  textMuted: '#8B9AAB',
  danger: '#EF4444',
  warning: '#F59E0B',
  success: '#18C964',
  info: '#38BDF8',
  overlay: 'rgba(7, 26, 31, 0.72)',
  chartGrid: '#1A3D42',
  chartTooltipBg: '#102B2E',
  chartTooltipBorder: '#1A3D42',
};

export const lightThemeTokens: ThemeTokens = {
  primary: '#0D9488',
  primaryHover: '#0F766E',
  accent: '#18C964',
  onPrimary: '#FFFFFF',
  background: '#F8FAFC',
  card: '#FFFFFF',
  surface: '#F1F5F9',
  surfaceHover: '#E2E8F0',
  border: '#E2E8F0',
  borderLight: '#CBD5E1',
  text: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#64748B',
  danger: '#DC2626',
  warning: '#D97706',
  success: '#16A34A',
  info: '#0284C7',
  overlay: 'rgba(15, 23, 42, 0.45)',
  chartGrid: '#E2E8F0',
  chartTooltipBg: '#FFFFFF',
  chartTooltipBorder: '#E2E8F0',
};

export const chartPalette = ['#22D3A6', '#18C964', '#38BDF8', '#F59E0B', '#8B9AAB', '#EF4444'] as const;

export function tokensFor(theme: ResolvedTheme): ThemeTokens {
  return theme === 'light' ? lightThemeTokens : darkThemeTokens;
}
