// Expandable "Discover nearby devices" panel for the Settings screen.
//
// Composes design primitives (PillButton, Card, typography) with the
// scanner hook. Selecting a device fires `onPick(name)` — the parent
// writes it into settings and the panel collapses.

import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { Card } from '@/design/card';
import { PillButton } from '@/design/pill-button';
import { useTokens } from '@/design/tokens';
import { Body, BodyMuted, Caption, Mono } from '@/design/typography';
import type { DiscoveredDevice } from '@/transports/ble-scanner';
import { useLedScanner } from '@/transports/use-scanner';

export interface DiscoverPanelProps {
  currentName: string;
  onPick: (name: string) => void;
}

export function DiscoverPanel({ currentName, onPick }: DiscoverPanelProps) {
  const [open, setOpen] = useState(false);
  const { snapshot, start, stop } = useLedScanner();

  const toggle = () => {
    if (!open) {
      setOpen(true);
      start();
    } else {
      stop();
      setOpen(false);
    }
  };

  return (
    <View style={styles.wrap}>
      <PillButton
        label={open ? 'Cancel scan' : 'Discover nearby devices'}
        onPress={toggle}
        variant="ghost"
      />

      {open ? (
        <Card>
          <ScanHeader state={snapshot.state} error={snapshot.error} />
          <DeviceList
            devices={snapshot.devices}
            currentName={currentName}
            onPick={(name) => {
              stop();
              setOpen(false);
              onPick(name);
            }}
          />
        </Card>
      ) : null}
    </View>
  );
}

// --- Sub-components ---------------------------------------------------------

function ScanHeader({ state, error }: { state: string; error?: string }) {
  const t = useTokens();
  if (state === 'scanning') {
    return (
      <View style={styles.headerRow}>
        <ActivityIndicator color={t.colors.accent} />
        <BodyMuted>Scanning for HOR-LED-BLE devices…</BodyMuted>
      </View>
    );
  }
  if (state === 'error') {
    return <BodyMuted style={{ color: t.colors.danger }}>{error ?? 'Scan failed.'}</BodyMuted>;
  }
  return <Caption>Scan idle.</Caption>;
}

function DeviceList({
  devices,
  currentName,
  onPick,
}: {
  devices: DiscoveredDevice[];
  currentName: string;
  onPick: (name: string) => void;
}) {
  if (devices.length === 0) {
    return (
      <BodyMuted>
        No devices yet. Make sure the ESP32 is powered and advertising, then wait a few
        seconds.
      </BodyMuted>
    );
  }
  return (
    <View style={styles.list}>
      {devices.map((d) => (
        <DeviceRow key={d.id} device={d} isCurrent={d.name === currentName} onPick={onPick} />
      ))}
    </View>
  );
}

function DeviceRow({
  device,
  isCurrent,
  onPick,
}: {
  device: DiscoveredDevice;
  isCurrent: boolean;
  onPick: (name: string) => void;
}) {
  const t = useTokens();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Select ${device.name}`}
      onPress={() => onPick(device.name)}
      style={({ pressed }) => [
        styles.row,
        {
          backgroundColor: isCurrent ? t.colors.accentSoft : t.colors.surfaceSubtle,
          borderColor: isCurrent ? t.colors.accent : t.colors.border,
        },
        pressed && styles.rowPressed,
      ]}>
      <View style={styles.rowText}>
        <Body>{device.name}</Body>
        <Mono>{device.id}</Mono>
      </View>
      <View style={styles.rowRight}>
        <BodyMuted>
          {device.rssi !== null ? `${device.rssi} dBm` : '—'}
        </BodyMuted>
        {isCurrent ? <Caption>Selected</Caption> : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 12 },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  list: { gap: 8 },
  row: {
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  rowPressed: { opacity: 0.85 },
  rowText: { flexShrink: 1 },
  rowRight: { alignItems: 'flex-end', gap: 2 },
});
