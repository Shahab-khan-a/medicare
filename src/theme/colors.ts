/**
 * Clean light medical palette.
 *
 * Text/fill pairs are tuned for WCAG AA (4.5:1) — e.g. white on `primary`,
 * `primary` on `primaryLight`, and each `*Text` token on its `*Light` background.
 * Use the `*Text` tokens when a semantic color is used for text on a tinted badge.
 */
export const colors = {
  // Brand
  primary: '#136BC6',
  primaryDark: '#0F589F',
  primaryLight: '#EAF3FD',
  primaryMuted: '#D4E6FB',
  primaryBright: '#2A9DF4', // decorative only (icons, gradients) — not for text on white
  accent: '#0FA58B',
  accentText: '#0B7D6B',
  accentLight: '#E3F7F2',

  // Surfaces
  background: '#F4F7FB',
  backgroundSecondary: '#EDF1F7',
  card: '#FFFFFF',
  surfaceMuted: '#F7F9FC',

  // Text
  textPrimary: '#0F172A',
  textSecondary: '#5B6475',
  textMuted: '#8A94A6',
  textInverse: '#FFFFFF',

  // Lines
  border: '#E3E8EF',
  borderStrong: '#CBD3DF',
  divider: '#EEF2F6',
  cardBorder: '#E6EBF2',

  // Semantic
  success: '#16A34A',
  successText: '#15803D',
  successLight: '#DCFCE7',
  warning: '#F59E0B',
  warningText: '#B45309',
  warningLight: '#FEF3C7',
  error: '#DC2626',
  errorText: '#B91C1C',
  errorLight: '#FEE2E2',
  star: '#F59E0B',

  // Utility
  white: '#FFFFFF',
  black: '#000000',
  shadow: '#0F172A',
  transparent: 'transparent',
  overlay: 'rgba(15, 23, 42, 0.5)',
  skeleton: '#E6EBF2',
  skeletonHighlight: '#F3F6FA',

  // Gradients
  gradientStart: '#136BC6',
  gradientEnd: '#0FA58B',

  // Legacy tokens still referenced by screens awaiting the light redesign
  medicalNavy: '#0F172A',
  medicalCyan: '#0EA5E9',
  medicalTeal: '#0D9488',
  medicalGlass: 'rgba(255, 255, 255, 0.92)',
  pulseRed: '#EF4444',
};

export type ColorsType = typeof colors;
