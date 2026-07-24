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
  primary: '#00C389',
  primaryHover: '#22D3A6',
  accent: '#18C964',
  onPrimary: '#032820',
  background: '#032820',
  card: '#0A342C',
  surface: '#0C3D34',
  surfaceHover: '#105043',
  border: '#145544',
  borderLight: '#1A6654',
  text: '#FFFFFF',
  textSecondary: '#C7D2D9',
  textMuted: '#8B9AAB',
  danger: '#EF4444',
  warning: '#F59E0B',
  success: '#18C964',
  info: '#38BDF8',
  overlay: 'rgba(3, 40, 32, 0.72)',
  chartGrid: '#145544',
  chartTooltipBg: '#0A342C',
  chartTooltipBorder: '#145544',
};

export const lightThemeTokens: ThemeTokens = {
  // Align with kuberfinserve.com brand greens
  primary: '#00C389',
  primaryHover: '#0B5D4B',
  accent: '#18C964',
  onPrimary: '#FFFFFF',
  background: '#F4F7F6',
  card: '#FFFFFF',
  surface: '#EEF5F2',
  surfaceHover: '#E2EFEA',
  border: '#D7E5DF',
  borderLight: '#C5D9D1',
  text: '#032820',
  textSecondary: '#3D5A52',
  textMuted: '#6B857C',
  danger: '#DC2626',
  warning: '#D97706',
  success: '#16A34A',
  info: '#0284C7',
  overlay: 'rgba(3, 40, 32, 0.45)',
  chartGrid: '#D7E5DF',
  chartTooltipBg: '#FFFFFF',
  chartTooltipBorder: '#D7E5DF',
};

export const chartPalette = ['#00C389', '#0B5D4B', '#18C964', '#38BDF8', '#F59E0B', '#EF4444'] as const;

export function tokensFor(theme: ResolvedTheme): ThemeTokens {
  return theme === 'light' ? lightThemeTokens : darkThemeTokens;
}
