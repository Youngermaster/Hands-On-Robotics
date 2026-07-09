// LED Control screen — the polished home tab.
//
// Layout inspired by contemporary smart-home apps: warm cream canvas, a
// hero LED visualization that animates with the current mode, one
// prominent status chip, a 2×2 grid of mode cards, and a single primary
// action button pinned to the bottom.

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LedBulb } from '@/design/led-bulb';
import { modeDescription, useTokens } from '@/design/tokens';
import { useSettings } from '@/hooks/use-settings';
import { LED_MODES, LedMode, ledModeLabel } from '@/protocol/led';
import { LedBleTransport, type BleStatus } from '@/transports/ble';
import { useBleStatus } from '@/transports/useTransport';

// ---------------------------------------------------------------------------

export default function LedControlScreen() {
  const t = useTokens();
  const { settings, loading } = useSettings();

  const transport = useMemo(
    () => (loading ? null : new LedBleTransport(settings.bleDeviceName)),
    [loading, settings.bleDeviceName],
  );
  useEffect(
    () => () => {
      void transport?.disconnect();
    },
    [transport],
  );

  const status = useBleStatus(transport);
  const isConnected = status.state === 'connected';

  // Optimistic UI: reflect the tapped mode instantly, then defer to the
  // ESP32's confirmed state via the NOTIFY characteristic.
  const [optimisticMode, setOptimisticMode] = useState<LedMode | null>(null);
  useEffect(() => {
    if (status.currentMode !== undefined) setOptimisticMode(null);
  }, [status.currentMode]);
  const displayedMode = optimisticMode ?? status.currentMode;

  const setMode = useCallback(
    (mode: LedMode) => {
      if (!transport || !isConnected) return;
      setOptimisticMode(mode);
      transport.setMode(mode);
    },
    [transport, isConnected],
  );

  const connect = useCallback(async () => {
    if (!transport) return;
    try {
      await transport.connect();
    } catch {
      /* transport already set to error */
    }
  }, [transport]);

  const disconnect = useCallback(async () => {
    if (!transport) return;
    await transport.disconnect();
  }, [transport]);

  return (
    <View style={[styles.root, { backgroundColor: t.colors.bg }]}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}>
          <Header status={status} deviceName={settings.bleDeviceName} />

          <View style={styles.hero}>
            <LedBulb mode={displayedMode} size={240} />
          </View>

          <View style={styles.modeMeta}>
            <Text style={[styles.modeName, { color: t.colors.text }]}>
              {ledModeLabel(displayedMode ?? LedMode.Off)}
            </Text>
            <Text style={[styles.modeDesc, { color: t.colors.textMuted }]}>
              {modeDescription(displayedMode)}
            </Text>
          </View>

          <ModeGrid
            selected={displayedMode}
            disabled={!isConnected}
            onSelect={setMode}
            pending={optimisticMode !== null}
          />
        </ScrollView>

        <View style={styles.actions}>
          <PrimaryButton
            variant={isConnected ? 'ghost' : 'accent'}
            label={
              isConnected
                ? 'Disconnect'
                : status.state === 'connecting'
                  ? 'Connecting…'
                  : 'Connect'
            }
            onPress={isConnected ? disconnect : connect}
            disabled={status.state === 'connecting' || !transport}
          />
        </View>
      </SafeAreaView>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function Header({ status, deviceName }: { status: BleStatus; deviceName: string }) {
  const t = useTokens();
  return (
    <View style={styles.header}>
      <View>
        <Text style={[styles.eyebrow, { color: t.colors.textMuted }]}>
          Hands-On Robotics
        </Text>
        <Text style={[styles.title, { color: t.colors.text }]}>Nightlight</Text>
      </View>
      <StatusChip status={status} label={deviceName} />
    </View>
  );
}

function StatusChip({ status, label }: { status: BleStatus; label: string }) {
  const t = useTokens();
  const palette: Record<
    BleStatus['state'],
    { dot: string; text: string; bg: string; label: string }
  > = {
    disconnected: {
      dot: t.colors.textMuted,
      text: t.colors.textMuted,
      bg: t.colors.surface,
      label: 'Idle',
    },
    connecting: {
      dot: t.colors.warning,
      text: t.colors.text,
      bg: t.colors.surface,
      label: 'Connecting',
    },
    connected: {
      dot: t.colors.success,
      text: t.colors.text,
      bg: t.colors.surface,
      label: 'Connected',
    },
    error: {
      dot: t.colors.danger,
      text: t.colors.danger,
      bg: t.colors.surface,
      label: 'Error',
    },
  };
  const p = palette[status.state];
  return (
    <View
      style={[
        styles.chip,
        {
          backgroundColor: p.bg,
          borderColor: t.colors.border,
        },
        t.shadows.card,
      ]}>
      <View style={[styles.chipDot, { backgroundColor: p.dot }]} />
      <View>
        <Text style={[styles.chipLabel, { color: p.text }]}>{p.label}</Text>
        <Text style={[styles.chipSub, { color: t.colors.textMuted }]} numberOfLines={1}>
          {status.state === 'error' ? (status.error ?? 'unknown') : label}
        </Text>
      </View>
    </View>
  );
}

interface ModeGridProps {
  selected: LedMode | undefined;
  disabled: boolean;
  pending: boolean;
  onSelect: (mode: LedMode) => void;
}

function ModeGrid({ selected, disabled, pending, onSelect }: ModeGridProps) {
  return (
    <View style={styles.grid}>
      {LED_MODES.map((mode) => (
        <ModeCard
          key={mode}
          mode={mode}
          active={selected === mode}
          disabled={disabled}
          pending={pending && selected === mode}
          onPress={() => onSelect(mode)}
        />
      ))}
    </View>
  );
}

function ModeCard({
  mode,
  active,
  disabled,
  pending,
  onPress,
}: {
  mode: LedMode;
  active: boolean;
  disabled: boolean;
  pending: boolean;
  onPress: () => void;
}) {
  const t = useTokens();
  const hint = modeHint(mode);
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: active ? t.colors.accent : t.colors.surface,
          borderColor: active ? t.colors.accent : t.colors.border,
        },
        active ? t.shadows.cardActive : t.shadows.card,
        pressed && !disabled && styles.cardPressed,
        disabled && styles.cardDisabled,
      ]}>
      <View style={styles.cardTop}>
        <ModeGlyph mode={mode} color={active ? t.colors.textInverse : t.colors.text} />
        {pending ? (
          <Text
            style={[
              styles.cardPending,
              { color: active ? t.colors.textInverse : t.colors.textMuted },
            ]}>
            sending…
          </Text>
        ) : null}
      </View>
      <View>
        <Text
          style={[
            styles.cardLabel,
            { color: active ? t.colors.textInverse : t.colors.text },
          ]}>
          {ledModeLabel(mode)}
        </Text>
        <Text
          style={[
            styles.cardHint,
            {
              color: active
                ? withOpacity(t.colors.textInverse, 0.72)
                : t.colors.textMuted,
            },
          ]}>
          {hint}
        </Text>
      </View>
    </Pressable>
  );
}

