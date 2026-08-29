import { Platform, useWindowDimensions } from 'react-native';

/** Shared Partner web breakpoints (native always behaves as compact). */
export const BREAKPOINTS = {
  md: 720,
  lg: 1024,
  xl: 1280,
  xxl: 1600,
} as const;

/** Slim sidebar — fits "Applications" label on desktop. */
export const DESKTOP_SIDEBAR_WIDTH = 240;

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
  const sidebarWidth = isDesktop ? DESKTOP_SIDEBAR_WIDTH : 0;

  const contentMaxWidth = isDesktop
    ? width >= BREAKPOINTS.xxl
      ? 1280
      : undefined
    : size === 'medium'
      ? 760
      : undefined;

  const pagePad = isDesktop ? 24 : size === 'medium' ? 20 : 16;
  /** Breathing room below tab shell — stops content sticking to top on desktop. */
  const contentTopPad = isDesktop ? 48 : 12;
  const sectionGap = isDesktop ? 20 : 16;
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
    contentTopPad,
    sectionGap,
    statColumns,
    actionColumns,
    listColumns,
  };
}
