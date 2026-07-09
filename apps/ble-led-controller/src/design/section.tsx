// Vertical section with an uppercase eyebrow above its content and an
// optional caption below. The core layout building block for the
// Settings tab and any future scrolling screen.

import type { PropsWithChildren, ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { Caption, Eyebrow } from './typography';

export interface SectionProps {
  eyebrow: string;
  /** Rendered below the section body as a muted paragraph. */
  caption?: ReactNode;
}

export function Section({ eyebrow, caption, children }: PropsWithChildren<SectionProps>) {
  return (
    <View style={styles.wrap}>
      <Eyebrow>{eyebrow}</Eyebrow>
      {children}
      {caption ? <View style={styles.captionSlot}><Caption>{caption}</Caption></View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 8 },
  captionSlot: { paddingHorizontal: 4 },
});
