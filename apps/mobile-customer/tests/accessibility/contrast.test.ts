import { mockThemeColors } from '../utils/theme-mock';

function luminance(hex: string): number {
  const c = hex.replace('#', '');
  const r = parseInt(c.slice(0, 2), 16) / 255;
  const g = parseInt(c.slice(2, 4), 16) / 255;
  const b = parseInt(c.slice(4, 6), 16) / 255;
  const f = (v: number) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}

function contrastRatio(fg: string, bg: string): number {
  const l1 = luminance(fg);
  const l2 = luminance(bg);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

describe('Customer accessibility — color contrast', () => {
  it('primary text on background meets WCAG AA (4.5:1)', () => {
    expect(contrastRatio(mockThemeColors.text, mockThemeColors.background)).toBeGreaterThanOrEqual(4.5);
  });

  it('primary accent on card meets minimum contrast', () => {
    expect(contrastRatio(mockThemeColors.primary, mockThemeColors.card)).toBeGreaterThanOrEqual(3);
  });
});
