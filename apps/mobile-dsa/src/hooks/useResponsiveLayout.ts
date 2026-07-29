import { Platform, useWindowDimensions } from 'react-native';

/** Shared Partner web breakpoints (native always behaves as compact). */
export const BREAKPOINTS = {
  md: 720,
  lg: 1024,
  xl: 1280,
} as const;

export type LayoutSize = 'compact' | 'medium' | 'wide' | 'ultra';

export function useResponsiveLayout() {
  const { width, height } = useWindowDimensions();
  const isWeb = Platform.OS === 'web';

  const size: LayoutSize = !isWeb
    ? 'compact'
    : width >= BREAKPOINTS.xl
      ? 'ultra'
      : width >= BREAKPOINTS.lg
        ? 'wide'
        : width >= BREAKPOINTS.md
          ? 'medium'
          : 'compact';

  const isWide = size === 'wide' || size === 'ultra';
  const isDesktop = isWeb && width >= BREAKPOINTS.lg;

  const contentMaxWidth =
    size === 'ultra' ? 1280 : size === 'wide' ? 1120 : size === 'medium' ? 760 : undefined;

  const pagePad = isDesktop ? 28 : size === 'medium' ? 20 : 16;
  const sectionGap = isDesktop ? 28 : 16;
  const statColumns = size === 'ultra' ? 4 : size === 'wide' ? 4 : size === 'medium' ? 2 : 2;
  const actionColumns = size === 'ultra' ? 8 : size === 'wide' ? 8 : size === 'medium' ? 4 : 4;
  const listColumns = isDesktop ? 2 : 1;

  return {
    width,
    height,
    isWeb,
    size,
    isWide,
    isDesktop,
    contentMaxWidth,
    pagePad,
    sectionGap,
    statColumns,
    actionColumns,
    listColumns,
  };
}
