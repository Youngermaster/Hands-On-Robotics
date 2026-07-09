// Generic status pill: dot + label + optional detail, on an elevated pill.
//
// Deliberately protocol-agnostic — takes a `tone` enum, not a BleStatus.
// Adapters (e.g. features/led/ble-status-chip.tsx) map their domain
// state to `StatusTone` and give us the strings.

import { StyleSheet, View } from 'react-native';

import { useTokens } from './tokens';

export type StatusTone = 'idle' | 'busy' | 'active' | 'error';

export interface StatusPillProps {
  tone: StatusTone;
  label: string;
  detail?: string;
}

export function StatusPill({ tone, label, detail }: StatusPillProps) {
  const t = useTokens();
  const dotColor = {
    idle: t.colors.textMuted,
    busy: t.colors.warning,
    active: t.colors.success,
    error: t.colors.danger,
  }[tone];
  const labelColor = tone === 'error' ? t.colors.danger : t.colors.text;

  return (
    <View
      style={[
        styles.pill,
        {
          backgroundColor: t.colors.surface,
          borderColor: t.colors.border,
        },
        t.shadows.card,
      ]}>
      <View style={[styles.dot, { backgroundColor: dotColor }]} />
      <View style={styles.text}>
        <View accessibilityRole="text">
          <TextLine size="label" color={labelColor}>
            {label}
          </TextLine>
        </View>
        {detail ? (
          <TextLine size="detail" color={t.colors.textMuted} numberOfLines={1}>
            {detail}
          </TextLine>
        ) : null}
      </View>
    </View>
  );
}

// Two small text sizes used only by this component; inlined so the pill
// stays self-contained and typography primitives stay screen-general.
import { Text } from 'react-native';
function TextLine({
  size,
  color,
  numberOfLines,
  children,
}: {
  size: 'label' | 'detail';
  color: string;
  numberOfLines?: number;
  children: React.ReactNode;
}) {
  return (
    <Text
      numberOfLines={numberOfLines}
      style={[size === 'label' ? styles.label : styles.detail, { color }]}>
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  pill: {
    borderRadius: 999,
    borderWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    maxWidth: 220,
  },
  dot: { width: 10, height: 10, borderRadius: 5 },
  text: { flexShrink: 1 },
  label: { fontSize: 13, fontWeight: '700', letterSpacing: -0.1 },
  detail: { fontSize: 11, fontWeight: '500' },
});
