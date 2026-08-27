import { Platform, useWindowDimensions } from 'react-native';

/** Shared Partner web breakpoints (native always behaves as compact). */
export const BREAKPOINTS = {
  md: 720,
  lg: 1024,
  xl: 1280,
  xxl: 1600,
} as const;

export const DESKTOP_SIDEBAR_WIDTH = 248;

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
  /** Desktop shell: left sidebar + fluid main (web ≥ 1024). */
  const isDesktop = isWeb && width >= BREAKPOINTS.lg;
  const sidebarWidth = isDesktop ? DESKTOP_SIDEBAR_WIDTH : 0;

  // Desktop fills the main pane (no phone-column). Soft cap only on ultra-wide monitors.
  const contentMaxWidth = isDesktop
    ? width >= BREAKPOINTS.xxl
      ? 1480
      : undefined
    : size === 'medium'
      ? 760
      : undefined;

  const pagePad = isDesktop ? 32 : size === 'medium' ? 20 : 16;
  const sectionGap = isDesktop ? 28 : 16;
  const statColumns = isDesktop ? 4 : 2;
  const actionColumns = isDesktop ? 8 : size === 'medium' ? 4 : 4;
  const listColumns = isDesktop ? 2 : 1;

  return {
    width,
    height,
    isWeb,
    size,
    isWide,
    isDesktop,
    sidebarWidth,
    contentMaxWidth,
    pagePad,
    sectionGap,
    statColumns,
    actionColumns,
    listColumns,
  };
}
