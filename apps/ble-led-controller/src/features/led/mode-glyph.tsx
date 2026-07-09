// Small mode-specific glyph shown in the top-left of each ModeCard.
// No icon library — draws with Views so it's tiny and always matches
// the current text color.

import { StyleSheet, View } from 'react-native';

import { LedMode } from '@/protocol/led';

export interface ModeGlyphProps {
  mode: LedMode;
  color: string;
}

export function ModeGlyph({ mode, color }: ModeGlyphProps) {
  const solid = <View style={[styles.dot, { backgroundColor: color }]} />;
  const hollow = <View style={[styles.dot, styles.hollow, { borderColor: color }]} />;
  const bar = <View style={[styles.bar, { backgroundColor: color }]} />;

  switch (mode) {
    case LedMode.Off:
      return hollow;
    case LedMode.On:
      return solid;
    case LedMode.Slow:
      return (
        <View style={styles.row}>
          {solid}
          {hollow}
        </View>
      );
    case LedMode.Fast:
      return (
        <View style={styles.row}>
          {bar}
          {bar}
          {bar}
        </View>
      );
  }
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  dot: { width: 14, height: 14, borderRadius: 7 },
  hollow: { backgroundColor: 'transparent', borderWidth: 2 },
  bar: { width: 6, height: 14, borderRadius: 3 },
});
