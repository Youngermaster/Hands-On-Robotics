// Elevated surface used to group content on the cream canvas.
//
// The card owns its background/border/radius/shadow so screens don't
// re-implement them. Padding is the default (16); override via `padded=false`
// when the content needs to bleed to the card edges (e.g. wrapping an image).

import type { PropsWithChildren } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';

import { useTokens } from './tokens';

export interface CardProps {
  padded?: boolean;
  emphasised?: boolean;
  style?: ViewStyle;
}

export function Card({
  children,
  padded = true,
  emphasised = false,
  style,
}: PropsWithChildren<CardProps>) {
  const t = useTokens();
  return (
    <View
      style={[
        styles.base,
        {
          backgroundColor: t.colors.surface,
          borderColor: t.colors.border,
          padding: padded ? 16 : 0,
        },
        emphasised ? t.shadows.cardActive : t.shadows.card,
        style,
      ]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 20,
    borderWidth: 1,
    gap: 12,
  },
});
