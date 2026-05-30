// BLE LED Controller — home screen.
//
// SCAFFOLD: tapping the button just toggles a UI indicator and logs to the
// console. The real BLE GATT call (write to the ESP32's LED characteristic)
// lands with Module 06 — for now the surface area exists so we can iterate
// on layout / state without committing to a BLE library yet.

import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';

// TODO(Module 06): replace with a real react-native-ble-plx GATT write to
// the ESP32 GATT LED service / characteristic.
async function writeLedState(on: boolean): Promise<void> {
  console.log(`[ble-stub] would write LED=${on ? 'on' : 'off'} to GATT characteristic`);
}

export default function HomeScreen() {
  const [ledOn, setLedOn] = useState(false);
  const [busy, setBusy] = useState(false);

  const toggle = useCallback(async () => {
    if (busy) return;
    const next = !ledOn;
    setBusy(true);
    try {
      await writeLedState(next);
      setLedOn(next);
    } finally {
      setBusy(false);
    }
  }, [busy, ledOn]);

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedText type="title" style={styles.title}>
          BLE LED Controller
        </ThemedText>

        <View
          style={[
            styles.indicator,
            { backgroundColor: ledOn ? '#22c55e' : '#475569' },
          ]}
          accessibilityLabel={ledOn ? 'LED is on' : 'LED is off'}
        />

        <ThemedText type="default" style={styles.status}>
          {ledOn ? 'LED ON' : 'LED OFF'}
        </ThemedText>

        <Pressable
          accessibilityRole="button"
          onPress={toggle}
          style={({ pressed }) => [
            styles.button,
            pressed && styles.buttonPressed,
            busy && styles.buttonDisabled,
          ]}>
          <ThemedText type="defaultSemiBold" style={styles.buttonLabel}>
            Toggle
          </ThemedText>
        </Pressable>

        <ThemedText type="small" style={styles.note}>
          Stub mode — Module 06 hooks this up to the ESP32 over BLE.
        </ThemedText>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.three,
    paddingHorizontal: Spacing.four,
  },
  title: {
    textAlign: 'center',
  },
  indicator: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginTop: Spacing.four,
  },
  status: {
    fontSize: 18,
  },
  button: {
    marginTop: Spacing.three,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    borderRadius: Spacing.three,
    backgroundColor: '#2563eb',
  },
  buttonPressed: {
    opacity: 0.85,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonLabel: {
    color: '#fff',
  },
  note: {
    marginTop: Spacing.three,
    textAlign: 'center',
    opacity: 0.7,
  },
});
