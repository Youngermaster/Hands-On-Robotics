// Settings screen — pick transport mode, edit endpoints, persisted via AsyncStorage.

import { Platform, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useSettings } from '@/hooks/use-settings';
import { useTheme } from '@/hooks/use-theme';

export default function SettingsScreen() {
  const { settings, update, loading } = useSettings();
  const insets = useSafeAreaInsets();
  const theme = useTheme();

  const contentInsets = {
    ...insets,
    bottom: insets.bottom + BottomTabInset + Spacing.three,
  };
  const contentPlatformStyle = Platform.select({
    android: {
      paddingTop: contentInsets.top,
      paddingLeft: contentInsets.left,
      paddingRight: contentInsets.right,
      paddingBottom: contentInsets.bottom,
    },
    web: { paddingTop: Spacing.six, paddingBottom: Spacing.four },
  });

  if (loading) {
    return (
      <ThemedView style={styles.loading}>
        <ThemedText>loading…</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ScrollView
      style={[styles.scrollView, { backgroundColor: theme.background }]}
      contentInset={contentInsets}
      contentContainerStyle={[styles.contentContainer, contentPlatformStyle]}>
      <ThemedView style={styles.container}>
        <ThemedText type="subtitle">Transport</ThemedText>
        <View style={styles.modeRow}>
          <ModeChip
            label="Wi-Fi (WebSocket)"
            active={settings.mode === 'wifi'}
            onPress={() => update('mode', 'wifi')}
          />
          <ModeChip
            label="BLE"
            active={settings.mode === 'ble'}
            onPress={() => update('mode', 'ble')}
          />
        </View>

        <ThemedView style={styles.section}>
          <ThemedText type="subtitle">Wi-Fi server URL</ThemedText>
          <ThemedText type="small" style={styles.hint}>
            Look at the ESP32 serial monitor for the IP. Format: ws://&lt;ip&gt;:81/
          </ThemedText>
          <SettingsInput
            value={settings.serverUrl}
            onChange={(v) => update('serverUrl', v)}
            placeholder="ws://192.168.1.123:81/"
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
          />
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText type="subtitle">BLE device name</ThemedText>
          <ThemedText type="small" style={styles.hint}>
            Exact name advertised by the firmware (default: HOR-Car-BLE).
            BLE requires a custom dev build — see the app README.
          </ThemedText>
          <SettingsInput
            value={settings.bleDeviceName}
            onChange={(v) => update('bleDeviceName', v)}
            placeholder="HOR-Car-BLE"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText type="subtitle">About</ThemedText>
          <ThemedText type="small" style={styles.hint}>
            Hands-On-Robotics · Module 07 · drives the two ESP32 firmwares
            in `modules/07-robot-car/`.
          </ThemedText>
        </ThemedView>
      </ThemedView>
    </ScrollView>
  );
}

// --- Sub-components ---------------------------------------------------------

interface ModeChipProps {
  label: string;
  active: boolean;
  onPress: () => void;
}
function ModeChip({ label, active, onPress }: ModeChipProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        active && styles.chipActive,
        pressed && styles.chipPressed,
      ]}>
      <ThemedText type="smallBold" style={active ? styles.chipLabelActive : styles.chipLabel}>
        {label}
      </ThemedText>
    </Pressable>
  );
}

interface SettingsInputProps {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  autoCapitalize?: 'none' | 'sentences';
  autoCorrect?: boolean;
  keyboardType?: 'default' | 'url' | 'email-address';
}

function SettingsInput({ value, onChange, ...rest }: SettingsInputProps) {
  const theme = useTheme();
  return (
    <TextInput
      value={value}
      onChangeText={onChange}
      style={[styles.input, { color: theme.text, borderColor: theme.backgroundElement }]}
      placeholderTextColor={theme.textSecondary}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scrollView: { flex: 1 },
  contentContainer: { flexDirection: 'row', justifyContent: 'center' },
  container: {
    maxWidth: MaxContentWidth,
    flexGrow: 1,
    paddingHorizontal: Spacing.four,
    gap: Spacing.four,
    paddingTop: Spacing.four,
  },
  section: { gap: Spacing.two },
  modeRow: { flexDirection: 'row', gap: Spacing.two },
  chip: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#374151',
  },
  chipActive: { backgroundColor: '#2563eb', borderColor: '#2563eb' },
  chipPressed: { opacity: 0.85 },
  chipLabel: { color: '#94a3b8' },
  chipLabelActive: { color: '#fff' },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: Spacing.three,
    fontFamily: 'monospace',
    fontSize: 14,
  },
  hint: { opacity: 0.7 },
});
