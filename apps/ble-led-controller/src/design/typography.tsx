// Small, theme-aware typography primitives.
//
// One component per role — screen-level `Eyebrow` + `Title`, in-card
// `Body` + `BodySmall`, uppercase `Caption`, and inline `Mono` for
// values / code fragments. Consumers should NOT pass fontSize / weight
// overrides — those live in tokens.

import type { PropsWithChildren } from 'react';
import { StyleSheet, Text, type TextProps } from 'react-native';

import { useTokens } from './tokens';

type BaseProps = PropsWithChildren<
  Pick<TextProps, 'numberOfLines' | 'style' | 'accessibilityRole' | 'testID'>
>;

export function Eyebrow({ children, style, ...rest }: BaseProps) {
  const t = useTokens();
  return (
    <Text style={[styles.eyebrow, { color: t.colors.textMuted }, style]} {...rest}>
      {children}
    </Text>
  );
}

export function Title({ children, style, ...rest }: BaseProps) {
  const t = useTokens();
  return (
    <Text style={[styles.title, { color: t.colors.text }, style]} {...rest}>
      {children}
    </Text>
  );
}

export function DisplayName({ children, style, ...rest }: BaseProps) {
  const t = useTokens();
  return (
    <Text style={[styles.displayName, { color: t.colors.text }, style]} {...rest}>
      {children}
    </Text>
  );
}

export function Body({ children, style, ...rest }: BaseProps) {
  const t = useTokens();
  return (
    <Text style={[styles.body, { color: t.colors.text }, style]} {...rest}>
      {children}
    </Text>
  );
}

export function BodyMuted({ children, style, ...rest }: BaseProps) {
  const t = useTokens();
  return (
    <Text style={[styles.body, { color: t.colors.textMuted }, style]} {...rest}>
      {children}
    </Text>
  );
}

export function Caption({ children, style, ...rest }: BaseProps) {
  const t = useTokens();
  return (
    <Text style={[styles.caption, { color: t.colors.textMuted }, style]} {...rest}>
      {children}
    </Text>
  );
}

export function Mono({ children, style, ...rest }: BaseProps) {
  const t = useTokens();
  return (
    <Text style={[styles.mono, { color: t.colors.text }, style]} {...rest}>
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  eyebrow: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -0.6,
    lineHeight: 38,
  },
  displayName: {
    fontSize: 34,
    fontWeight: '700',
    letterSpacing: -0.8,
    lineHeight: 40,
  },
  body: {
    fontSize: 15,
    fontWeight: '500',
    lineHeight: 22,
  },
  caption: {
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 19,
  },
  mono: {
    fontSize: 13,
    fontWeight: '600',
    // fontFamily set at usage time via Platform.select so tokens.ts stays
    // the only file that knows about system fonts.
  },
});
