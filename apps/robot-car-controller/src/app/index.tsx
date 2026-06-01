// Drive screen — main UX. Picks a transport based on settings, lets you
// connect/disconnect, shows status, exposes joystick + e-stop.

import { useCallback, useEffect, useMemo, useRef } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Joystick } from '@/components/joystick';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useSettings } from '@/hooks/use-settings';
import { mixDifferentialDrive } from '@/protocol/drive';
import { BleTransport } from '@/transports/ble';
import type { Transport, TransportStatus } from '@/transports/types';
import { useTransportStatus } from '@/transports/useTransport';
import { WebSocketTransport } from '@/transports/websocket';

// 20 Hz: well below BLE write-queue saturation, fast enough to feel live.
const SEND_INTERVAL_MS = 50;

export default function DriveScreen() {
  const { settings, loading } = useSettings();

  // Build the right transport for the current mode whenever it (or the
  // relevant address) changes. Tearing down the previous one stops sends
  // and disconnects cleanly.
  const transport = useMemo<Transport | null>(() => {
    if (loading) return null;
    return settings.mode === 'wifi'
      ? new WebSocketTransport(settings.serverUrl)
      : new BleTransport(settings.bleDeviceName);
  }, [loading, settings.mode, settings.serverUrl, settings.bleDeviceName]);

  useEffect(
    () => () => {
      // Cleanup when the transport instance changes or the screen unmounts.
      void transport?.disconnect();
    },
    [transport],
  );

  const status = useTransportStatus(transport);

  // Latest joystick state lives in a ref so the send interval reads the
  // newest value without re-creating the interval on every joystick tick.
  const lastJoyRef = useRef({ x: 0, y: 0 });
  const handleJoystick = useCallback((x: number, y: number) => {
    lastJoyRef.current = { x, y };
  }, []);

  // 20 Hz send loop while connected. Sends zeros when idle so the ESP32
  // watchdog stays satisfied and the car responds immediately on touch.
  useEffect(() => {
    if (!transport || status.state !== 'connected') return;
    const id = setInterval(() => {
      const { x, y } = lastJoyRef.current;
      const { left, right } = mixDifferentialDrive(x, y);
      transport.send(left, right);
    }, SEND_INTERVAL_MS);
    return () => clearInterval(id);
  }, [transport, status.state]);

  const connect = useCallback(async () => {
    if (!transport) return;
    try {
      await transport.connect();
    } catch {
      // Status will already be set to `error` by the transport.
    }
  }, [transport]);

  const disconnect = useCallback(async () => {
    if (!transport) return;
    transport.send(0, 0); // explicit stop on the way out
    await transport.disconnect();
  }, [transport]);

  const eStop = useCallback(() => {
    lastJoyRef.current = { x: 0, y: 0 };
    transport?.send(0, 0);
  }, [transport]);

  const isConnected = status.state === 'connected';

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedText type="title" style={styles.title}>
          {settings.mode === 'wifi' ? 'Wi-Fi mode' : 'BLE mode'}
        </ThemedText>

        <StatusBadge status={status} />

        <View style={styles.joystickWrap}>
          <Joystick size={260} disabled={!isConnected} onChange={handleJoystick} />
        </View>

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
          <ActionButton label="E-stop" onPress={eStop} kind="danger" disabled={!isConnected} />
        </View>

        <ThemedText type="small" style={styles.hint}>
          Switch transport in Settings. Frames sent at 20 Hz.
        </ThemedText>
      </SafeAreaView>
    </ThemedView>
  );
}

// --- Sub-components ---------------------------------------------------------

function StatusBadge({ status }: { status: TransportStatus }) {
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

interface ActionButtonProps {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  kind: 'primary' | 'secondary' | 'danger';
}

function ActionButton({ label, onPress, disabled, kind }: ActionButtonProps) {
  const bg = { primary: '#2563eb', secondary: '#475569', danger: '#dc2626' }[kind];
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
    minWidth: 200,
  },
  badgeText: { color: '#fff', textAlign: 'center' },
  joystickWrap: { marginTop: Spacing.three },
  actions: {
    flexDirection: 'row',
    gap: Spacing.three,
    marginTop: Spacing.three,
  },
  button: {
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    borderRadius: 8,
    minWidth: 120,
    alignItems: 'center',
  },
  buttonPressed: { opacity: 0.85 },
  buttonDisabled: { opacity: 0.5 },
  buttonLabel: { color: '#fff' },
  hint: { opacity: 0.7, textAlign: 'center', marginTop: Spacing.two },
});