/** Small glyph so each card is recognisable at a glance without an icon set. */
function ModeGlyph({ mode, color }: { mode: LedMode; color: string }) {
  const dot = <View style={[styles.glyphDot, { backgroundColor: color }]} />;
  const dotHollow = (
    <View style={[styles.glyphDot, { borderWidth: 2, borderColor: color }]} />
  );
  const small = (
    <View
      style={[styles.glyphDotSmall, { backgroundColor: color }]}
    />
  );
  switch (mode) {
    case LedMode.Off:
      return dotHollow;
    case LedMode.On:
      return dot;
    case LedMode.Slow:
      return (
        <View style={styles.glyphRow}>
          {dot}
          {dotHollow}
        </View>
      );
    case LedMode.Fast:
      return (
        <View style={styles.glyphRow}>
          {small}
          {small}
          {small}
        </View>
      );
  }
}

function modeHint(mode: LedMode): string {
  switch (mode) {
    case LedMode.Off:
      return 'Dark';
    case LedMode.On:
      return 'Steady';
    case LedMode.Slow:
      return '500 ms';
    case LedMode.Fast:
      return '100 ms';
  }
}

// ---------------------------------------------------------------------------

function PrimaryButton({
  label,
  onPress,
  disabled,
  variant,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  variant: 'accent' | 'ghost';
}) {
  const t = useTokens();
  const isAccent = variant === 'accent';
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.primaryBtn,
        isAccent
          ? { backgroundColor: t.colors.accent }
          : {
              backgroundColor: t.colors.surface,
              borderWidth: 1,
              borderColor: t.colors.border,
            },
        isAccent ? t.shadows.cardActive : t.shadows.card,
        pressed && !disabled && styles.primaryBtnPressed,
        disabled && styles.primaryBtnDisabled,
      ]}>
      <Text
        style={[
          styles.primaryBtnLabel,
          { color: isAccent ? t.colors.textInverse : t.colors.text },
        ]}>
        {label}
      </Text>
    </Pressable>
  );
}

// ---------------------------------------------------------------------------
// utils
// ---------------------------------------------------------------------------

function withOpacity(hex: string, alpha: number): string {
  // Cheap alpha for hex colours; works for the palette we ship.
  const clamped = Math.round(Math.max(0, Math.min(1, alpha)) * 255)
    .toString(16)
    .padStart(2, '0');
  return `${hex}${clamped}`;
}

// ---------------------------------------------------------------------------
// styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
  scroll: {
    paddingHorizontal: 20,
    paddingBottom: 12,
    gap: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginTop: 8,
    gap: 12,
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -0.6,
  },
  chip: {
    borderRadius: 999,
    borderWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    maxWidth: 200,
  },
  chipDot: { width: 10, height: 10, borderRadius: 5 },
  chipLabel: { fontSize: 13, fontWeight: '700', letterSpacing: -0.1 },
  chipSub: { fontSize: 11, fontWeight: '500' },

  hero: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  modeMeta: {
    alignItems: 'center',
    gap: 6,
  },
  modeName: {
    fontSize: 34,
    fontWeight: '700',
    letterSpacing: -0.8,
  },
  modeDesc: {
    fontSize: 15,
    fontWeight: '500',
  },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 12,
  },
  card: {
    width: '48%',
    minHeight: 118,
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    justifyContent: 'space-between',
  },
  cardPressed: { transform: [{ scale: 0.98 }] },
  cardDisabled: { opacity: 0.55 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardLabel: { fontSize: 20, fontWeight: '700', letterSpacing: -0.3 },
  cardHint: { fontSize: 13, fontWeight: '500', marginTop: 2 },
  cardPending: { fontSize: 11, fontWeight: '600', letterSpacing: 0.6, textTransform: 'uppercase' },

  glyphRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  glyphDot: { width: 14, height: 14, borderRadius: 7 },
  glyphDotSmall: { width: 6, height: 14, borderRadius: 3 },

  actions: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 8,
  },
  primaryBtn: {
    height: 56,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  primaryBtnPressed: { opacity: 0.85 },
  primaryBtnDisabled: { opacity: 0.5 },
  primaryBtnLabel: {
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
});
