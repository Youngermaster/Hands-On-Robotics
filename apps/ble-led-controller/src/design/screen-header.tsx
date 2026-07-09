// Consistent top-of-screen header: uppercase eyebrow, big title, and a
// slot on the right for a status chip or action.

import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { Eyebrow, Title } from './typography';

export interface ScreenHeaderProps {
  eyebrow: string;
  title: string;
  /** Rendered aligned to the top-right. Typically a StatusPill or icon button. */
  trailing?: ReactNode;
}

export function ScreenHeader({ eyebrow, title, trailing }: ScreenHeaderProps) {
  return (
    <View style={styles.wrap}>
      <View style={styles.text}>
        <Eyebrow>{eyebrow}</Eyebrow>
        <Title>{title}</Title>
      </View>
      {trailing ? <View style={styles.trailing}>{trailing}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginTop: 8,
    gap: 12,
  },
  text: { flexShrink: 1, gap: 2 },
  trailing: { flexShrink: 0 },
});
