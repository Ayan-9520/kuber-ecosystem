import { mockThemeColors } from '../utils/theme-mock';

function contrastRatio(fg: string, bg: string): number {
  const lum = (hex: string) => {
    const c = hex.replace('#', '');
    const [r, g, b] = [0, 2, 4].map((i) => {
      const v = parseInt(c.slice(i, i + 2), 16) / 255;
      return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  const l1 = lum(fg);
  const l2 = lum(bg);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

describe('DSA accessibility', () => {
  it('text on background meets contrast', () => {
    expect(contrastRatio(mockThemeColors.text, mockThemeColors.background)).toBeGreaterThanOrEqual(4.5);
  });
});
