import { type TextStyle } from 'react-native';

export const typography = {
  h1: { fontSize: 28, fontWeight: '700' as const, letterSpacing: -0.5 },
  h2: { fontSize: 22, fontWeight: '700' as const },
  h3: { fontSize: 18, fontWeight: '600' as const },
  body: { fontSize: 15, fontWeight: '400' as const, lineHeight: 22 },
  bodySm: { fontSize: 13, fontWeight: '500' as const, lineHeight: 20 },
  caption: { fontSize: 11, fontWeight: '600' as const, letterSpacing: 0.6, textTransform: 'uppercase' as const },
  label: { fontSize: 13, fontWeight: '600' as const, letterSpacing: 0.1 },
} satisfies Record<string, TextStyle>;
