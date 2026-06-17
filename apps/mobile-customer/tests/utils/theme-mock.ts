export const mockThemeColors = {
  primary: '#22D3A6',
  primaryHover: '#1EB892',
  onPrimary: '#071A1F',
  accent: '#18C964',
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
  overlay: 'rgba(7, 26, 31, 0.85)',
};

export function mockUseAppTheme() {
  return {
    colors: mockThemeColors,
    preference: 'dark' as const,
    resolved: 'dark' as const,
    setPreference: jest.fn(),
    toggle: jest.fn(),
    ready: true,
  };
}
