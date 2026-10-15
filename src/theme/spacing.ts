import { Platform, ViewStyle } from 'react-native';

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 48,
};

export const borderRadius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  '2xl': 24,
  round: 9999,
  full: 9999,
};

/** Minimum comfortable touch target (Material 48dp / Apple 44pt). */
export const touchTarget = 48;

export const hitSlop = { top: 10, bottom: 10, left: 10, right: 10 };

const shadow = (
  color: string,
  height: number,
  opacity: number,
  radius: number,
  elevation: number,
): ViewStyle =>
  Platform.select<ViewStyle>({
    android: { elevation, shadowColor: color },
    default: {
      shadowColor: color,
      shadowOffset: { width: 0, height },
      shadowOpacity: opacity,
      shadowRadius: radius,
    },
  }) as ViewStyle;

export const shadows = {
  none: {} as ViewStyle,
  subtle: shadow('#0F172A', 1, 0.05, 4, 1),
  card: shadow('#0F172A', 4, 0.06, 12, 2),
  medium: shadow('#0F172A', 6, 0.08, 16, 4),
  large: shadow('#0F172A', 12, 0.12, 24, 8),
  primary: shadow('#267259', 4, 0.14, 10, 3),
};
