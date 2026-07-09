// LED Control screen — composes design primitives and LED feature pieces.
// This file owns *only* orchestration: transport lifecycle, optimistic
// state, and layout. Everything visual lives in @/design and @/features.

import { useCallback, useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LedBulb } from '@/design/led-bulb';
import { PillButton } from '@/design/pill-button';
import { ScreenHeader } from '@/design/screen-header';
import { useTokens } from '@/design/tokens';
import { BodyMuted, DisplayName } from '@/design/typography';
import { BleStatusChip } from '@/features/led/ble-status-chip';
import { ModeGrid } from '@/features/led/mode-grid';
import { useSettings } from '@/hooks/use-settings';
import { LedMode, ledModeDescription, ledModeLabel } from '@/protocol/led';
import { LedBleTransport } from '@/transports/ble';
import { useBleStatus } from '@/transports/useTransport';

export default function LedControlScreen() {
  const t = useTokens();
  const { settings, loading } = useSettings();

  const transport = useMemo(
    () => (loading ? null : new LedBleTransport(settings.bleDeviceName)),
    [loading, settings.bleDeviceName],
  );
  useEffect(() => () => void transport?.disconnect(), [transport]);

  const status = useBleStatus(transport);
  const isConnected = status.state === 'connected';

  // Optimistic UI: reflect the tapped mode instantly; drop the overlay
  // once the ESP32's NOTIFY confirms.
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
          <ScreenHeader
            eyebrow="Hands-On Robotics"
            title="Nightlight"
            trailing={<BleStatusChip status={status} name={settings.bleDeviceName} />}
          />

          <View style={styles.hero}>
            <LedBulb mode={displayedMode} size={240} />
          </View>

          <View style={styles.modeMeta}>
            <DisplayName>{ledModeLabel(displayedMode ?? LedMode.Off)}</DisplayName>
            <BodyMuted>{ledModeDescription(displayedMode)}</BodyMuted>
          </View>

          <ModeGrid
            selected={displayedMode}
            disabled={!isConnected}
            pending={optimisticMode !== null}
            onSelect={setMode}
          />
        </ScrollView>

        <View style={styles.actions}>
          <PillButton
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

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
  scroll: {
    paddingHorizontal: 20,
    paddingBottom: 12,
    gap: 24,
  },
  hero: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  modeMeta: {
    alignItems: 'center',
    gap: 6,
  },
  actions: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 8,
  },
});
