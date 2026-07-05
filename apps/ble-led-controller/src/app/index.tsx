// LED Control screen — pick a mode, watch the ESP32's confirmed state,
// connect / disconnect the BLE transport.

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useSettings } from '@/hooks/use-settings';
import { LED_MODES, LedMode, ledModeColor, ledModeLabel } from '@/protocol/led';
import { LedBleTransport, type BleStatus } from '@/transports/ble';
import { useBleStatus } from '@/transports/useTransport';

export default function LedControlScreen() {
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

  const [optimisticMode, setOptimisticMode] = useState<LedMode | null>(null);
  // Whenever the ESP32 confirms a mode, drop our optimistic overlay.
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
      // Status already reflects the error via the transport's own setter.
    }
  }, [transport]);

  const disconnect = useCallback(async () => {
    if (!transport) return;
    await transport.disconnect();
  }, [transport]);

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedText type="title" style={styles.title}>
          LED Control
        </ThemedText>

        <StatusBadge status={status} />

        <ModeGrid
          selected={displayedMode}
          disabled={!isConnected}
          onSelect={setMode}
          isPending={optimisticMode !== null}
        />

        <View style={styles.actions}>
          {!isConnected ? (
            <ActionButton
              label={status.state === 'connecting' ? 'Connecting…' : 'Connect'}
              onPress={connect}
              disabled={status.state === 'connecting' || !transport}
              kind="primary"
            />
          ) : (
            <ActionButton label="Disconnect" onPress={disconnect} kind="secondary" />
          )}
        </View>

        <ThemedText type="small" style={styles.hint}>
          The ESP32 keeps its last-set mode after you disconnect.
        </ThemedText>
      </SafeAreaView>
    </ThemedView>
  );
}

// --- Sub-components ---------------------------------------------------------

function StatusBadge({ status }: { status: BleStatus }) {
  const palette = {
    disconnected: { bg: '#475569', label: 'disconnected' },
    connecting: { bg: '#d97706', label: 'connecting…' },
    connected: { bg: '#16a34a', label: 'connected' },
    error: { bg: '#dc2626', label: 'error' },
  } as const;
  const p = palette[status.state];
  return (
    <View style={[styles.badge, { backgroundColor: p.bg }]}>
      <ThemedText type="smallBold" style={styles.badgeText}>
        {p.label}
      </ThemedText>
      {status.detail ? (
        <ThemedText type="small" style={styles.badgeText}>
          {status.detail}
        </ThemedText>
      ) : null}
      {status.error ? (
        <ThemedText type="small" style={styles.badgeText}>
          {status.error}
        </ThemedText>
      ) : null}
    </View>
  );
}

interface ModeGridProps {
  selected: LedMode | undefined;
  disabled: boolean;
  onSelect: (mode: LedMode) => void;
  isPending: boolean;
}

function ModeGrid({ selected, disabled, onSelect, isPending }: ModeGridProps) {
  return (
    <View style={styles.grid}>
      {LED_MODES.map((mode) => {
        const active = selected === mode;
        return (
          <Pressable
            key={mode}
            disabled={disabled}
            onPress={() => onSelect(mode)}
            style={({ pressed }) => [
              styles.tile,
              { borderColor: ledModeColor(mode) },
              active && { backgroundColor: ledModeColor(mode) },
              pressed && styles.tilePressed,
              disabled && styles.tileDisabled,
            ]}>
            <ThemedText
              type="smallBold"
              style={[styles.tileLabel, active && styles.tileLabelActive]}>
              {ledModeLabel(mode)}
            </ThemedText>
            {active && isPending ? (
              <ThemedText type="small" style={styles.tileHint}>
                sending…
              </ThemedText>
            ) : null}
          </Pressable>
        );
      })}
    </View>
  );
}

interface ActionButtonProps {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  kind: 'primary' | 'secondary';
}

function ActionButton({ label, onPress, disabled, kind }: ActionButtonProps) {
  const bg = kind === 'primary' ? '#2563eb' : '#475569';
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: bg },
        pressed && styles.buttonPressed,
        disabled && styles.buttonDisabled,
      ]}>
      <ThemedText type="smallBold" style={styles.buttonLabel}>
        {label}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.four,
    gap: Spacing.three,
  },
  title: { textAlign: 'center' },
  badge: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: 8,
    alignItems: 'center',
    minWidth: 220,
  },
  badgeText: { color: '#fff', textAlign: 'center' },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: Spacing.three,
    marginTop: Spacing.three,
  },
  tile: {
    width: 140,
    height: 100,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.one,
  },
  tilePressed: { opacity: 0.8 },
  tileDisabled: { opacity: 0.4 },
  tileLabel: { color: '#94a3b8' },
  tileLabelActive: { color: '#fff' },
  tileHint: { color: '#fff', opacity: 0.85 },
  actions: {
    flexDirection: 'row',
    gap: Spacing.three,
    marginTop: Spacing.three,
  },
  button: {
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    borderRadius: 8,
    minWidth: 160,
    alignItems: 'center',
  },
  buttonPressed: { opacity: 0.85 },
  buttonDisabled: { opacity: 0.5 },
  buttonLabel: { color: '#fff' },
  hint: { opacity: 0.7, textAlign: 'center', marginTop: Spacing.two },
});
