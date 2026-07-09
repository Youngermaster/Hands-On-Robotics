// Row primitives for content inside a `Card` — a label/value pair and a
// hairline divider. Kept together because the divider only makes sense
// inside a row-stack.

import { StyleSheet, Text, View } from 'react-native';

import { useTokens } from './tokens';

export interface SettingsRowProps {
  label: string;
  value: string;
  /** Render value as a coral small-caps accent (used for status chips). */
  accent?: boolean;
}

export function SettingsRow({ label, value, accent }: SettingsRowProps) {
  const t = useTokens();
  return (
    <View style={styles.row}>
      <Text style={[styles.label, { color: t.colors.textMuted }]}>{label}</Text>
      <Text
        style={[
          accent ? styles.valueAccent : styles.value,
          { color: accent ? t.colors.accent : t.colors.text },
        ]}>
        {value}
      </Text>
    </View>
  );
}

export function SettingsDivider() {
  const t = useTokens();
  return <View style={[styles.divider, { backgroundColor: t.colors.border }]} />;
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  label: { fontSize: 13, fontWeight: '600' },
  value: { fontSize: 15, fontWeight: '600' },
  valueAccent: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  divider: { height: 1, opacity: 0.55 },
});
