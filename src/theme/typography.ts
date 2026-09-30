import { TextStyle } from 'react-native';

/**
 * Inter weights loaded in `src/App.tsx`. Each weight is its own font family,
 * so pick the family for the weight instead of relying on `fontWeight` alone.
 */
export const fonts = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
  extrabold: 'Inter_800ExtraBold',
} as const;

// `fontWeight` matches the family so the system fallback keeps the right weight
// and Android never synthesizes a fake bold on top of a real bold face.
const regular: TextStyle = { fontFamily: fonts.regular, fontWeight: '400' };
const medium: TextStyle = { fontFamily: fonts.medium, fontWeight: '500' };
const semibold: TextStyle = { fontFamily: fonts.semibold, fontWeight: '600' };
const bold: TextStyle = { fontFamily: fonts.bold, fontWeight: '700' };
const extrabold: TextStyle = { fontFamily: fonts.extrabold, fontWeight: '800' };

export const typography = {
  display: {
    ...extrabold,
    fontSize: 30,
    lineHeight: 38,
    letterSpacing: -0.6,
  } as TextStyle,
  h1: {
    ...bold,
    fontSize: 24,
    lineHeight: 32,
    letterSpacing: -0.4,
  } as TextStyle,
  h2: {
    ...bold,
    fontSize: 20,
    lineHeight: 28,
    letterSpacing: -0.3,
  } as TextStyle,
  h3: {
    ...semibold,
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: -0.1,
  } as TextStyle,
  bodyLarge: {
    ...regular,
    fontSize: 16,
    lineHeight: 24,
  } as TextStyle,
  body: {
    ...regular,
    fontSize: 14,
    lineHeight: 21,
  } as TextStyle,
  bodyMedium: {
    ...medium,
    fontSize: 14,
    lineHeight: 21,
  } as TextStyle,
  bodySemibold: {
    ...semibold,
    fontSize: 14,
    lineHeight: 21,
  } as TextStyle,
  bodyBold: {
    ...bold,
    fontSize: 14,
    lineHeight: 21,
  } as TextStyle,
  caption: {
    ...regular,
    fontSize: 12,
    lineHeight: 17,
  } as TextStyle,
  captionMedium: {
    ...medium,
    fontSize: 12,
    lineHeight: 17,
  } as TextStyle,
  captionBold: {
    ...semibold,
    fontSize: 12,
    lineHeight: 17,
  } as TextStyle,
  tiny: {
    ...medium,
    fontSize: 10,
    lineHeight: 14,
    letterSpacing: 0.1,
  } as TextStyle,
  overline: {
    ...bold,
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  } as TextStyle,
  button: {
    ...semibold,
    fontSize: 15,
    lineHeight: 20,
    letterSpacing: 0.1,
  } as TextStyle,
};
