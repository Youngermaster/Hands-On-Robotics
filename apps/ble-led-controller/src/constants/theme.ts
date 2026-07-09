/**
 * Bridge between the Expo template's colour API (used by NativeTabs,
 * ThemedText, splash overlay, etc.) and our design tokens in `@/design/tokens`.
 *
 * We keep the template's shape (`Colors.light`, `Colors.dark`, `Spacing`,
 * `Fonts`) so template-shipped components render correctly, and we mirror
 * the new palette values here so tab bar / splash blend into the app.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#171713',
    background: '#F6F1E9',
    backgroundElement: '#EEE7DA',
    backgroundSelected: '#E4DCC9',
    textSecondary: '#6E6B62',
  },
  dark: {
    text: '#F6F1E9',
    background: '#111110',
    backgroundElement: '#1B1B19',
    backgroundSelected: '#33322B',
    textSecondary: '#8F8B7F',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
