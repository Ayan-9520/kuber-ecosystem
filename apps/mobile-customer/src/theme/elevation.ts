import { Platform, type ViewStyle } from 'react-native';

export function cardShadow(elevated = false): ViewStyle {
  if (Platform.OS === 'web') {
    return {
      boxShadow: elevated
        ? '0 12px 32px rgba(7, 26, 31, 0.18)'
        : '0 4px 16px rgba(7, 26, 31, 0.1)',
    } as ViewStyle;
  }
  return {
    shadowColor: '#071A1F',
    shadowOffset: { width: 0, height: elevated ? 8 : 4 },
    shadowOpacity: elevated ? 0.22 : 0.12,
    shadowRadius: elevated ? 16 : 10,
    elevation: elevated ? 8 : 4,
  };
}
