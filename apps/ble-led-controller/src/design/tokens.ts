// Design tokens for the LED controller.
//
// Warm-cream light palette + warm-charcoal dark palette, coral accent.
// Inspired by device-control mood boards (Nimbly / Homely-style) — one
// vibrant accent, generous whitespace, soft shadows, big display type.
//
// Usage:
//   const t = useTokens();
//   <View style={{ backgroundColor: t.colors.surface, borderRadius: t.radii.lg }} />

import { Platform, type TextStyle, type ViewStyle } from 'react-native';

import { useColorScheme } from '@/hooks/use-color-scheme';

// --- Palettes ---------------------------------------------------------------

const light = {
  bg: '#F6F1E9',
  surface: '#FFFFFF',
  surfaceSubtle: '#EEE7DA',
  border: '#E4DCC9',
  text: '#171713',
  textMuted: '#6E6B62',
  textInverse: '#F6F1E9',
  accent: '#EB5B3E',
  accentSoft: '#FBE4DA',
  success: '#3BB273',
  warning: '#F5B841',
  danger: '#D64545',
} as const;

const dark = {
  bg: '#111110',
  surface: '#1B1B19',
  surfaceSubtle: '#26251F',
  border: '#33322B',
  text: '#F6F1E9',
  textMuted: '#8F8B7F',
  textInverse: '#171713',
  accent: '#EB5B3E',
  accentSoft: '#3A2419',
  success: '#3BB273',
  warning: '#F5B841',
  danger: '#D64545',
} as const;

export type Palette = typeof light;

// --- Per-mode colors (mapping in one place so the bulb + cards agree) ------

import { LedMode } from '@/protocol/led';

export function modeColor(mode: LedMode | undefined, p: Palette): string {
  switch (mode) {
    case LedMode.On:
      return p.accent;
    case LedMode.Slow:
      return p.accent;
    case LedMode.Fast:
      return p.accent;
    case LedMode.Off:
    default:
      return p.textMuted;
  }
}

export function modeDescription(mode: LedMode | undefined): string {
  switch (mode) {
    case LedMode.Off:
      return 'The LED is dark.';
    case LedMode.On:
      return 'Steady glow.';
    case LedMode.Slow:
      return 'Pulsing at 1 Hz.';
    case LedMode.Fast:
      return 'Rapid flashing.';
    default:
      return 'Not connected.';
  }
}

// --- Scales -----------------------------------------------------------------

export const radii = {
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 28,
  pill: 999,
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

// --- Shadows ----------------------------------------------------------------

export const shadows: Record<'card' | 'cardActive', ViewStyle> = {
  card:
    Platform.select<ViewStyle>({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.06,
        shadowRadius: 14,
        shadowOffset: { width: 0, height: 6 },
      },
      android: { elevation: 2 },
      default: {},
    }) ?? {},
  cardActive:
    Platform.select<ViewStyle>({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.14,
        shadowRadius: 22,
        shadowOffset: { width: 0, height: 10 },
      },
      android: { elevation: 8 },
      default: {},
    }) ?? {},
};

// A colored glow (used behind the LED bulb). Not a Text-usable style.
export function glow(color: string, intensity = 0.5): ViewStyle {
  return (
    Platform.select<ViewStyle>({
      ios: {
        shadowColor: color,
        shadowOpacity: intensity,
        shadowRadius: 40,
        shadowOffset: { width: 0, height: 0 },
      },
      android: {
        elevation: 12,
      },
      default: {},
    }) ?? {}
  );
}

// --- Typography scale -------------------------------------------------------

export const typography = {
  displayLarge: {
    fontSize: 48,
    fontWeight: '700',
    letterSpacing: -1.2,
    lineHeight: 52,
  },
  display: {
    fontSize: 40,
    fontWeight: '700',
    letterSpacing: -1,
    lineHeight: 44,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.4,
    lineHeight: 34,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '600',
    letterSpacing: -0.2,
    lineHeight: 26,
  },
  body: {
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 24,
  },
  bodySmall: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
  },
  caption: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    lineHeight: 16,
  },
  mono: {
    fontFamily: Platform.select({ ios: 'ui-monospace', default: 'monospace' }),
    fontSize: 13,
    fontWeight: '500',
  },
} satisfies Record<string, TextStyle>;

export type TypographyKey = keyof typeof typography;

// --- Hook -------------------------------------------------------------------

export function useTokens() {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  return {
    colors: isDark ? dark : light,
    isDark,
    radii,
    spacing,
    shadows,
    glow,
    typography,
  };
}
