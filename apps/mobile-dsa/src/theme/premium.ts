import { Platform, type ViewStyle } from 'react-native';

type ColorSlice = {
  background: string;
  card: string;
  primary: string;
  borderLight: string;
};

/** Web-only hover lift for pressable cards. */
export function premiumHover(): ViewStyle {
  if (Platform.OS !== 'web') return {};
  return {
    transitionProperty: 'transform, box-shadow, border-color, background-color',
    transitionDuration: '180ms',
    transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
  } as ViewStyle;
}

/** Frosted glass surface — desktop web only. */
export function glassSurface(colors: ColorSlice, isDesktop: boolean): ViewStyle {
  if (!isDesktop || Platform.OS !== 'web') {
    return {
      backgroundColor: colors.card,
      borderColor: colors.borderLight,
    };
  }
  return {
    backgroundColor: `${colors.card}d9`,
    borderColor: `${colors.primary}28`,
    backdropFilter: 'blur(20px) saturate(1.2)',
    WebkitBackdropFilter: 'blur(20px) saturate(1.2)',
  } as ViewStyle;
}

/** Ambient mesh background for desktop shell. */
export function meshBackground(colors: ColorSlice, isDesktop: boolean): ViewStyle {
  if (!isDesktop || Platform.OS !== 'web') {
    return { backgroundColor: colors.background };
  }
  return {
    backgroundColor: colors.background,
    backgroundImage: `radial-gradient(ellipse 70% 55% at 12% -8%, ${colors.primary}1a, transparent),
      radial-gradient(ellipse 50% 45% at 95% 5%, ${colors.primary}12, transparent),
      radial-gradient(ellipse 45% 35% at 50% 105%, ${colors.primary}0a, transparent)`,
  } as ViewStyle;
}

/** Subtle inner glow for accent cards. */
export function accentGlow(primary: string): ViewStyle {
  if (Platform.OS !== 'web') return {};
  return {
    boxShadow: `0 0 0 1px ${primary}30, 0 8px 32px ${primary}18`,
  } as ViewStyle;
}
