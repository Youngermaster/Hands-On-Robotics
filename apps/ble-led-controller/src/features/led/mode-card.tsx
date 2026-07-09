// One card in the mode grid.
//
// Composes design primitives (colours, shadows, typography) with the
// LED-specific `ModeGlyph`. When active, fills with the accent colour
// and reads its label in the inverse text tone.

import { Pressable, StyleSheet, Text, View } from 'react-native';

import { withOpacity } from '@/design/color-utils';
import { useTokens } from '@/design/tokens';
import { LedMode, ledModeHint, ledModeLabel } from '@/protocol/led';

import { ModeGlyph } from './mode-glyph';

export interface ModeCardProps {
  mode: LedMode;
  active: boolean;
  disabled: boolean;
  /** Whether an optimistic write for THIS mode is in flight. */
  pending: boolean;
  onPress: () => void;
}

export function ModeCard({ mode, active, disabled, pending, onPress }: ModeCardProps) {
  const t = useTokens();
  const labelColor = active ? t.colors.textInverse : t.colors.text;
  const hintColor = active ? withOpacity(t.colors.textInverse, 0.72) : t.colors.textMuted;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={ledModeLabel(mode)}
      accessibilityState={{ selected: active, disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: active ? t.colors.accent : t.colors.surface,
          borderColor: active ? t.colors.accent : t.colors.border,
        },
        active ? t.shadows.cardActive : t.shadows.card,
        pressed && !disabled && styles.pressed,
        disabled && styles.disabled,
      ]}>
      <View style={styles.top}>
        <ModeGlyph mode={mode} color={labelColor} />
        {pending ? <Text style={[styles.pending, { color: hintColor }]}>sending…</Text> : null}
      </View>

      <View>
        <Text style={[styles.label, { color: labelColor }]}>{ledModeLabel(mode)}</Text>
        <Text style={[styles.hint, { color: hintColor }]}>{ledModeHint(mode)}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '48%',
    minHeight: 118,
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    justifyContent: 'space-between',
  },
  pressed: { transform: [{ scale: 0.98 }] },
  disabled: { opacity: 0.55 },
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  label: { fontSize: 20, fontWeight: '700', letterSpacing: -0.3 },
  hint: { fontSize: 13, fontWeight: '500', marginTop: 2 },
  pending: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
});
