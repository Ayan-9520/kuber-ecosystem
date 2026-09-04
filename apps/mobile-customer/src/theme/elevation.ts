import { Platform, type ViewStyle } from 'react-native';

export function cardShadow(elevated = false, glow?: string): ViewStyle {
  if (Platform.OS === 'web') {
    const base = elevated
      ? '0 16px 48px rgba(2, 20, 16, 0.22), 0 4px 12px rgba(2, 20, 16, 0.08)'
      : '0 4px 20px rgba(2, 20, 16, 0.1), 0 1px 3px rgba(2, 20, 16, 0.06)';
    const glowLayer = glow ? `, 0 0 0 1px ${glow}22` : '';
    return { boxShadow: `${base}${glowLayer}` } as ViewStyle;
  }
  return {
    shadowColor: '#021410',
    shadowOffset: { width: 0, height: elevated ? 10 : 4 },
    shadowOpacity: elevated ? 0.24 : 0.1,
    shadowRadius: elevated ? 20 : 12,
    elevation: elevated ? 10 : 4,
  };
}
